import React from "react";
import { useAuth } from "../context/authContext";
import { useGetOrdersByCustomer } from "../hooks/useGetOrders.js";

const Orders = () => {
  const { user } = useAuth();
  const {
    data: customerOrders,
    isLoading,
    isError,
  } = useGetOrdersByCustomer(user?._id);

  if (isLoading) return <div>Loading your orders...</div>;
  if (isError) return <div>Something went wrong while fetching orders.</div>;

  if (!customerOrders?.data?.length) {
    return <div>You have no orders yet.</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>My Orders</h2>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {customerOrders.data.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1.5rem",
              backgroundColor: "#fafafa",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>Order ID: {order.order_id}</h3>
            <p><strong>Status:</strong> {order.order_status}</p>
            <p><strong>Received Date:</strong> {new Date(order.order_received_date).toLocaleString()}</p>

            <div style={{ marginTop: "1rem" }}>
              <h4>Payment Details</h4>
              <p><strong>Address:</strong> {order.payment?.address}</p>
              <p><strong>Phone:</strong> {order.payment?.phone_number}</p>
              <p><strong>Amount:</strong> Rs. {order.payment?.payment_amount}</p>
              <p><strong>Payment Type:</strong> {order.payment?.payment_type}</p>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <h4>Cart Items</h4>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {order.cart_items.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "0.5rem" }}>
                    {item.meal_name} — {item.quantity} x Rs. {item.meal_price} = Rs. {item.total_price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
