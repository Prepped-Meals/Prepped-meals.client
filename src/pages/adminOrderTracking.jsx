import React, { useState, useEffect } from "react";
import axios from "axios";
import { END_POINTS } from "../api/endPoints";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";

const AdminorderTracking = () => {
  const [orders, setOrders] = useState([]);

  // Fetch all orders from the backend when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(END_POINTS.GET_ORDER_DETAILS);
        setOrders(response.data.data); // Assuming your backend response has a `data` property containing the orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Handle changing the order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Corrected API call using 'status' instead of 'order_status'
      await axios.put(END_POINTS.UPDATE_ORDER_STATUS(orderId), {
        status: newStatus,
      });

      // Update the local state after the status change
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, order_status: newStatus } : order
      );
      setOrders(updatedOrders);

      alert("Order status updated successfully.");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    }
  };

  // Function to determine the background color based on the order status
  const getRowColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100"; // Yellow background for Pending orders
      case "Completed":
        return "bg-green-100"; // Green background for Completed orders
      case "Cancelled":
        return "bg-red-100"; // Red background for Cancelled orders
      default:
        return "bg-white"; // Default white background
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <SidebarAdmin />

      <div className="flex-1">
        {/* Header */}
        <Header />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Order Tracking</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 text-gray-600">Order ID</th>
                  <th className="px-4 py-2 text-gray-600">Items & Quantities</th>
                  <th className="px-4 py-2 text-gray-600">Received Date</th>
                  <th className="px-4 py-2 text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className={`border-t ${getRowColor(order.order_status)}`}
                    >
                      <td className="px-4 py-2">{order._id}</td>
                      <td className="px-4 py-2">
                        {/* Display items and quantities together */}
                        <ul className="list-disc pl-6">
                          {order.cart_items.map((item, idx) => (
                            <li key={idx} className="text-gray-700">
                              {item.meal_name} - {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(order.order_received_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="border rounded px-4 py-2 bg-gray-50 hover:bg-gray-200 transition-colors duration-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending" className="text-yellow-600">Pending</option>
                          <option value="Completed" className="text-green-600">Completed</option>
                          <option value="Cancelled" className="text-red-600">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center text-gray-600">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminorderTracking;
