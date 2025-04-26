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

  if (isLoading) return <div style={styles.message}>Loading your orders...</div>;
  if (isError) return <div style={styles.message}>Something went wrong while fetching orders.</div>;

  if (!customerOrders?.data?.length) {
    return <div style={styles.message}>You have no orders yet.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Orders</h2>

      <div style={styles.ordersList}>
        {customerOrders.data.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <h3 style={styles.orderId}>Order ID: {order._id}</h3>
            <p>
              <strong>Status:</strong>{" "}
              <span style={styles.getStatusStyle(order.order_status)}>
                {order.order_status}
              </span>
            </p>
            <p><strong>Received Date:</strong> {new Date(order.order_received_date).toISOString().split('T')[0]}</p>
        
            <div style={styles.paymentDetails}>
              <h4>Payment Details</h4>
              <p><strong>Address:</strong> {order.payment?.address}</p>
              <p><strong>Phone:</strong> {order.payment?.phone_number}</p>
              <p><strong>Amount:</strong> Rs. {order.payment?.payment_amount}</p>
              <p><strong>Payment Type:</strong> {order.payment?.payment_type}</p>
            </div>

            <div style={styles.cartItems}>
              <h4>Cart Items</h4>
              <ul style={styles.cartList}>
                {order.cart_items.map((item, idx) => (
                  <li key={idx} style={styles.cartItem}>
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

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f1f1f1", // Vintage background color
    backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')", // Vintage texture pattern
    backgroundSize: "cover",
    minHeight: "100vh",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "2rem",
    color: "#3e3e3e",
    fontFamily: "'Playfair Display', serif",
  },
  ordersList: {
    display: "grid",
    gap: "1.5rem",
  },
  orderCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    fontFamily: "'Lora', serif",
  },
  orderId: {
    marginBottom: "0.5rem",
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
  },
  paymentDetails: {
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  cartItems: {
    marginTop: "1.5rem",
  },
  cartList: {
    paddingLeft: "1.5rem",
  },
  cartItem: {
    marginBottom: "0.5rem",
    fontSize: "1rem",
    color: "#555",
  },
  message: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#555",
    padding: "20px",
  },
  getStatusStyle: (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#FFA500", fontWeight: "bold" }; // Orange for pending
      case "completed":
        return { color: "#28a745", fontWeight: "bold" }; // Green for completed
      case "cancelled":
        return { color: "#dc3545", fontWeight: "bold" }; // Red for cancelled
      default:
        return { color: "#333" };
    }
  },
};

export default Orders;

