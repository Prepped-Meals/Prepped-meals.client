// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/authContext";
// import { useGetOrdersByCustomer } from "../hooks/useGetOrders.js";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import logo from "../assets/images/logo.png";
// import orderBg from "../assets/images/OrderBG.jpg";

// const Orders = () => {
//   const { user } = useAuth();
//   const {
//     data: customerOrders,
//     isLoading,
//     isError,
//   } = useGetOrdersByCustomer(user?._id);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [reportSummary, setReportSummary] = useState(null);
//   const [notification, setNotification] = useState({
//     show: false,
//     message: '',
//     type: 'error' // can be 'error' or 'success'
//   });
//   const today = new Date().toISOString().split("T")[0];

//   // Auto-hide notification after 5 seconds
//   useEffect(() => {
//     if (notification.show) {
//       const timer = setTimeout(() => {
//         setNotification({...notification, show: false});
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   const Notification = () => {
//     if (!notification.show) return null;

//     const bgColor = notification.type === 'error' ? '#f8d7da' : '#d4edda';
//     const textColor = notification.type === 'error' ? '#721c24' : '#155724';
//     const borderColor = notification.type === 'error' ? '#f5c6cb' : '#c3e6cb';

//     return (
//       <div style={{
//         position: 'fixed',
//         top: '20px',
//         right: '20px',
//         padding: '15px',
//         backgroundColor: bgColor,
//         color: textColor,
//         border: `1px solid ${borderColor}`,
//         borderRadius: '5px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         zIndex: 1000,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         minWidth: '300px',
//         animation: 'slideIn 0.3s ease-out'
//       }}>
//         <span>{notification.message}</span>
//         <button 
//           onClick={() => setNotification({...notification, show: false})}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: textColor,
//             cursor: 'pointer',
//             marginLeft: '10px',
//             fontSize: '16px',
//             fontWeight: 'bold'
//           }}
//         >
//           ×
//         </button>
//       </div>
//     );
//   };

//   if (isLoading)
//     return <div style={styles.message}>Loading your orders...</div>;
//   if (isError)
//     return (
//       <div style={styles.message}>
//         Something went wrong while fetching orders.
//       </div>
//     );
//   if (!customerOrders?.data?.length)
//     return <div style={styles.message}>You have no orders yet.</div>;

//   const validateDates = () => {
//     if (!startDate || !endDate) {
//       setNotification({
//         show: true,
//         message: 'Please select both start and end dates.',
//         type: 'error'
//       });
//       return false;
//     }
//     if (new Date(startDate) > new Date(endDate)) {
//       setNotification({
//         show: true,
//         message: 'Start date must be before end date.',
//         type: 'error'
//       });
//       return false;
//     }
//     return true;
//   };

//   const viewReportSummary = () => {
//     if (!validateDates()) return;

//     const from = new Date(startDate);
//     const to = new Date(endDate);
//     to.setHours(23, 59, 59, 999);

//     const filteredOrders = customerOrders.data.filter((order) => {
//       const orderDate = new Date(order.order_received_date);
//       return orderDate >= from && orderDate <= to;
//     });

//     if (filteredOrders.length === 0) {
//       setNotification({
//         show: true,
//         message: 'No orders found in the selected date range.',
//         type: 'error'
//       });
//       return;
//     }

//     const mealSummary = {};
//     filteredOrders.forEach((order) => {
//       order.cart_items.forEach((item) => {
//         if (!mealSummary[item.meal_name]) {
//           mealSummary[item.meal_name] = {
//             quantity: 0,
//             price: item.meal_price,
//             totalPrice: 0,
//           };
//         }
//         mealSummary[item.meal_name].quantity += item.quantity;
//         mealSummary[item.meal_name].totalPrice += item.total_price;
//       });
//     });

//     setReportSummary({
//       mealSummary,
//       total: Object.values(mealSummary).reduce(
//         (sum, item) => sum + item.totalPrice,
//         0
//       ),
//     });

//     setNotification({
//       show: true,
//       message: 'Report summary generated successfully!',
//       type: 'success'
//     });
//   };

//   const generateWeeklyReport = () => {
//     if (!validateDates()) return;

//     const from = new Date(startDate);
//     const to = new Date(endDate);
//     to.setHours(23, 59, 59, 999);

//     const filteredOrders = customerOrders.data.filter((order) => {
//       const orderDate = new Date(order.order_received_date);
//       return orderDate >= from && orderDate <= to;
//     });

//     if (filteredOrders.length === 0) {
//       setNotification({
//         show: true,
//         message: 'No orders found in the selected date range.',
//         type: 'error'
//       });
//       return;
//     }

//     const mealSummary = {};
//     filteredOrders.forEach((order) => {
//       order.cart_items.forEach((item) => {
//         if (!mealSummary[item.meal_name]) {
//           mealSummary[item.meal_name] = {
//             quantity: 0,
//             price: item.meal_price,
//             totalPrice: 0,
//           };
//         }
//         mealSummary[item.meal_name].quantity += item.quantity;
//         mealSummary[item.meal_name].totalPrice += item.total_price;
//       });
//     });

//     const total = Object.values(mealSummary).reduce(
//       (sum, item) => sum + item.totalPrice,
//       0
//     );

//     // PDF Generation
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });
//     const pageWidth = doc.internal.pageSize.getWidth();

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(24);
//     doc.text("Heatn'Eat", pageWidth / 2, 20, { align: "center" });

