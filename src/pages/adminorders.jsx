import React, { useState, useRef, useMemo } from "react";
import { useGetAllOrders } from "../hooks/useGetAdminOrders";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toPng } from "html-to-image";

const AdminOrders = () => {
  // ===== Hooks & State =====
  const { data: allOrders, isLoading, isError } = useGetAllOrders();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showStatusReport, setShowStatusReport] = useState(false);
  const [showCustomerReport, setShowCustomerReport] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const statusReportRef = useRef(null);
  const customerReportRef = useRef(null);

  // Today's date (07:30 PM +0530 on May 21, 2025) in YYYY-MM-DD format for max attribute
  const today = "2025-05-21";

  // Ensure ordersData always stable
  const ordersData = useMemo(() => allOrders?.data || [], [allOrders]);

  // ===== Filter by status =====
  const filteredOrders = useMemo(() => {
    if (selectedStatus === "all") return ordersData;
    return ordersData.filter(
      (o) => o.order_status.toLowerCase() === selectedStatus
    );
  }, [ordersData, selectedStatus]);

  // ===== Filter by date range for customer report =====
  const dateFilteredOrders = useMemo(() => {
    if (!startDate || !endDate) return ordersData;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return ordersData.filter((o) => {
      const d = new Date(o.order_received_date);
      return d >= start && d <= end;
    });
  }, [ordersData, startDate, endDate]);

  // ===== Compute customer report data =====
  const customerReportData = useMemo(() => {
    const map = {};
    dateFilteredOrders.forEach((o) => {
      const name = o.customer?.f_name || "N/A";
      if (!map[name]) map[name] = { count: 0, meals: {} };
      map[name].count += 1;
      o.cart_items.forEach((i) => {
        map[name].meals[i.meal_name] =
          (map[name].meals[i.meal_name] || 0) + i.quantity;
      });
    });
    return Object.entries(map)
      .map(([name, { count, meals }]) => ({
        name,
        orders: count,
        favorite:
          Object.entries(meals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      }))
      .sort((a, b) => b.orders - a.orders);
  }, [dateFilteredOrders]);

  // ===== Status chart data =====
  const statusChartData = [
    { name: "Total Orders", value: ordersData.length },
    { name: `Status: ${selectedStatus}`, value: filteredOrders.length },
  ];

  // ===== PDF Download helper =====
  const downloadPDF = async ({ ref, title, cols, rows }) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(18);
    doc.text(title, 40, 50);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString("en-US")}`, 400, 50);
    doc.line(40, 60, 555, 60);

    // Include chart image if available
    if (ref.current) {
      try {
        const img = await toPng(ref.current, { backgroundColor: "#fff" });
        doc.addImage(img, "PNG", 40, 70, 520, 180);
      } catch {}
    }

    doc.autoTable({
      startY: ref.current ? 260 : 80,
      head: [cols],
      body: rows,
      headStyles: { fillColor: "#10b981", textColor: "#fff" },
      alternateRowStyles: { fillColor: "#f2f2f2" },
      margin: { left: 40, right: 40 },
      styles: { fontSize: 10 },
    });

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  // ===== Date Validation Handlers with mm/dd/yyyy format =====
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && new Date(newStartDate) > new Date(endDate)) {
      alert("Start Date must be before End Date.");
      setStartDate("");
      setShowDateWarning(false);
      return;
    }
    setStartDate(newStartDate);
    setShowDateWarning(false);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      alert("End Date must be after Start Date.");
      setEndDate("");
      setShowDateWarning(false);
      return;
    }
    setEndDate(newEndDate);
    setShowDateWarning(false);
  };

  // ===== Handle View Customer Report Click =====
  const handleViewCustomerReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setShowDateWarning(true);
      return;
    }
    setShowCustomerReport(true);
    setShowDateWarning(false);
  };

  // ===== Handle Download Customer PDF Click =====
  const handleDownloadCustomerPDF = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setShowDateWarning(true);
      return;
    }
    downloadPDF({
      ref: customerReportRef,
      title: "Orders_by_Customer",
      cols: ["Customer", "Orders", "Favorite Meal"],
      rows: customerReportData.map((c) => [c.name, c.orders, c.favorite]),
    });
    setShowDateWarning(false);
  };

  // ===== Early returns =====
  if (isLoading) return <div style={styles.message}>Loading all orders...</div>;
  if (isError) return <div style={styles.message}>Error fetching orders.</div>;
  if (!ordersData.length)
    return <div style={styles.message}>No orders found.</div>;

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1">
        <Header />
        <div style={styles.container}>
          <h2 style={styles.title}>All Orders</h2>

          {/* Summary Cards */}
          <div style={styles.summaryCardContainer}>
            {[
              ["Total Orders", ordersData.length],
              [
                "Completed",
                ordersData.filter(
                  (o) => o.order_status.toLowerCase() === "completed"
                ).length,
              ],
              [
                "Pending",
                ordersData.filter(
                  (o) => o.order_status.toLowerCase() === "pending"
                ).length,
              ],
              [
                "Cancelled",
                ordersData.filter(
                  (o) => o.order_status.toLowerCase() === "cancelled"
                ).length,
              ],
            ].map(([lbl, cnt]) => (
              <div
                key={lbl}
                style={{
                  ...styles.summaryCard,
                  backgroundColor: "#e5e7eb",
                  border: "2px solid #10b981",
                }}
              >
                <h3 style={styles.cardTitle}>{lbl}</h3>
                <p style={styles.cardValue}>{cnt}</p>
              </div>
            ))}
          </div>

          {/* Filters + Report Cards */}
          <div style={styles.cardContainer}>
            {/* Status Report Card */}
            <div style={{ ...styles.card, ...styles.highlightedCard }}>
              <h3 style={{ ...styles.cardTitle, fontWeight: "bold" }}>
                Status Report
              </h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={styles.dropdown}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div style={styles.buttonContainer}>
                <button
                  onClick={() => setShowStatusReport(true)}
                  style={styles.viewButton}
                >
                  View Status Report
                </button>
                <button
                  onClick={() =>
                    downloadPDF({
                      ref: { current: document.getElementById("orders-chart") },
                      title: `Orders_Status_${selectedStatus}`,
                      cols: [
                        "Order ID",
                        "Status",
                        "Customer",
                        "Date",
                        "Payment Type",
                      ],
                      rows: filteredOrders.map((o) => [
                        o._id,
                        o.order_status,
                        o.customer?.f_name || "N/A",
                        new Date(o.order_received_date).toLocaleDateString(
                          "en-US"
                        ),
                        o.payment?.payment_type || "N/A",
                      ]),
                    })
                  }
                  style={styles.downloadButton}
                >
                  Download Status PDF
                </button>
              </div>
            </div>

            {/* Customer Report Card */}
            <div style={{ ...styles.card, ...styles.highlightedCard }}>
              <h3 style={{ ...styles.cardTitle, fontWeight: "bold" }}>
                Customer Report
              </h3>
              {showDateWarning && (
                <div style={styles.warningMessage}>
                  Please select both start and end dates
                </div>
              )}
              <div style={styles.datePickerContainer}>
                <div style={styles.datePickerWrapper}>
                  <label>
                    Start Date:
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      max={today}
                      placeholder="mm/dd/yyyy"
                      style={styles.dateInput}
                    />
                  </label>
                  <label>
                    End Date:
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      max={today}
                      placeholder="mm/dd/yyyy"
                      style={styles.dateInput}
                    />
                  </label>
                </div>
              </div>
              <div style={styles.buttonContainer}>
                <button
                  onClick={handleViewCustomerReport}
                  style={{
                    ...styles.viewButton,
                    ...(startDate && endDate
                      ? {}
                      : { opacity: 0.5, cursor: "not-allowed" }),
                  }}
                  disabled={!startDate || !endDate}
                  title={
                    !startDate || !endDate
                      ? "Select both dates to view report"
                      : ""
                  }
                >
                  View by Customer
                </button>
                <button
                  onClick={handleDownloadCustomerPDF}
                  style={{
                    ...styles.downloadButton,
                    ...(startDate && endDate
                      ? {}
                      : { opacity: 0.5, cursor: "not-allowed" }),
                  }}
                  disabled={!startDate || !endDate}
                  title={
                    !startDate || !endDate
                      ? "Select both dates to download report"
                      : ""
                  }
                >
                  Download Customer PDF
                </button>
              </div>
            </div>
          </div>

          {/* Orders Comparison Title */}
          <h3 style={styles.comparisonTitle}>
            All Orders Compared with Selected Order Status
          </h3>

          {/* Status Chart */}
          <div id="orders-chart" style={styles.chartContainer}>
            <ResponsiveContainer>
              <BarChart data={statusChartData} layout="vertical">
                <XAxis type="number" dataKey="value" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Report Modal */}
          {showStatusReport && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <button
                  onClick={() => setShowStatusReport(false)}
                  style={styles.closeButton}
                >
                  ✕
                </button>
                <div ref={statusReportRef}>
                  <h3>Status Report — {selectedStatus}</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Payment Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o._id}>
                          <td>{o._id}</td>
                          <td>{o.order_status}</td>
                          <td>{o.customer?.f_name || "N/A"}</td>
                          <td>
                            {new Date(o.order_received_date).toLocaleDateString(
                              "en-US"
                            )}
                          </td>
                          <td>{o.payment?.payment_type || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={styles.chartContainer}>
                    <ResponsiveContainer>
                      <BarChart data={statusChartData} layout="vertical">
                        <XAxis type="number" dataKey="value" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Report Modal */}
          {showCustomerReport && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <button
                  onClick={() => setShowCustomerReport(false)}
                  style={styles.closeButton}
                >
                  ✕
                </button>
                <div ref={customerReportRef}>
                  <h3>Orders by Customer</h3>
                  <div style={styles.dateSummary}>
                    Showing orders from <strong>{formatDate(startDate)}</strong>{" "}
                    to <strong>{formatDate(endDate)}</strong>
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Orders</th>
                        <th>Favorite Meal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerReportData.map((c) => (
                        <tr key={c.name}>
                          <td>{c.name}</td>
                          <td>{c.orders}</td>
                          <td>{c.favorite}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Full Orders Grid */}
          <div style={styles.ordersList}>
            {filteredOrders.map((o) => (
              <div key={o._id} style={styles.orderCard}>
                <h3 style={styles.orderId}>Order ID: {o._id}</h3>
                <p>
                  <strong>Customer:</strong> {o.customer?.f_name || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
                    {o.order_status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(o.order_received_date).toLocaleDateString("en-US")}
                </p>
                <div style={styles.paymentDetails}>
                  <h4 style={styles.subHeading}>Payment</h4>
                  <p>
                    <strong>Type:</strong> {o.payment?.payment_type || "N/A"}
                  </p>
                  <p>
                    <strong>Amount:</strong> Rs.{" "}
                    {o.payment?.payment_amount || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {o.payment?.phone_number || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {o.payment?.address || "N/A"}
                  </p>
                </div>
                <div style={styles.cartItems}>
                  <h4 style={styles.subHeading}>Cart Items</h4>
                  <ul style={styles.cartList}>
                    {o.cart_items.map((i, idx) => (
                      <li key={idx} style={styles.cartItem}>
                        <strong>{i.meal_name}</strong>: {i.quantity}×Rs.
                        {i.meal_price} = Rs.{i.total_price}
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

// Styles object
const styles = {
  container: { padding: "2rem" },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
    textAlign: "center",
    fontFamily: "Roboto, sans-serif",
    fontWeight: "bold",
  },
  summaryCardContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: 1,
    padding: "1rem",
    borderRadius: "8px",
    color: "#000",
    textAlign: "center",
  },
  cardTitle: { fontSize: "1rem", margin: "0 0 0.5rem" },
  cardValue: { fontSize: "1.5rem", fontWeight: "bold" },
  cardContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    padding: "1rem",
    borderRadius: "8px",
    color: "#000",
    textAlign: "center",
    minWidth: "250px",
    backgroundColor: "#fff",
  },
  highlightedCard: {
    border: "2px solid #6b7280",
    boxShadow: "0 2px 4px rgba(107,114,128,0.2)",
  },
  datePickerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    alignItems: "center",
  },
  datePickerWrapper: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "1rem",
    justifyContent: "center",
    minWidth: "300px",
  },
  dateInput: {
    padding: "0.3rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%",
    backgroundColor: "transparent",
    color: "#000",
  },
  warningMessage: {
    color: "#ff0000",
    fontSize: "0.8rem",
    marginBottom: "0.5rem",
    textAlign: "center",
    backgroundColor: "#fff5f5",
    padding: "0.5rem",
    borderRadius: "4px",
    position: "relative",
    zIndex: 10,
  },
  viewButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
    margin: "0.25rem",
  },
  downloadButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
    margin: "0.25rem",
  },
  buttonContainer: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
    flexWrap: "wrap",
  },
  dropdown: {
    padding: "0.4rem",
    fontSize: "1rem",
    marginBottom: "0.5rem",
    width: "100%",
    borderRadius: "4px",
    backgroundColor: "transparent",
    color: "#000",
  },
  chartContainer: { width: "100%", height: 180, marginBottom: "2rem" },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" },
  dateSummary: { marginBottom: "1rem", fontStyle: "italic", color: "#555" },
  comparisonTitle: {
    fontSize: "1.1rem",
    marginTop: "1.5rem",
    marginBottom: "1rem",
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    textAlign: "center",
    fontStyle: "italic",
  },
  ordersList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  orderCard: {
    flex: "0 0 calc(33.33% - 1rem)",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "1rem",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  orderId: { margin: "0 0 0.5rem", fontWeight: "bold" },
  subHeading: {
    margin: "0.5rem 0",
    fontSize: "1.1rem",
    borderBottom: "1px solid #ddd",
    paddingBottom: "0.25rem",
  },
  paymentDetails: {
    marginBottom: "1rem",
    backgroundColor: "#f5f5dc",
    padding: "0.75rem",
    borderRadius: "6px",
  },
  cartItems: { marginBottom: "1rem" },
  cartList: { listStyleType: "disc", paddingLeft: "1.25rem" },
  cartItem: { marginBottom: "0.25rem" },
  message: { textAlign: "center", marginTop: "2rem", fontSize: "1.2rem" },
};

export default AdminOrders;
