import React from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import HeaderAdmin from '../components/headerAdmin';
// import dashImage from "../assets/images/mealA.jpg";
import dashImage from "../assets/images/meallsss.jpg";
import { FaFire} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

const DashboardAdmin = () => {
  const summary = {
    totalMeals: 150,
    totalOrders: 120,
    totalCustomers: 250,
    activeOrders: 25,
  };

  const activeOrders = [
    { id: '#457', meal: 'Butter Chicken' },
    { id: '#679', meal: 'Chicken And Broccoli' },
    { id: '#796', meal: 'Vegetable Salad' },
    { id: '#801', meal: 'Pasta Primavera' },
    { id: '#802', meal: 'Quinoa Bowl' },
    { id: '#803', meal: 'Tuna Sandwich' },
    { id: '#804', meal: 'Fruit Salad' },
  ];

  const topMeals = [
    { meal: 'Butter Chicken', orders: 45 },
    { meal: 'Chicken And Broccoli', orders: 38 },
    { meal: 'Pasta Primavera', orders: 30 },
  ];

  const topCustomers = [
    { name: 'Dewmi Oshadhi', orders: 25 },
    { name: 'Selena Rodrigo', orders: 20 },
    { name: 'Selena Fonseka', orders: 18 },
  ];

  const orderTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 19, 14, 20, 16, 22, 25],
        fill: true,
        backgroundColor: 'rgba(134, 182, 246, 0.2)',
        borderColor: '#86b6f6',
        tension: 0.4,
      },
    ],
  };

  const orderTrendOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const colors = {
    totalMeals: 'bg-[#ade792]',
    totalOrders: 'bg-[#ffd56b]',
    totalCustomers: 'bg-[#86b6f6]',
    activeOrders: 'bg-[#ff8fab]',
  };

  return (
    <div className="flex min-h-screen bg-[#d1dfcd]">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderAdmin />

        {/* Image Banner */}
        <div>
          <img src={dashImage} alt="Meal banner" className="w-full h-64 object-cover" />
        </div>

        {/* Main Content */}
        <div className="p-8 flex flex-col gap-8">
          {/* Overview Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary).map(([key, value]) => (
              <div
                key={key}
                className={`${colors[key]} rounded-xl text-center p-4 h-28 flex flex-col justify-center items-center shadow-md`}
              >
                <h3 className="text-gray-800 font-semibold text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </section>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Orders List */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Active Orders</h2>
              <ul className="divide-y divide-gray-200">
                {activeOrders.slice(0, 5).map((order, idx) => (
                  <li key={idx} className="py-3 flex justify-between">
                    <span className="font-medium">{order.meal}</span>
                    <span className="text-gray-500">{order.id}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Meals */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Meals</h2>
              <div className="space-y-4">
                {topMeals.map((meal, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaFire className="text-red-500" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{meal.meal}</span>
                      <span className="text-gray-500">{meal.orders} Orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Customers</h2>
              <div className="space-y-3">
                {topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#d1dfcd] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-700">
                        {idx + 1}
                      </div>
                      <span>{customer.name}</span>
                    </div>
                    <span className="text-gray-500">{customer.orders} Orders</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Trend (Last 7 Days)</h2>
              <Line data={orderTrendData} options={orderTrendOptions} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