//     doc.setFontSize(18);
//     doc.text("Meal Payment Overview", pageWidth / 2, 30, { align: "center" });

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 38);
//     doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 44);
//     doc.line(10, 48, pageWidth - 10, 48);

//     const mealData = Object.entries(mealSummary).map(([meal, details]) => [
//       meal,
//       details.quantity,
//       `Rs. ${details.price.toFixed(2)}`,
//       `Rs. ${details.totalPrice.toFixed(2)}`,
//     ]);

//     autoTable(doc, {
//       startY: 52,
//       head: [["Meal Name", "Quantity", "Unit Price", "Total Price"]],
//       body: mealData,
//       styles: {
//         font: "helvetica",
//         fontSize: 11,
//         halign: "center",
//         cellPadding: 3,
//       },
//       headStyles: {
//         fillColor: [41, 128, 185],
//         fontSize: 13,
//         fontStyle: "bold",
//         halign: "center",
//       },
//       theme: "striped",
//       margin: { left: 14, right: 14 },
//     });

//     const finalY = doc.lastAutoTable.finalY || 60;
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(14);
//     doc.text("Summary", 14, finalY + 15);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.text(
//       `Total Amount Spent on Meals: Rs. ${total.toFixed(2)}`,
//       14,
//       finalY + 25
//     );

//     doc.setFontSize(10);
//     doc.setTextColor(150);
//     doc.text("Thank you for your order!", pageWidth / 2, 290, {
//       align: "center",
//     });

//     doc.save("Meal_Report.pdf");

//     setNotification({
//       show: true,
//       message: 'PDF report downloaded successfully!',
//       type: 'success'
//     });
//   };

//   const generateReceipt = async (order) => {
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });

//     const pageWidth = doc.internal.pageSize.getWidth();
//     const img = new Image();
//     img.src = logo;

//     img.onload = () => {
//       const imgWidth = 40;
//       const imgHeight = 20;
//       const imgX = (pageWidth - imgWidth) / 2;
//       doc.addImage(img, "PNG", imgX, 10, imgWidth, imgHeight);

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(22);
//       doc.text("Order Receipt", pageWidth / 2, 40, { align: "center" });
//       doc.setDrawColor(0);
//       doc.line(10, 45, pageWidth - 10, 45);

//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(12);

//       const labelX = 14;
//       const valueX = 60;
//       const lineHeight = 8;
//       let y = 55;

//       // Order Info
//       doc.text("Order ID:", labelX, y);
//       doc.text(order._id, valueX, y);

