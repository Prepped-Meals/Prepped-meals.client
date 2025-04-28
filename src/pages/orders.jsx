import React from "react";
import { useAuth } from "../context/authContext";
import { useGetOrdersByCustomer } from "../hooks/useGetOrders.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from '../assets/images/logo.png';


const Orders = () => {
  const { user } = useAuth();
  const { data: customerOrders, isLoading, isError } = useGetOrdersByCustomer(user?._id);

  if (isLoading) return <div style={styles.message}>Loading your orders...</div>;
  if (isError) return <div style={styles.message}>Something went wrong while fetching orders.</div>;

  if (!customerOrders?.data?.length) {
    return <div style={styles.message}>You have no orders yet.</div>;
  }

  
  // Generate Professional Weekly Report
  const generateWeeklyReport = async () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday as start
  
    const weeklyOrders = customerOrders.data.filter((order) => {
      const orderDate = new Date(order.order_received_date);
      return orderDate >= startOfWeek;
    });
  
    const mealSummary = {};
    weeklyOrders.forEach((order) => {
      order.cart_items.forEach((item) => {
        if (!mealSummary[item.meal_name]) {
          mealSummary[item.meal_name] = { quantity: 0, price: item.meal_price, totalPrice: 0 };
        }
        mealSummary[item.meal_name].quantity += item.quantity;
        mealSummary[item.meal_name].totalPrice += item.total_price;
      });
    });
  
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Heatn'Eat", pageWidth / 2, 20, { align: "center" });
  
    doc.setFontSize(18);
    doc.text("Weekly Meal Payment Overview", pageWidth / 2, 30, { align: "center" });
  
    // Report Generated Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 40);
  
    // Line Separator
    doc.setDrawColor(0);
    doc.line(10, 45, pageWidth - 10, 45);
  
    // Table
    const mealData = Object.entries(mealSummary).map(([meal, details]) => [
      meal,
      details.quantity,
      `Rs. ${details.price.toFixed(2)}`,
      `Rs. ${details.totalPrice.toFixed(2)}`,
    ]);
  
    doc.autoTable({
      startY: 50,
      head: [["Meal Name", "Quantity", "Unit Price", "Total Price"]],
      body: mealData,
      styles: {
        font: "helvetica",
        fontSize: 11,
        halign: "center",
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 13,
        fontStyle: "bold",
        halign: "center",
      },
      theme: "striped",
      margin: { left: 14, right: 14 },
    });
  
    // Total Spent Section
    const finalY = doc.lastAutoTable.finalY || 60;
    const totalSpent = Object.values(mealSummary).reduce((sum, item) => sum + item.totalPrice, 0);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Summary", 14, finalY + 15);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total Amount Spent on Meals: Rs. ${totalSpent.toFixed(2)}`, 14, finalY + 25);
  
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for your !", pageWidth / 2, 290, { align: "center" });
  
    doc.save("Weekly_Meal_Report.pdf");
  };
  

  // Generate Professional Receipt
  const generateReceipt = async (order) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    const pageWidth = doc.internal.pageSize.getWidth();
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      // Add logo
      const imgWidth = 40; 
      const imgHeight = 20; 
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(img, "PNG", imgX, 10, imgWidth, imgHeight);
  
      // Add Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Order Receipt", pageWidth / 2, 40, { align: "center" });
  
      // Line separator
      doc.setDrawColor(0);
      doc.line(10, 45, pageWidth - 10, 45);
  
      // Order Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const orderInfoY = 55;
      const lineHeight = 8;
  
      doc.text(`Order ID: ${order._id}`, 14, orderInfoY);
      doc.text(`Status: ${order.order_status}`, 14, orderInfoY + lineHeight);
      doc.text(` Date: ${new Date(order.order_received_date).toLocaleDateString()}`, 14, orderInfoY + lineHeight * 2);
  
      // Payment Details Section Title
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details:", 14, orderInfoY + lineHeight * 4);
  
      // Payment Details
      doc.setFont("helvetica", "normal");
  
      // Address with multi-line handling
      const addressText = `Receiver's Name & Address: ${order.payment?.address || "-"}`;
      const addressWidth = pageWidth - 28; // 14 left + 14 right margins
      const addressLines = doc.splitTextToSize(addressText, addressWidth);
      doc.text(addressLines, 14, orderInfoY + lineHeight * 5);
  
      // Calculate dynamic Y position based on address lines
      const addressLineCount = addressLines.length;
      const nextFieldY = orderInfoY + lineHeight * (5 + addressLineCount);
  
      doc.text(`Phone: ${order.payment?.phone_number}`, 14, nextFieldY);
      doc.text(`Amount: Rs. ${order.payment?.payment_amount}`, 14, nextFieldY + lineHeight);
      doc.text(`Payment Type: ${order.payment?.payment_type}`, 14, nextFieldY + lineHeight * 2);
  
      // Cart Items Table
      const startY = nextFieldY + lineHeight * 4;
      const cartItems = order.cart_items.map((item) => [
        item.meal_name,
        item.quantity,
        `Rs. ${item.meal_price.toFixed(2)}`,
        `Rs. ${item.total_price.toFixed(2)}`,
      ]);
  
      doc.autoTable({
        startY: startY,
        head: [["Meal", "Quantity", "Unit Price", "Total"]],
        body: cartItems,
        styles: {
          halign: "center",
          fontSize: 11,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          fontSize: 13,
          fontStyle: "bold",
        },
        theme: 'striped',
        margin: { left: 14, right: 14 },
      });
  
      // Footer
      const finalY = doc.lastAutoTable.finalY || startY + 20;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Thank you for ordering with us!", pageWidth / 2, finalY + 20, { align: "center" });
  
      // Save PDF
      doc.save(`Receipt_${order._id}.pdf`);
    };
  
    img.onerror = () => {
      console.error("Failed to load logo image.");
    };
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Orders</h2>

      <button onClick={generateWeeklyReport} style={styles.button}>
        Generate Weekly Meal Report
      </button>

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
            <p><strong>Billing Date:</strong> {new Date(order.order_received_date).toLocaleDateString()}</p>

            <div style={styles.paymentDetailsSection}>
              <h4>Payment Details</h4>
              <p><strong>Receiver's Name & Address:</strong> {order.payment?.address}</p>
              <p><strong>Phone:</strong> {order.payment?.phone_number}</p>
              <p><strong>Amount:</strong> Rs. {order.payment?.payment_amount}</p>
              <p><strong>Payment Type:</strong> {order.payment?.payment_type}</p>
            </div>

            <div style={styles.cartItemsSection}>
              <h4>Cart Items</h4>
              <ul style={styles.cartList}>
                {order.cart_items.map((item, idx) => (
                  <li key={idx} style={styles.cartItem}>
                    {item.meal_name} — {item.quantity} x Rs. {item.meal_price} = Rs. {item.total_price}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => generateReceipt(order)} style={styles.buttonSmall}>
              Generate Receipt
            </button>
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
    minHeight: "100vh",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "2rem",
    color: "#2c3e50",
    fontFamily: "'Playfair Display', serif",
  },
  ordersList: {
    display: "grid",
    gap: "1.5rem",
  },
  orderCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Lora', serif",
  },
  orderId: {
    marginBottom: "0.5rem",
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#34495e",
  },
  paymentDetailsSection: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#e7f3fe",
    borderRadius: "8px",
  },
  cartItemsSection: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#fff8e1",
    borderRadius: "8px",
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
  button: {
    marginBottom: "2rem",
    padding: "10px 20px",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  buttonSmall: {
    marginTop: "1rem",
    padding: "8px 16px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  getStatusStyle: (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#f39c12", fontWeight: "bold" };
      case "completed":
        return { color: "#27ae60", fontWeight: "bold" };
      case "cancelled":
        return { color: "#e74c3c", fontWeight: "bold" };
      default:
        return { color: "#333" };
    }
  },
};

export default Orders;
