import React from "react";
import { useGetAllOrders } from "../hooks/useGetAdminOrders";
import { downloadTopCustomersReport } from "../hooks/useTopCustomersReport"; 
import { downloadOrderStatusReport } from "../hooks/useOrderStatus";

const AdminOrders = () => {
  const { data: allOrders, isLoading, isError } = useGetAllOrders();

  if (isLoading) return <div style={styles.message}>Loading all orders...</div>;
  if (isError) return <div style={styles.message}>Something went wrong while fetching orders.</div>;

  if (!allOrders?.data?.length) {
    return <div style={styles.message}>No orders found.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>All Orders</h2>

      {/* Download Button Section */}
      <div style={styles.buttonContainer}>
        <button 
          onClick={downloadOrderStatusReport} 
          style={styles.downloadButton}
          onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
        >
          Download Order Status Report
        </button>

        <button 
          onClick={downloadTopCustomersReport} 
          style={styles.downloadButton}
          onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
        >
          Download Top Customers Report
        </button>
      </div>

      <div style={styles.ordersList}>
        {allOrders.data.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <h3 style={styles.orderId}>Order ID: {order._id}</h3>

            <div style={styles.section}>
              <p style={styles.customerInfo}>
                <strong>Customer ID:</strong> {order.customer_id || order.customer?._id || "N/A"}
              </p>
              <p style={styles.customerInfo}>
                <strong>First Name:</strong> {order.customer?.f_name || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> <span style={styles.getStatusStyle(order.order_status)}>{order.order_status}</span>
              </p>
              <p>
                <strong>Received Date:</strong> {new Date(order.order_received_date).toISOString().split("T")[0]}
              </p>
            </div>

            <div style={styles.paymentDetails}>
              <h4>Payment Details</h4>
              <p><strong>Address:</strong> {order.payment?.address || "N/A"}</p>
              <p><strong>Phone:</strong> {order.payment?.phone_number || "N/A"}</p>
              <p><strong>Amount:</strong> Rs. {order.payment?.payment_amount || "N/A"}</p>
              <p><strong>Payment Type:</strong> {order.payment?.payment_type || "N/A"}</p>
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
    backgroundColor: "#f9f9f9",
    backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')",
    backgroundSize: "cover",
    minHeight: "100vh",
    fontFamily: "'Lora', serif",
  },
  title: {
    marginBottom: "2rem",
    fontSize: "2.5rem",
    textAlign: "center",
    color: "#2c3e50",
    fontFamily: "'Playfair Display', serif",
  },
  buttonContainer: {
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  downloadButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  ordersList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "2rem",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: "1rem",
  },
  orderId: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: "1rem",
  },
  customerInfo: {
    marginBottom: "0.5rem",
    color: "#7f8c8d",
  },
  paymentDetails: {
    marginTop: "1rem",
    backgroundColor: "#f5f5f5",
    padding: "1rem",
    borderRadius: "8px",
  },
  cartItems: {
    marginTop: "1rem",
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
    fontSize: "1.4rem",
    color: "#555",
    padding: "50px 20px",
  },
  getStatusStyle: (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#e67e22", fontWeight: "bold" };
      case "completed":
        return { color: "#27ae60", fontWeight: "bold" };
      case "cancelled":
        return { color: "#e74c3c", fontWeight: "bold" };
      default:
        return { color: "#34495e" };
    }
  },
};

export default AdminOrders;