//       doc.text("Status:", labelX, (y += lineHeight));
//       doc.text(order.order_status, valueX, y);

//       doc.text("Date:", labelX, (y += lineHeight));
//       doc.text(
//         new Date(order.order_received_date).toLocaleDateString(),
//         valueX,
//         y
//       );

//       // Payment Details Title
//       y += lineHeight * 2;
//       doc.setFont("helvetica", "bold");
//       doc.text("Payment Details:", labelX, y);
//       doc.setFont("helvetica", "normal");

//       // Address (can be multiline)
//       y += lineHeight;
//       doc.text("Name & Address:", labelX, y);
//       const addressValue = order.payment?.address || "-";
//       const wrappedAddress = doc.splitTextToSize(
//         addressValue,
//         pageWidth - valueX - 14
//       );
//       doc.text(wrappedAddress, valueX, y);
//       y += lineHeight * wrappedAddress.length;

//       // Phone, Amount, Payment Type
//       doc.text("Phone:", labelX, y);
//       doc.text(order.payment?.phone_number || "-", valueX, y);

//       doc.text("Amount:", labelX, (y += lineHeight));
//       doc.text(`Rs. ${order.payment?.payment_amount}`, valueX, y);

//       doc.text("Payment Type:", labelX, (y += lineHeight));
//       doc.text(order.payment?.payment_type || "-", valueX, y);

//       // Cart Items Table
//       const startY = y + lineHeight * 2;
//       const cartItems = order.cart_items.map((item) => [
//         item.meal_name,
//         item.quantity,
//         `Rs. ${item.meal_price.toFixed(2)}`,
//         `Rs. ${item.total_price.toFixed(2)}`,
//       ]);

//       autoTable(doc, {
//         startY: startY,
//         head: [["Meal", "Quantity", "Unit Price", "Total"]],
//         body: cartItems,
//         styles: { halign: "center", fontSize: 11, cellPadding: 3 },
//         headStyles: {
//           fillColor: [41, 128, 185],
//           fontSize: 13,
//           fontStyle: "bold",
//         },
//         theme: "striped",
//         margin: { left: 14, right: 14 },
//       });

//       const finalY = doc.lastAutoTable.finalY || startY + 20;
//       doc.setFontSize(10);
//       doc.setTextColor(150);
//       doc.text("Thank you for ordering with us!", pageWidth / 2, finalY + 20, {
//         align: "center",
//       });

//       doc.save(`Receipt_${order._id}.pdf`);

//       setNotification({
//         show: true,
//         message: 'Receipt downloaded successfully!',
//         type: 'success'
//       });
//     };

//     img.onerror = () => {
//       console.error("Failed to load logo image.");
//       setNotification({
//         show: true,
//         message: 'Failed to generate receipt. Please try again.',
//         type: 'error'
//       });
//     };
//   };

//   return (
//     <div
//       style={{
//         ...styles.container,
//         backgroundImage: `url(${orderBg})`,
//         backgroundSize: "cover",
//         backgroundAttachment: "fixed",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <Notification />
//       <div
//         style={{
//           backgroundColor: "rgba(255, 255, 255, 0.9)",
//           borderRadius: "10px",
//           padding: "2rem",
//         }}
//       >
//              {/* */}
//       <div
//         style={{
//           backgroundColor: "rgba(255, 255, 255, 0.9)", // semi-transparent white overlay
//           borderRadius: "10px",
//           padding: "2rem",
//         }}
//       >
//         <h2
//           style={{
//             fontSize: "32px",
//             fontWeight: "bold",
//             color: "#2c3e50",
//             textAlign: "center",
//             marginBottom: "20px",
//             textTransform: "uppercase",
//             borderBottom: "3px solid #16a085",
//             paddingBottom: "8px",
//           }}
//         >
//           My Orders
//         </h2>

