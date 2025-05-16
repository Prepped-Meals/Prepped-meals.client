import React, { useState, useEffect } from "react";
import axios from "axios";
import { END_POINTS } from "../api/endPoints";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";

const AdminorderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All"); // 🆕 Filter state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(END_POINTS.GET_ORDER_DETAILS);
        setOrders(response.data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(END_POINTS.UPDATE_ORDER_STATUS(orderId), {
        status: newStatus,
      });

      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, order_status: newStatus } : order
      );
      setOrders(updatedOrders);

      // Updated success message
      alert("✅ Order status has been updated.");
    } catch (error) {
      console.error("Error updating order status:", error);
      // Updated error message
      alert("❌ Unable to update order status. Please try again.");
    }
  };

  // 🆕 Filter orders based on selected status
  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.order_status === filterStatus);

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Order Tracking</h1>

              {/* 🆕 Filter dropdown */}
              <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter:</label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="space-y-1">
                              {order.cart_items.map((item, idx) => (
                                <div key={idx} className="flex">
                                  <span className="text-gray-700">{item.meal_name}</span>
                                  <span className="ml-2 text-gray-500">(x{item.quantity})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.order_received_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.order_status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Completed">✅ Completed</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminorderTracking;
