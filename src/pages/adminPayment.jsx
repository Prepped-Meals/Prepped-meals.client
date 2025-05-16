import React, { useState } from "react";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import useGetPaymentDetails from "../hooks/useGetPaymentDetails";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const AdminPaymentPage = () => {
  const { loading, data, error } = useGetPaymentDetails();
  const [showTopCustomers, setShowTopCustomers] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showBusiestDay, setShowBusiestDay] = useState(false);

  const generatePDF = async () => {
    const doc = new jsPDF();

    // Draw Page Border
    doc.setDrawColor(150);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277); // (x, y, width, height)

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Weekly Payment Report", 105, 25, { align: "center" });

    // Underline Title
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(60, 28, 150, 28);

    // Date
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 36, {
      align: "center",
    });

    // Top 3 Customers Table
    let tableStartY = 50;
    autoTable(doc, {
      head: [["Customer Name", "Total Paid (Rs.)"]],
      body: data.topCustomers.map((customer) => [
        customer.customer_name,
        customer.totalPaid,
      ]),
      startY: tableStartY,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 12,
        halign: "center",
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: 20, right: 20 },
    });

    const afterTableY = doc.lastAutoTable.finalY + 10;

    // Generate Chart
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.topCustomers.map((customer) => customer.customer_name),
        datasets: [
          {
            label: "Total Paid (Rs.)",
            data: data.topCustomers.map((customer) => customer.totalPaid),
            backgroundColor: ["#3498db", "#2ecc71", "#f1c40f"],
            borderColor: "#2c3e50",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#34495e" },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 10 },
            },
          },
          x: {
            ticks: {
              font: { size: 10 },
            },
          },
        },
      },
    });

    // Wait for Chart to Render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const imgData = canvas.toDataURL("image/png");

    // Add Chart
    doc.addImage(imgData, "PNG", 30, afterTableY, 150, 90);

    let afterChartY = afterTableY + 100;

    // Draw Divider Line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(20, afterChartY, 190, afterChartY);

    afterChartY += 10;

    // Other Insights Section
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Other Insights", 105, afterChartY, { align: "center" });

    afterChartY += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Most Used Payment Method: ${data.mostUsedPaymentMethod}`,
      20,
      afterChartY + 10
    );
    doc.text(`Busiest Payment Day: ${data.busiestDay}`, 20, afterChartY + 20);

    // Save Document
    doc.save("payment-report.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Title and Action */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Weekly Payment Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Comprehensive insights into customer payment activities.
                <span className="block text-sm text-gray-400 mt-1">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </p>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Generate Report
            </button>
          </div>

          {/* Welcome Card */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Payment Insights
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  Explore key payment metrics and customer behaviors. Click the
                  view buttons below to reveal specific insights.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowTopCustomers(!showTopCustomers)}
                    className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    {showTopCustomers ? "Hide" : "View"} Top Customers
                  </button>
                  <button
                    onClick={() => setShowPaymentMethod(!showPaymentMethod)}
                    className="px-5 py-2.5 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                  >
                    {showPaymentMethod ? "Hide" : "View"} Payment Method
                  </button>
                  <button
                    onClick={() => setShowBusiestDay(!showBusiestDay)}
                    className="px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                  >
                    {showBusiestDay ? "Hide" : "View"} Busiest Day
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <svg
                    className="w-32 h-32 text-white opacity-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
                <p className="text-gray-500 text-lg">Loading payment data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hidden Cards that appear when buttons are clicked */}
              {showTopCustomers && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                        🏆
                      </span>
                      Top Customers
                    </h2>
                    <button
                      onClick={() => setShowTopCustomers(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.topCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-700">
                            {customer.customer_name}
                          </span>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Rs. {customer.totalPaid}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showPaymentMethod && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                        💳
                      </span>
                      Most Used Payment Method
                    </h2>
                    <button
                      onClick={() => setShowPaymentMethod(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-12 h-12 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      {data.mostUsedPaymentMethod}
                    </p>
                    <p className="text-gray-500 mt-2">Preferred by customers</p>
                  </div>
                </div>
              )}

              {showBusiestDay && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                      <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                        📅
                      </span>
                      Busiest Payment Day
                    </h2>
                    <button
                      onClick={() => setShowBusiestDay(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-12 h-12 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      {data.busiestDay}
                    </p>
                    <p className="text-gray-500 mt-2">Peak transaction day</p>
                  </div>
                </div>
              )}

              {/* Empty State when nothing is selected */}
              {!showTopCustomers && !showPaymentMethod && !showBusiestDay && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <svg
                    className="w-24 h-24 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-500 mb-2">
                    No insights selected
                  </h3>
                  <p className="text-gray-400 max-w-md text-center">
                    Click on any of the view buttons above to display specific
                    payment insights and metrics.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPaymentPage;