//         {/* Report Generator Section */}
//         <div style={styles.reportContainer}>
//           <h3
//             style={{
//               fontSize: "24px",
//               fontWeight: "600",
//               color: "#2c3e50",
//               marginBottom: "10px",
//               textAlign: "center",
//               textTransform: "uppercase",
//               letterSpacing: "1px",
//             }}
//           >
//             📑 Generate Your Payment Report
//           </h3>

//           <p
//             style={{
//               backgroundColor: "#eafaf1",
//               borderLeft: "6px solid #16a085",
//               padding: "12px 16px",
//               borderRadius: "8px",
//               fontSize: "16px",
//               color: "#2c3e50",
//               fontWeight: "500",
//               marginBottom: "20px",
//               textAlign: "center",
//             }}
//           >
//             Easily select a date range to{" "}
//             <strong>view your payment summary</strong> and{" "}
//             <strong>download a detailed PDF report</strong> for your records.
//           </p>

//           <div style={styles.dateRow}>
//             <div>
//               <label>Start Date:</label>
//               <br />
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 max={today}
//                 style={styles.dateInput}
//               />
//             </div>
//             <div>
//               <label>End Date:</label>
//               <br />
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 max={today}
//                 style={styles.dateInput}
//               />
//             </div>
//           </div>

//           <div style={styles.buttonRow}>
//             <button
//               onClick={viewReportSummary}
//               style={{ ...styles.button, backgroundColor: "#16a085" }}
//             >
//               View Report Summary
//             </button>
//             <button onClick={generateWeeklyReport} style={styles.button}>
//               Download PDF Report
//             </button>
//             {reportSummary && (
//               <button
//                 onClick={() => setReportSummary(null)}
//                 style={{ ...styles.button, backgroundColor: "#16a085" }}
//               >
//                 Clear Summary
//               </button>
//             )}
//           </div>

//           {/* Summary Display */}
//           {reportSummary && (
//             <div style={styles.summaryBox}>
//               <h4 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
//                 Report Summary
//               </h4>
//               <ul>
//                 {Object.entries(reportSummary.mealSummary).map(
//                   ([meal, details]) => (
//                     <li key={meal}>
//                       {meal} — {details.quantity} x Rs.{" "}
//                       {details.price.toFixed(2)} = Rs.{" "}
//                       {details.totalPrice.toFixed(2)}
//                     </li>
//                   )
//                 )}
//               </ul>
//               <p>
//                 <strong>Total Spent:</strong> Rs.{" "}
//                 {reportSummary.total.toFixed(2)}
//               </p>
//             </div>
//           )}
//         </div>
//         <h3
//           style={{
//             fontSize: "24px",
//             fontWeight: "600",
//             color: "#2c3e50",
//             marginTop: "40px",
//             marginBottom: "20px",
//             borderBottom: "2px solid #16a085",
//             paddingBottom: "8px",
//             textAlign: "center",
//             textTransform: "uppercase",
//             letterSpacing: "1px",
//           }}
//         >
//           🗂️ Order History
//         </h3>

//         {/* Order Cards */}
//         <div style={styles.ordersList}>
//           {customerOrders.data.map((order) => (
//             <div key={order._id} style={styles.orderCard}>
//               <h3 style={styles.orderId}>Order ID: {order._id}</h3>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 <span style={styles.getStatusStyle(order.order_status)}>
//                   {order.order_status}
//                 </span>
//               </p>
//               <p>
//                 <strong>Billing Date:</strong>{" "}
//                 {new Date(order.order_received_date).toLocaleDateString()}
//               </p>

//               <div style={styles.paymentDetailsSection}>
//                 <h4>Payment Details</h4>
//                 <p>
//                   <strong>Name & Address:</strong> {order.payment?.address}
//                 </p>
//                 <p>
//                   <strong>Phone:</strong> {order.payment?.phone_number}
//                 </p>
//                 <p>
//                   <strong>Amount:</strong> Rs. {order.payment?.payment_amount}
//                 </p>
//                 <p>
//                   <strong>Payment Type:</strong> {order.payment?.payment_type}
//                 </p>
//               </div>

