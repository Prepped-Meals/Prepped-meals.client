import React, { useState, useRef, useMemo } from "react";
import { useGetAllOrders } from "../hooks/useGetAdminOrders";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
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
  const statusReportRef   = useRef(null);
  const customerReportRef = useRef(null);

  // Today's date (11:51 AM +0530 on May 16, 2025) in YYYY-MM-DD format for max attribute
  const today = "2025-05-16";

  // Ensure ordersData always stable
  const ordersData = useMemo(() => allOrders?.data || [], [allOrders]);

  // ===== Filter by status =====
  const filteredOrders = useMemo(() => {
    if (selectedStatus === "all") return ordersData;
    return ordersData.filter(o => o.order_status.toLowerCase() === selectedStatus);
  }, [ordersData, selectedStatus]);

  // ===== Filter by date range for customer report =====
  const dateFilteredOrders = useMemo(() => {
    if (!startDate || !endDate) return ordersData;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    return ordersData.filter(o => {
      const d = new Date(o.order_received_date);
      return d >= start && d <= end;
    });
  }, [ordersData, startDate, endDate]);

  // ===== Compute customer report data =====
  const customerReportData = useMemo(() => {
    const map = {};
    dateFilteredOrders.forEach(o => {
      const name = o.customer?.f_name || "N/A";
      if (!map[name]) map[name] = { count: 0, meals: {} };
      map[name].count += 1;
      o.cart_items.forEach(i => {
        map[name].meals[i.meal_name] = (map[name].meals[i.meal_name] || 0) + i.quantity;
      });
    });
    return Object.entries(map)
      .map(([name, { count, meals }]) => ({
        name,
        orders: count,
        favorite: Object.entries(meals)
          .sort((a,b) => b[1] - a[1])[0]?.[0] || "N/A",
      }))
      .sort((a,b) => b.orders - a.orders);
  }, [dateFilteredOrders]);

  // ===== Status chart data =====
  const statusChartData = [
    { name: "Total Orders", value: ordersData.length },
    { name: `Status: ${selectedStatus}`, value: filteredOrders.length },
  ];

  // ===== PDF Download helper =====
  const downloadPDF = async ({ ref, title, cols, rows }) => {
    const doc = new jsPDF({ unit:"pt", format:"a4" });
    doc.setFontSize(18);
    doc.text(title, 40, 50);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 50);
    doc.line(40, 60, 555, 60);

    // include chart image if available
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
      headStyles: { fillColor: "#3498db", textColor: "#fff" },
      alternateRowStyles: { fillColor: "#f2f2f2" },
      margin: { left:40, right:40 },
      styles: { fontSize:10 },
    });

    doc.save(`${title.replace(/\s+/g,"_")}.pdf`);
  };

  // ===== Date Validation Handlers =====
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && new Date(newStartDate) > new Date(endDate)) {
      alert("Start Date must be before End Date.");
      setStartDate("");
      return;
    }
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      alert("End Date must be after Start Date.");
      setEndDate("");
      return;
    }
    setEndDate(newEndDate);
  };

  // ===== Early returns =====
  if (isLoading) return <div style={styles.message}>Loading all orders...</div>;
  if (isError)   return <div style={styles.message}>Error fetching orders.</div>;
  if (!ordersData.length) return <div style={styles.message}>No orders found.</div>;

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
              ["Total Orders", ordersData.length, "#3498db"],
              ["Completed", ordersData.filter(o => o.order_status.toLowerCase() === "completed").length, "#2ecc71"],
              ["Pending", ordersData.filter(o => o.order_status.toLowerCase() === "pending").length, "#f39c12"],
              ["Cancelled", ordersData.filter(o => o.order_status.toLowerCase() === "cancelled").length, "#e74c3c"],
            ].map(([lbl, cnt, clr]) => (
              <div key={lbl} style={{ ...styles.summaryCard, backgroundColor: clr }}>
                <h3 style={styles.cardTitle}>{lbl}</h3>
                <p style={styles.cardValue}>{cnt}</p>
              </div>
            ))}
          </div>

          {/* Filters + Report Cards */}
          <div style={styles.cardContainer}>
            {/* Status Report Card */}
            <div style={{ ...styles.card, backgroundColor: "#f5f5dc" }}>
              <h3 style={styles.cardTitle}>Status Report</h3>
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
                      new Date(o.order_received_date).toLocaleDateString(),
                      o.payment?.payment_type || "N/A",
                    ]),
                  })
                }
                style={styles.downloadButton}
              >
                Download Status PDF
              </button>
            </div>

            {/* Customer Report Card */}
            <div style={{ ...styles.card, backgroundColor: "#f5f5dc" }}>
              <h3 style={styles.cardTitle}>Customer Report</h3>
              <div style={styles.datePickerContainer}>
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
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
                    style={styles.dateInput}
                  />
                </label>
              </div>
              <button
                onClick={() => setShowCustomerReport(true)}
                style={styles.viewButton}
              >
                View by Customer
              </button>
              <button
                onClick={() =>
                  downloadPDF({
                    ref: customerReportRef,
                    title: "Orders_by_Customer",
                    cols: ["Customer", "Orders", "Favorite Meal"],
                    rows: customerReportData.map((c) => [c.name, c.orders, c.favorite]),
                  })
                }
                style={styles.downloadButton}
                disabled={!startDate || !endDate}
                title={!startDate || !endDate ? "Select date range" : ""}
              >
                Download Customer PDF
              </button>
            </div>
          </div>

          {/* Status Chart */}
          <div id="orders-chart" style={styles.chartContainer}>
            <ResponsiveContainer>
              <BarChart data={statusChartData}>
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Report Modal */}
          {showStatusReport && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <button onClick={() => setShowStatusReport(false)} style={styles.closeButton}>✕</button>
                <div ref={statusReportRef}>
                  <h3>Status Report — {selectedStatus}</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr><th>Order ID</th><th>Status</th><th>Customer</th><th>Date</th><th>Payment Type</th></tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o._id}>
                          <td>{o._id}</td><td>{o.order_status}</td><td>{o.customer?.f_name || "N/A"}</td>
                          <td>{new Date(o.order_received_date).toLocaleDateString()}</td>
                          <td>{o.payment?.payment_type || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={styles.chartContainer}>
                    <ResponsiveContainer>
                      <BarChart data={statusChartData}>
                        <XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#3498db"/>
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
                <button onClick={() => setShowCustomerReport(false)} style={styles.closeButton}>✕</button>
                <div ref={customerReportRef}>
                  <h3>Orders by Customer</h3>
                  <div style={styles.dateSummary}>
                    Showing orders from <strong>{startDate}</strong> to <strong>{endDate}</strong>
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr><th>Customer</th><th>Orders</th><th>Favorite Meal</th></tr>
                    </thead>
                    <tbody>
                      {customerReportData.map(c => (
                        <tr key={c.name}>
                          <td>{c.name}</td><td>{c.orders}</td><td>{c.favorite}</td>
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
            {filteredOrders.map(o => (
              <div key={o._id} style={styles.orderCard}>
                <h3 style={styles.orderId}>Order ID: {o._id}</h3>
                <p><strong>Customer:</strong> {o.customer?.f_name || "N/A"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(o.order_status) }}>
                    {o.order_status}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(o.order_received_date).toLocaleDateString()}</p>
                <div style={styles.paymentDetails}>
                  <h4 style={styles.subHeading}>Payment</h4>
                  <p><strong>Type:</strong> {o.payment?.payment_type || "N/A"}</p>
                  <p><strong>Amount:</strong> Rs. {o.payment?.payment_amount || "N/A"}</p>
                  <p><strong>Phone:</strong> {o.payment?.phone_number || "N/A"}</p>
                  <p><strong>Address:</strong> {o.payment?.address || "N/A"}</p>
                </div>
                <div style={styles.cartItems}>
                  <h4 style={styles.subHeading}>Cart Items</h4>
                  <ul style={styles.cartList}>
                    {o.cart_items.map((i, idx) => (
                      <li key={idx} style={styles.cartItem}>
                        <strong>{i.meal_name}</strong>: {i.quantity}×Rs.{i.meal_price} = Rs.{i.total_price}
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

// Helper for badge color
const getStatusStyle = s => {
  switch(s.toLowerCase()){
    case "pending":   return { backgroundColor:"#f39c12" };
    case "completed": return { backgroundColor:"#2ecc71" };
    case "cancelled": return { backgroundColor:"#e74c3c" };
    default:          return { backgroundColor:"#95a5a6" };
  }
};

// Styles object
const styles = {
  container:             { padding:"2rem" },
  title:                 { fontSize:"1.8rem", marginBottom:"1rem" },
  summaryCardContainer:  { display:"flex", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap" },
  summaryCard:           { flex:1, padding:"1rem", borderRadius:"8px", color:"#fff", textAlign:"center" },
  cardTitle:             { fontSize:"1rem", margin:"0 0 0.5rem" },
  cardValue:             { fontSize:"1.5rem", fontWeight:"bold" },

  cardContainer:         { display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  card:                  { flex:1, padding:"1rem", borderRadius:"8px", color:"#000", textAlign:"center", minWidth:"250px", backgroundColor: "#f5f5dc" },
  viewButton:            { padding:"0.5rem 1rem", backgroundColor:"#2ecc71", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", margin:"0.25rem 0", width:"100%" },
  downloadButton:        { padding:"0.5rem 1rem", backgroundColor:"#007bff", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", margin:"0.25rem 0", width:"100%" },
  dropdown:              { padding:"0.4rem", fontSize:"1rem", marginBottom:"0.5rem", width:"100%", borderRadius:"4px", backgroundColor: "transparent", color: "#000" },
  datePickerContainer:   { marginBottom:"0.5rem" },
  dateInput:             { marginLeft:"0.5rem", padding:"0.3rem", fontSize:"1rem", borderRadius:"4px", border:"1px solid #ccc", marginBottom:"0.5rem", width:"calc(100% - 0.5rem)", backgroundColor: "transparent", color: "#000" },

  chartContainer:        { width:"100%", height:180, marginBottom:"2rem" },

  modal:                 { position:"fixed", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modalContent:          { backgroundColor:"#fff", borderRadius:"8px", padding:"1.5rem", width:"90%", maxWidth:"800px", maxHeight:"80vh", overflowY:"auto", position:"relative" },
  closeButton:           { position:"absolute", top:"10px", right:"10px", background:"none", border:"none", fontSize:"1.2rem", cursor:"pointer" },

  table:                 { width:"100%", borderCollapse:"collapse", marginBottom:"1rem" },
  dateSummary:           { marginBottom:"1rem", fontStyle:"italic", color:"#555" },

  ordersList:            { display:"flex", flexWrap:"wrap", gap:"1rem", marginTop:"2rem" },
  orderCard:             { flex:"0 0 calc(33.33% - 1rem)", border:"1px solid #ddd", borderRadius:"6px", padding:"1rem", boxSizing:"border-box", backgroundColor:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.1)" },
  orderId:               { margin:"0 0 0.5rem", fontWeight:"bold" },
  section:               { marginBottom:"1rem" },

  subHeading:            { margin:"0.5rem 0", fontSize:"1.1rem", borderBottom:"1px solid #ddd", paddingBottom:"0.25rem" },
  paymentDetails:        { marginBottom:"1rem", backgroundColor:"#f5f5dc", padding:"0.75rem", borderRadius:"6px" },
  cartItems:             { marginBottom:"1rem" },
  cartList:              { listStyleType:"disc", paddingLeft:"1.25rem" },
  cartItem:              { marginBottom:"0.25rem" },

  statusBadge:           { display:"inline-block", padding:"0.25rem 0.5rem", borderRadius:"4px", color:"#fff", textTransform:"capitalize", fontSize:"0.9rem" },

  message:               { textAlign:"center", marginTop:"2rem", fontSize:"1.2rem" },
};

export default AdminOrders;