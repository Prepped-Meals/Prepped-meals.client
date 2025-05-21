import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useGetOrdersByCustomer } from "../hooks/useGetOrders.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/images/logo.png";
import orderBg from "../assets/images/OrderBG.jpg";
import { FaClipboardList, FaCalendarAlt, FaFilePdf, FaReceipt } from "react-icons/fa";
import { MdOutlineSummarize, MdClear } from "react-icons/md";

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
    message: "",
    type: "error",
  });
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const resetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const Notification = () => {
    if (!notification.show) return null;

    const bgColor = notification.type === "error" ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700";
    const borderColor = notification.type === "error" ? "border-red-500" : "border-green-500";

    return (
      <div className={`fixed top-5 right-5 border ${bgColor} ${borderColor} px-4 py-3 rounded-lg shadow-lg max-w-md z-50 flex justify-between items-center transition-all duration-300 transform translate-x-0`}>
        <span className="block sm:inline">{notification.message}</span>
        <button
          onClick={() => setNotification({ ...notification, show: false })}
          className="ml-4 text-xl font-bold hover:text-gray-800"
        >
          &times;
        </button>
      </div>
    );
  };

  if (isLoading) return <div className="text-center py-10 text-xl text-gray-600">Loading your orders...</div>;
  if (isError) return <div className="text-center py-10 text-xl text-red-600">Something went wrong while fetching orders.</div>;
  if (!customerOrders?.data?.length) return <div className="text-center py-10 text-xl text-gray-600">You have no orders yet.</div>;

  const validateDates = () => {
    if (!startDate || !endDate) {
      setNotification({
        show: true,
        message: "Please select both start and end dates.",
        type: "error",
      });
      resetDates();
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setNotification({
        show: true,
        message: "Start date must be before end date.",
        type: "error",
      });
      resetDates();
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
        message: "No orders found in the selected date range.",
        type: "error",
      });
      resetDates();
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
      message: "Report summary generated successfully!",
      type: "success",
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
        message: "No orders found in the selected date range.",
        type: "error",
      });
      resetDates();
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
      message: "PDF report downloaded successfully!",
      type: "success",
    });

    resetDates();
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
        message: "Receipt downloaded successfully!",
        type: "success",
      });
    };

    img.onerror = () => {
      console.error("Failed to load logo image.");
      setNotification({
        show: true,
        message: "Failed to generate receipt. Please try again.",
        type: "error",
      });
    };
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundImage: `url(${orderBg})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Notification />
      <div className="bg-white bg-opacity-90 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              My Order History
            </h1>
            <div className="w-24 h-1 bg-teal-500 mx-auto rounded-full"></div>
          </div>

          {/* Report Generator Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-10 border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FaFilePdf className="text-3xl text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Generate Payment Report
              </h2>
            </div>

            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-6 rounded">
              <p className="text-gray-700">
                Select a date range to view your payment summary and download a
                detailed PDF report for your records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={today}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={today}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 border"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                onClick={viewReportSummary}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200"
              >
                <MdOutlineSummarize />
                View Summary
              </button>
              <button
                onClick={generateWeeklyReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                <FaFilePdf />
                Download PDF
              </button>
              {reportSummary && (
                <button
                  onClick={() => {
                    setReportSummary(null);
                    resetDates();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                >
                  <MdClear />
                  Clear
                </button>
              )}
            </div>

            {/* Summary Display */}
            {reportSummary && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MdOutlineSummarize className="text-teal-600" />
                  Report Summary
                </h3>
                <div className="space-y-2 mb-3">
                  {Object.entries(reportSummary.mealSummary).map(
                    ([meal, details]) => (
                      <div
                        key={meal}
                        className="flex justify-between border-b border-gray-100 pb-2"
                      >
                        <span className="font-medium">{meal}</span>
                        <span>
                          {details.quantity} × Rs. {details.price.toFixed(2)} ={" "}
                          <span className="font-semibold">
                            Rs. {details.totalPrice.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="pt-2 border-t border-gray-200 font-bold text-lg">
                  Total Spent: Rs. {reportSummary.total.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Order History Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FaClipboardList className="text-3xl text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Your Order History
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {customerOrders.data.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Order #: {order._id}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Ordered on:{" "}
                          {new Date(
                            order.order_received_date
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-bold text-teal-600 mt-1">
                          Rs. {order.payment?.payment_amount}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                          Payment Details
                        </h4>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Name & Address:</span>{" "}
                            <span className="text-gray-600">
                              {order.payment?.address || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            <span className="text-gray-600">
                              {order.payment?.phone_number || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Payment Type:</span>{" "}
                            <span className="text-gray-600">
                              {order.payment?.payment_type || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                          Ordered Items
                        </h4>
                        <ul className="space-y-2">
                          {order.cart_items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between border-b border-gray-100 pb-2"
                            >
                              <span className="font-medium">
                                {item.meal_name}
                              </span>
                              <span>
                                {item.quantity} × Rs. {item.meal_price} ={" "}
                                <span className="font-semibold">
                                  Rs. {item.total_price}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => generateReceipt(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200"
                      >
                        <FaReceipt />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