//               <div style={styles.cartItemsSection}>
//                 <h4>Cart Items</h4>
//                 <ul style={styles.cartList}>
//                   {order.cart_items.map((item, idx) => (
//                     <li key={idx} style={styles.cartItem}>
//                       {item.meal_name} — {item.quantity} x Rs. {item.meal_price}{" "}
//                       = Rs. {item.total_price}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <button
//                 onClick={() => generateReceipt(order)}
//                 style={styles.buttonSmall}
//               >
//                 Generate Receipt
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: "2rem",
//     minHeight: "100vh",
//   },
//   title: {
//     marginBottom: "1.5rem",
//     fontSize: "2rem",
//     color: "#2c3e50",
//     fontFamily: "'Playfair Display', serif",
//   },
//   reportContainer: {
//     border: "1px solid #ddd",
//     borderRadius: "10px",
//     padding: "1.5rem",
//     backgroundColor: "#ffffff",
//     marginBottom: "2rem",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },
//   sectionTitle: {
//     fontSize: "1.25rem",
//     marginBottom: "1rem",
//     color: "#2980b9",
//   },
//   dateRow: {
//     display: "flex",
//     gap: "1rem",
//     marginBottom: "1rem",
//   },
//   buttonRow: {
//     display: "flex",
//     gap: "1rem",
//     marginBottom: "1rem",
//   },
//   summaryBox: {
//     backgroundColor: "#ecf0f1",
//     padding: "1rem",
//     borderRadius: "8px",
//     fontSize: "1rem",
//   },
//   ordersList: {
//     display: "grid",
//     gap: "1.5rem",
//   },
//   orderCard: {
//     border: "1px solid #ddd",
//     borderRadius: "10px",
//     padding: "1.5rem",
//     backgroundColor: "#ffffff",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//     fontFamily: "'Lora', serif",
//   },
//   orderId: {
//     marginBottom: "0.5rem",
//     fontSize: "1.2rem",
//     fontWeight: "bold",
//     color: "#34495e",
//   },
//   paymentDetailsSection: {
//     marginTop: "1rem",
//     padding: "1rem",
//     backgroundColor: "#e7f3fe",
//     borderRadius: "8px",
//   },
//   cartItemsSection: {
//     marginTop: "1rem",
//     padding: "1rem",
//     backgroundColor: "#fff8e1",
//     borderRadius: "8px",
//   },
//   cartList: {
//     paddingLeft: "1.5rem",
//   },
//   cartItem: {
//     marginBottom: "0.5rem",
//     fontSize: "1rem",
//     color: "#555",
//   },
//   message: {
//     textAlign: "center",
//     fontSize: "1.2rem",
//     color: "#555",
//     padding: "20px",
//   },
//   button: {
//     padding: "10px 20px",
//     backgroundColor: "#2980b9",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontSize: "1rem",
//   },
//   buttonSmall: {
//     marginTop: "1rem",
//     padding: "8px 16px",
//     backgroundColor: "#27ae60",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontSize: "0.9rem",
//   },
//   // eslint-disable-next-line
//   ordersList: {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)",
//     gap: "20px",
//     padding: "10px",
//   },
//   // eslint-disable-next-line
//   orderCard: {
//     border: "1px solid #ddd",
//     borderRadius: "10px",
//     padding: "1.5rem",
//     backgroundColor: "#ffffff",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//     fontFamily: "'Lora', serif",
//     width: "100%",
//     boxSizing: "border-box",
//   },
//   getStatusStyle: (status) => {
//     switch (status.toLowerCase()) {
//       case "pending":
//         return { color: "#f39c12", fontWeight: "bold" };
//       case "completed":
//         return { color: "#27ae60", fontWeight: "bold" };
//       case "cancelled":
//         return { color: "#e74c3c", fontWeight: "bold" };
//       default:
//         return { color: "#333" };
//     }
//   },
//   dateInput: {
//     padding: "8px",
//     borderRadius: "5px",
//     border: "1px solid #ccc",
//     fontSize: "1rem",
//   },
// };

