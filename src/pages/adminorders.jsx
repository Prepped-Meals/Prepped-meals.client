import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllOrders } from "../hooks/useGetAdminOrders";
import { downloadTopCustomersReport } from "../hooks/useTopCustomersReport";
import { downloadOrderStatusReport } from "../hooks/useOrderStatus";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";

const AdminOrders = () => {
  const { data: allOrders, isLoading, isError } = useGetAllOrders();
  // eslint-disable-next-line
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");

  if (isLoading) return <div style={styles.message}>Loading all orders...</div>;
  if (isError) return <div style={styles.message}>Something went wrong while fetching orders.</div>;
  if (!allOrders?.data?.length) {
    return <div style={styles.message}>No orders found.</div>;
  }

  const statusCounts = allOrders.data.reduce((acc, order) => {
    const status = order.order_status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const filteredOrders = selectedStatus === "all"
    ? allOrders.data
    : allOrders.data.filter(order => order.order_status.toLowerCase() === selectedStatus);

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1">
        <Header />
        <div style={styles.container}>
          <h2 style={styles.title}>All Orders</h2>

          {/* Summary Cards */}
          <div style={styles.summaryCardContainer}>
            <div style={{ ...styles.summaryCard, backgroundColor: "#3498db" }}>
              <h3 style={styles.cardTitle}>Total Orders</h3>
              <p style={styles.cardValue}>{allOrders.data.length}</p>
            </div>
            <div style={{ ...styles.summaryCard, backgroundColor: "#2ecc71" }}>
              <h3 style={styles.cardTitle}>Completed</h3>
              <p style={styles.cardValue}>{statusCounts.completed || 0}</p>
            </div>
            <div style={{ ...styles.summaryCard, backgroundColor: "#f39c12" }}>
              <h3 style={styles.cardTitle}>Pending</h3>
              <p style={styles.cardValue}>{statusCounts.pending || 0}</p>
            </div>
            <div style={{ ...styles.summaryCard, backgroundColor: "#e74c3c" }}>
              <h3 style={styles.cardTitle}>Cancelled</h3>
              <p style={styles.cardValue}>{statusCounts.cancelled || 0}</p>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div style={styles.dropdownWrapper}>
            <label htmlFor="statusFilter" style={styles.dropdownLabel}>Filter by Status:</label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.dropdown}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Report Cards */}
          <div style={styles.reportCardContainer}>
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Order Summary Report</h3>
              <p style={styles.reportDescription}>Download overall status report of all orders.</p>
              <button
                onClick={downloadOrderStatusReport}
                style={styles.downloadButton}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
              >
                Download Order Summary Report
              </button>
            </div>

            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Top Customers Report</h3>
              <p style={styles.reportDescription}>Download the top performing customers report.</p>
              <button
                onClick={downloadTopCustomersReport}
                style={styles.downloadButton}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
              >
                Download Top Customers Report
              </button>
            </div>
          </div>

          {/* Orders */}
          <div style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div key={order._id} style={styles.orderCard}>
                <h3 style={styles.orderId}>Order ID: {order._id}</h3>

                <div style={styles.section}>
                  <p style={styles.customerInfo}><strong>Customer ID:</strong> {order.customer_id || order.customer?._id || "N/A"}</p>
                  <p style={styles.customerInfo}><strong>First Name:</strong> {order.customer?.f_name || "N/A"}</p>
                  <p><strong>Status:</strong> <span style={styles.getStatusStyle(order.order_status)}>{order.order_status}</span></p>
                  <p><strong>Received Date:</strong> {new Date(order.order_received_date).toISOString().split("T")[0]}</p>
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
  summaryCardContainer: {
    display: "flex",
    justifyContent: "space-around",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  summaryCard: {
    padding: "1.5rem",
    borderRadius: "10px",
    width: "220px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  dropdownWrapper: {
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  },
  dropdownLabel: {
    fontSize: "1rem",
    color: "#34495e",
  },
  dropdown: {
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  reportCardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  reportCard: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center",
  },
  reportTitle: {
    fontSize: "1.25rem",
    marginBottom: "0.5rem",
    color: "#34495e",
  },
  reportDescription: {
    fontSize: "0.95rem",
    marginBottom: "1rem",
    color: "#7f8c8d",
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
