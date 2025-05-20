import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import HeaderAdmin from '../components/headerAdmin';
import dashImage from "../assets/images/meallsss.jpg";
import { FaUsers, FaUtensils, FaShoppingBag, FaDollarSign} from 'react-icons/fa';
import { Line, Bar} from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FiTrendingUp } from 'react-icons/fi';
import { BsGraphUp, BsThreeDotsVertical } from 'react-icons/bs';
import { END_POINTS } from '../api/endPoints';
import axios from 'axios';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          customersRes, 
          ordersRes, 
          // mealsRes,
        ] = await Promise.all([
          axios.get(END_POINTS.GET_CUSTOMER_DETAILS),
          axios.get(END_POINTS.GET_ORDER_DETAILS),
          axios.get(END_POINTS.GET_MEAL_DETAILS),
        ]);

        // Extract data from responses
        const customersData = customersRes.data || [];
        const ordersData = ordersRes.data?.data || [];
        // const mealsData = mealsRes.data?.data || [];

        // Calculate total revenue
        const totalRevenue = Array.isArray(ordersData) ? 
          ordersData.reduce((sum, order) => {
            return sum + (order.payment?.payment_amount || 0);
          }, 0) : 0;

        // Calculate top meals
        const mealOrders = {};
        if (Array.isArray(ordersData)) {
          ordersData.forEach(order => {
            if (Array.isArray(order.cart_items)) {
              order.cart_items.forEach(item => {
                if (!mealOrders[item.meal_name]) {
                  mealOrders[item.meal_name] = 0;
                }
                mealOrders[item.meal_name] += item.quantity || 0;
              });
            }
          });
        }

        const topMeals = Object.entries(mealOrders)
          .map(([meal, orders]) => ({ meal, orders }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5);

        // Update state with total customers count
        setSummary(prev => ({
          ...prev,
          totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
          totalCustomers: Array.isArray(customersData) ? customersData.length : 0,
          totalRevenue
        }));

        setTopMeals(topMeals);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  const orderTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: [120, 190, 140, 210, 160, 220],
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: [125000, 190000, 140000, 210000, 160000, 220000],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin />
        <div className="relative h-64 overflow-hidden">
          <img 
            src={dashImage} 
            alt="Meal banner" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-80"></div>
          <div className="absolute inset-0 flex items-center pl-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="p-8 flex flex-col gap-8 overflow-y-auto">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Meals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalMeals}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaUtensils className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>12% from last month</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FaShoppingBag className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>8% from last month</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalCustomers}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FaUsers className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>5% from last month</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    LKR {summary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaDollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <FiTrendingUp className="mr-1" />
                <span>15% from last month</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Popular Meals</h2>
                <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <BsThreeDotsVertical />
                </div>
              </div>
              <div className="space-y-5">
                {topMeals.map((meal, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="relative w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{meal.meal}</span>
                        <span className="text-sm font-medium text-gray-500">{meal.orders} orders</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(meal.orders / (topMeals[0]?.orders || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {topMeals.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No meal data available</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Order Analytics</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <BsGraphUp className="mr-1" />
                  <span>Last 6 months</span>
                </div>
              </div>
              <div className="h-80">
                <Line data={orderTrendData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Revenue Analytics</h2>
                <div className="flex items-center text-sm text-green-600">
                  <FiTrendingUp className="mr-1" />
                  <span>15% growth</span>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={revenueData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        ticks: {
                          callback: function(value) {
                            return 'LKR ' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;