// export default Orders;




import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useGetOrdersByCustomer } from "../hooks/useGetOrders.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/images/logo.png";
import orderBg from "../assets/images/OrderBG.jpg";

const Orders = () => {
  const { user } = useAuth();
  const {
    data: customerOrders,
    isLoading,
    isError,
  } = useGetOrdersByCustomer(user?._id);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportSummary, setReportSummary] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'error' // can be 'error' or 'success'
  });
  const today = new Date().toISOString().split("T")[0];

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({...notification, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Function to reset date inputs
  const resetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const Notification = () => {
    if (!notification.show) return null;

    const bgColor = notification.type === 'error' ? '#f8d7da' : '#d4edda';
    const textColor = notification.type === 'error' ? '#721c24' : '#155724';
    const borderColor = notification.type === 'error' ? '#f5c6cb' : '#c3e6cb';

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <span>{notification.message}</span>
        <button 
          onClick={() => setNotification({...notification, show: false})}
          style={{
            background: 'none',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            marginLeft: '10px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>
    );
  };

  if (isLoading)
    return <div style={styles.message}>Loading your orders...</div>;
  if (isError)
    return (
      <div style={styles.message}>
        Something went wrong while fetching orders.
      </div>
    );
  if (!customerOrders?.data?.length)
    return <div style={styles.message}>You have no orders yet.</div>;

  const validateDates = () => {
    if (!startDate || !endDate) {
      setNotification({
        show: true,
        message: 'Please select both start and end dates.',
        type: 'error'
      });
      resetDates(); // Clear dates on invalid input
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setNotification({
        show: true,
        message: 'Start date must be before end date.',
        type: 'error'
      });
      resetDates(); // Clear dates on invalid range
      return false;
    }
    return true;
  };

  const viewReportSummary = () => {
    if (!validateDates()) return;

    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const filteredOrders = customerOrders.data.filter((order) => {
      const orderDate = new Date(order.order_received_date);
      return orderDate >= from && orderDate <= to;
    });

    if (filteredOrders.length === 0) {
      setNotification({
        show: true,
        message: 'No orders found in the selected date range.',
        type: 'error'
      });
      resetDates(); // Clear dates when no orders found
      return;
    }

    const mealSummary = {};
    filteredOrders.forEach((order) => {
      order.cart_items.forEach((item) => {
        if (!mealSummary[item.meal_name]) {
          mealSummary[item.meal_name] = {
            quantity: 0,
            price: item.meal_price,
            totalPrice: 0,
          };
        }
        mealSummary[item.meal_name].quantity += item.quantity;
        mealSummary[item.meal_name].totalPrice += item.total_price;
      });
    });

    setReportSummary({
      mealSummary,
      total: Object.values(mealSummary).reduce(
        (sum, item) => sum + item.totalPrice,
        0
      ),
    });

    setNotification({
      show: true,
      message: 'Report summary generated successfully!',
      type: 'success'
    });
  };

  const generateWeeklyReport = () => {
    if (!validateDates()) return;

    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const filteredOrders = customerOrders.data.filter((order) => {
      const orderDate = new Date(order.order_received_date);
      return orderDate >= from && orderDate <= to;
    });

    if (filteredOrders.length === 0) {
      setNotification({
        show: true,
        message: 'No orders found in the selected date range.',
        type: 'error'
      });
      resetDates(); // Clear dates when no orders found
      return;
    }

    const mealSummary = {};
    filteredOrders.forEach((order) => {
      order.cart_items.forEach((item) => {
        if (!mealSummary[item.meal_name]) {
          mealSummary[item.meal_name] = {
            quantity: 0,
            price: item.meal_price,
            totalPrice: 0,
          };
        }
        mealSummary[item.meal_name].quantity += item.quantity;
        mealSummary[item.meal_name].totalPrice += item.total_price;
      });
    });

    const total = Object.values(mealSummary).reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // PDF Generation
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Heatn'Eat", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(18);
    doc.text("Meal Payment Overview", pageWidth / 2, 30, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 38);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 44);
    doc.line(10, 48, pageWidth - 10, 48);

    const mealData = Object.entries(mealSummary).map(([meal, details]) => [
      meal,
      details.quantity,
      `Rs. ${details.price.toFixed(2)}`,
      `Rs. ${details.totalPrice.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 52,
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

    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Summary", 14, finalY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
      `Total Amount Spent on Meals: Rs. ${total.toFixed(2)}`,
      14,
      finalY + 25
    );

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for your order!", pageWidth / 2, 290, {
      align: "center",
    });

    doc.save("Meal_Report.pdf");

    setNotification({
      show: true,
      message: 'PDF report downloaded successfully!',
      type: 'success'
    });
    
    resetDates(); // Clear dates after successful PDF generation
  };

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
      const imgWidth = 40;
      const imgHeight = 20;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(img, "PNG", imgX, 10, imgWidth, imgHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Order Receipt", pageWidth / 2, 40, { align: "center" });
      doc.setDrawColor(0);
      doc.line(10, 45, pageWidth - 10, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      const labelX = 14;
      const valueX = 60;
      const lineHeight = 8;
      let y = 55;

      // Order Info
      doc.text("Order ID:", labelX, y);
      doc.text(order._id, valueX, y);

      doc.text("Status:", labelX, (y += lineHeight));
      doc.text(order.order_status, valueX, y);

      doc.text("Date:", labelX, (y += lineHeight));
      doc.text(
        new Date(order.order_received_date).toLocaleDateString(),
        valueX,
        y
      );

      // Payment Details Title
      y += lineHeight * 2;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details:", labelX, y);
      doc.setFont("helvetica", "normal");

      // Address (can be multiline)
      y += lineHeight;
      doc.text("Name & Address:", labelX, y);
      const addressValue = order.payment?.address || "-";
      const wrappedAddress = doc.splitTextToSize(
        addressValue,
        pageWidth - valueX - 14
      );
      doc.text(wrappedAddress, valueX, y);
      y += lineHeight * wrappedAddress.length;

      // Phone, Amount, Payment Type
      doc.text("Phone:", labelX, y);
      doc.text(order.payment?.phone_number || "-", valueX, y);

      doc.text("Amount:", labelX, (y += lineHeight));
      doc.text(`Rs. ${order.payment?.payment_amount}`, valueX, y);

      doc.text("Payment Type:", labelX, (y += lineHeight));
      doc.text(order.payment?.payment_type || "-", valueX, y);

      // Cart Items Table
      const startY = y + lineHeight * 2;
      const cartItems = order.cart_items.map((item) => [
        item.meal_name,
        item.quantity,
        `Rs. ${item.meal_price.toFixed(2)}`,
        `Rs. ${item.total_price.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: startY,
        head: [["Meal", "Quantity", "Unit Price", "Total"]],
        body: cartItems,
        styles: { halign: "center", fontSize: 11, cellPadding: 3 },
        headStyles: {
          fillColor: [41, 128, 185],
          fontSize: 13,
          fontStyle: "bold",
        },
        theme: "striped",
        margin: { left: 14, right: 14 },
      });

      const finalY = doc.lastAutoTable.finalY || startY + 20;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Thank you for ordering with us!", pageWidth / 2, finalY + 20, {
        align: "center",
      });

      doc.save(`Receipt_${order._id}.pdf`);

      setNotification({
        show: true,
        message: 'Receipt downloaded successfully!',
        type: 'success'
      });
    };

    img.onerror = () => {
      console.error("Failed to load logo image.");
      setNotification({
        show: true,
        message: 'Failed to generate receipt. Please try again.',
        type: 'error'
      });
    };
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${orderBg})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Notification />
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
          padding: "2rem",
        }}
      >
             {/* */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)", // semi-transparent white overlay
          borderRadius: "10px",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#2c3e50",
            textAlign: "center",
            marginBottom: "20px",
            textTransform: "uppercase",
            borderBottom: "3px solid #16a085",
            paddingBottom: "8px",
          }}
        >
          My Orders
        </h2>

        {/* Report Generator Section */}
        <div style={styles.reportContainer}>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#2c3e50",
              marginBottom: "10px",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            📑 Generate Your Payment Report
          </h3>

          <p
            style={{
              backgroundColor: "#eafaf1",
              borderLeft: "6px solid #16a085",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#2c3e50",
              fontWeight: "500",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Easily select a date range to{" "}
            <strong>view your payment summary</strong> and{" "}
            <strong>download a detailed PDF report</strong> for your records.
          </p>

          <div style={styles.dateRow}>
            <div>
              <label>Start Date:</label>
              <br />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
                style={styles.dateInput}
              />
            </div>
            <div>
              <label>End Date:</label>
              <br />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={today}
                style={styles.dateInput}
              />
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button
              onClick={viewReportSummary}
              style={{ ...styles.button, backgroundColor: "#16a085" }}
            >
              View Report Summary
            </button>
            <button onClick={generateWeeklyReport} style={styles.button}>
              Download PDF Report
            </button>
            {reportSummary && (
              <button
                onClick={() => {
                  setReportSummary(null);
                  resetDates(); // Clear dates when clearing summary
                }}
                style={{ ...styles.button, backgroundColor: "#16a085" }}
              >
                Clear Summary
              </button>
            )}
          </div>

          {/* Summary Display */}
          {reportSummary && (
            <div style={styles.summaryBox}>
              <h4 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>
                Report Summary
              </h4>
              <ul>
                {Object.entries(reportSummary.mealSummary).map(
                  ([meal, details]) => (
                    <li key={meal}>
                      {meal} — {details.quantity} x Rs.{" "}
                      {details.price.toFixed(2)} = Rs.{" "}
                      {details.totalPrice.toFixed(2)}
                    </li>
                  )
                )}
              </ul>
              <p>
                <strong>Total Spent:</strong> Rs.{" "}
                {reportSummary.total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#2c3e50",
            marginTop: "40px",
            marginBottom: "20px",
            borderBottom: "2px solid #16a085",
            paddingBottom: "8px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          🗂️ Order History
        </h3>

        {/* Order Cards */}
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
              <p>
                <strong>Billing Date:</strong>{" "}
                {new Date(order.order_received_date).toLocaleDateString()}
              </p>

              <div style={styles.paymentDetailsSection}>
                <h4>Payment Details</h4>
                <p>
                  <strong>Name & Address:</strong> {order.payment?.address}
                </p>
                <p>
                  <strong>Phone:</strong> {order.payment?.phone_number}
                </p>
                <p>
                  <strong>Amount:</strong> Rs. {order.payment?.payment_amount}
                </p>
                <p>
                  <strong>Payment Type:</strong> {order.payment?.payment_type}
                </p>
              </div>

              <div style={styles.cartItemsSection}>
                <h4>Cart Items</h4>
                <ul style={styles.cartList}>
                  {order.cart_items.map((item, idx) => (
                    <li key={idx} style={styles.cartItem}>
                      {item.meal_name} — {item.quantity} x Rs. {item.meal_price}{" "}
                      = Rs. {item.total_price}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => generateReceipt(order)}
                style={styles.buttonSmall}
              >
                Generate Receipt
              </button>
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
    minHeight: "100vh",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "2rem",
    color: "#2c3e50",
    fontFamily: "'Playfair Display', serif",
  },
  reportContainer: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    marginBottom: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "1rem",
    color: "#2980b9",
  },
  dateRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  buttonRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  summaryBox: {
    backgroundColor: "#ecf0f1",
    padding: "1rem",
    borderRadius: "8px",
    fontSize: "1rem",
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
  // eslint-disable-next-line
  ordersList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    padding: "10px",
  },
  // eslint-disable-next-line
  orderCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Lora', serif",
    width: "100%",
    boxSizing: "border-box",
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
  dateInput: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
};

export default Orders;

