import React from 'react';
import SidebarAdmin from '../components/sidebarAdmin';
import HeaderAdmin from '../components/headerAdmin';
// import dashImage from "../assets/images/mealA.jpg";
import dashImage from "../assets/images/meallsss.jpg";

const DashboardAdmin = () => {
  const summary = {
    totalMeals: 150,
    totalOrders: 120,
    totalCustomers: 250,
    activeOrders: 25,
  };

  const colors = {
    totalMeals: 'bg-[#ade792]',
    totalOrders: 'bg-[#ffd56b]',
    totalCustomers: 'bg-[#86b6f6]',
    activeOrders: 'bg-[#ff8fab]',
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
          <img src={dashImage} alt="Meal banner" className="w-full h-65 object-cover" />
        </div>

        {/* Main Content Below Image */}
        <div className="p-10 flex flex-col gap-8">
          {/* Summary Section in a Container */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary).map(([key, value]) => (
                <div
                  key={key}
                  className={`${colors[key]} rounded-xl text-center p-4 h-28 flex flex-col justify-center items-center shadow-md`}
                >
                  <h3 className="text-gray-800 font-semibold text-sm text-center">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Active Orders Table Below */}
          <div className="bg-white rounded-2xl p-6 shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Orders</h2>
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#73926a] text-white">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Meal</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((order, idx) => (
                  <tr key={idx} className="border-t border-gray-500">
                    <td className="px-6 py-3">{order.id}</td>
                    <td className="px-6 py-3">{order.meal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
