import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import HeaderAdmin from '../components/headerAdmin';
import dashImage from "../assets/images/meallsss.jpg";
import { FaUsers, FaUtensils, FaShoppingBag, FaDollarSign } from 'react-icons/fa';
import { GiMuscleUp, GiRunningShoe, GiWeightLiftingUp, GiMeal } from 'react-icons/gi';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, BarElement, Title, ArcElement } from 'chart.js';
import { END_POINTS } from '../api/endPoints';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  ArcElement
);

const DashboardAdmin = () => {
  const [summary, setSummary] = useState({
    totalMeals: 14, 
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [topMeals, setTopMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [calorieSegments, setCalorieSegments] = useState([]);

  const calculateTotalRevenue = (orders) => {
    if (!Array.isArray(orders)) return 0;
    return orders.reduce((sum, order) => sum + (order.payment?.payment_amount || 0), 0);
  };

  const getTopMeals = (orders, meals) => {
    if (!Array.isArray(orders)) return [];

    const mealOrders = {};
    orders.forEach(order => {
      if (Array.isArray(order.cart_items)) {
        order.cart_items.forEach(item => {
          const name = item.meal_name || "Unknown";
          const quantity = item.quantity || 0;

          if (!mealOrders[name]) {
            mealOrders[name] = { name, quantity: 0 };
          }
          mealOrders[name].quantity += quantity;
        });
      }
    });

    const enrichedMeals = Object.values(mealOrders)
      .map(meal => {
        const matchingMeal = meals.find(m => m.meal_name === meal.name);
        if (!matchingMeal) return null;
        return {
          meal: meal.name,
          orders: meal.quantity,
          image: matchingMeal.meal_image,
        };
      })
      .filter(meal => meal !== null);

    return enrichedMeals.sort((a, b) => b.orders - a.orders).slice(0, 5);
  };

  const getActiveOrders = (orders) => {
    if (!Array.isArray(orders)) return [];

    return orders.filter(order => {
      const status = (order.order_status || '').toLowerCase();
      return ['pending'].includes(status);
    });
  };

  const getOrderStatusCounts = (orders) => {
    const counts = {
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      const status = (order.order_status || '').toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return Object.entries(counts).map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
    }));
  };

  const getCalorieSegments = (orders, meals) => {
    if (!Array.isArray(orders) || !Array.isArray(meals)) return [];
    
    const mealCalories = {};
    meals.forEach(meal => {
      mealCalories[meal.meal_name] = meal.calorie_count || 0;
    });

    const customerCalories = {};
    
    orders.forEach(order => {
      const customerId = order.customer?._id || order.customer;
      if (!customerId) {
        console.warn('Order missing customer:', order._id);
        return;
      }
      
      let totalCalories = 0;
      let totalItems = 0;
      
      if (Array.isArray(order.cart_items)) {
        order.cart_items.forEach(item => {
          const calories = mealCalories[item.meal_name] || 0;
          totalCalories += calories * (item.quantity || 1);
          totalItems += item.quantity || 1;
        });
      }
      
      
      const avgCalories = totalItems > 0 ? Math.round(totalCalories / totalItems) : 0;
      
      if (!customerCalories[customerId]) {
        customerCalories[customerId] = {
          totalCalories: 0,
          totalOrders: 0,
          avgCalories: 0
        };
      }
      
      customerCalories[customerId].totalCalories += totalCalories;
      customerCalories[customerId].totalOrders += 1;
      customerCalories[customerId].avgCalories = 
        Math.round(customerCalories[customerId].totalCalories / 
        customerCalories[customerId].totalOrders);
    });

    const segments = {
      'Weight Loss': { count: 0, icon: <GiMeal className="text-blue-500" />, range: 'Under 500', description: 'Customers focusing on weight loss' },
      'Maintenance': { count: 0, icon: <GiRunningShoe className="text-green-500" />, range: '500-800', description: 'Customers maintaining weight' },
      'Muscle Gain': { count: 0, icon: <GiMuscleUp className="text-purple-500" />, range: '800-1000', description: 'Customers building muscle' },
      'Athletes': { count: 0, icon: <GiWeightLiftingUp className="text-red-500" />, range: '1000+', description: 'High-performance athletes' }
    };

    Object.values(customerCalories).forEach(customer => {
      const avg = customer.avgCalories;
      if (avg < 500) segments['Weight Loss'].count++;
      else if (avg >= 500 && avg < 800) segments['Maintenance'].count++;
      else if (avg >= 800 && avg < 1000) segments['Muscle Gain'].count++;
      else if (avg >= 1000) segments['Athletes'].count++;
    });

    return Object.entries(segments).map(([name, data]) => ({
      name,
      count: data.count,
      icon: data.icon,
      range: data.range,
      description: data.description,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [customersRes, ordersRes, mealsRes] = await Promise.all([
          axios.get(END_POINTS.GET_CUSTOMER_DETAILS),
          axios.get(END_POINTS.GET_ORDER_DETAILS),
          axios.get(END_POINTS.GET_MEAL_DETAILS),
        ]);

        const customers = customersRes.data || [];
        const ordersData = ordersRes.data?.data || [];
        const meals = mealsRes.data?.meals || [];

        const totalRevenue = calculateTotalRevenue(ordersData);
        const popularMeals = getTopMeals(ordersData, meals);
        const totalMealsCount = Array.isArray(meals) ? meals.length : 0;
        const statusData = getOrderStatusCounts(ordersData);
        const segments = getCalorieSegments(ordersData, meals);

        setSummary({
          totalMeals: totalMealsCount,
          totalOrders: ordersData.length,
          totalCustomers: customers.length,
          totalRevenue,
        });

        setTopMeals(popularMeals);
        setOrders(ordersData);
        setOrderStatusData(statusData);
        setCalorieSegments(segments);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading dashboard data: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxOrders = topMeals.length > 0 ? Math.max(...topMeals.map(m => m.orders)) : 1;
  const activeOrders = getActiveOrders(orders);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin />
        <div className="relative h-64 overflow-hidden">
          <img src={dashImage} alt="Meal banner" className="w-full h-full object-cover" />
          <div className="bg-gradient-to-r from-gray-900 to-transparent opacity-80"></div>
        </div>

        <div className="p-8 flex flex-col gap-8 overflow-y-auto">

          {/* Dashboard Summary */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <FaUtensils />, label: 'Total Meals', value: summary.totalMeals, bg: 'bg-blue-100', text: 'text-blue-600' },
                { icon: <FaShoppingBag />, label: 'Total Orders', value: summary.totalOrders, bg: 'bg-yellow-100', text: 'text-yellow-600' },
                { icon: <FaUsers />, label: 'Total Customers', value: summary.totalCustomers, bg: 'bg-indigo-100', text: 'text-indigo-600' },
                { icon: <FaDollarSign />, label: 'Total Revenue', value: `LKR ${summary.totalRevenue.toLocaleString()}`, bg: 'bg-green-100', text: 'text-green-600' },
              ].map((card, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-gray-200">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 p-4 ${card.bg} rounded-full ${card.text}`}>
                      {card.icon}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                    <p className="text-3xl font-semibold text-gray-800 mt-1">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Meals + Chart | Active Orders */}
          <section className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Popular Meals + Chart */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
              {/* Popular Meals */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Popular Meals</h2>
                </div>
                <div className="space-y-4">
                  {topMeals.length > 0 ? (
                    topMeals.map((meal, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {meal.image && (
                          <img
                            src={meal.image}
                            alt={meal.meal}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800 truncate">{meal.meal}</span>
                            <span className="text-sm font-medium text-gray-500">{meal.orders} orders</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min((meal.orders / maxOrders) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No meal data available</p>
                  )}
                </div>
              </div>

              {/* Order Status Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
                {orderStatusData.length === 0 ? (
                  <p className="text-gray-500 text-center">No order data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#fbbf24', '#10b981', '#ef4444'][index % 3]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right Column - Active Orders */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-2xl p-6 shadow-lg h-full overflow-x-auto">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Active Orders</h2>
                {activeOrders.length === 0 ? (
                  <p className="text-center text-gray-500">No active orders currently.</p>
                ) : (
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="px-4 py-2">Order ID</th>
                        <th className="px-4 py-2">Items</th>
                        <th className="px-4 py-2">Total Price (LKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.slice(0, 10).map((order, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}
                        >
                          <td className="px-4 py-3 font-mono text-gray-900">
                            #{order._id?.slice(-6)}
                          </td>
                          <td className="px-4 py-3">
                            {Array.isArray(order.cart_items) && order.cart_items.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                                {order.cart_items.map((item, i) => (
                                  <li key={i}>{item.meal_name}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500">No items</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-700">
                            {order.payment?.payment_amount?.toLocaleString() || '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          {/* Customer Nutrition Goals */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Nutrition Goals</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {calorieSegments.length > 0 ? (
                calorieSegments.map((segment, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {segment.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{segment.name}</h3>
                        <p className="text-xs text-gray-500">{segment.range} kcal/meal</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{segment.count} customers</p>
                    <p className="text-xs text-gray-500">{segment.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-4 text-center py-4">No customer nutrition data available</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;