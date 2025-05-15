import React from "react";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import useGetPaymentDetails from "../hooks/useGetPaymentDetails";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const AdminPaymentPage = () => {
  const { loading, data, error } = useGetPaymentDetails();

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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="p-10 space-y-10 overflow-y-auto">
          {/* Title and Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 mb-1">
                Weekly Payment Summary
              </h1>
              <p className="text-md text-gray-500">
                Insights into customer payments for better business decisions.
              </p>
            </div>
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
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
              Download Report
            </button>
          </div>

          {/* Summary Cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-lg animate-pulse">
                Loading payment report...
              </p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Top 3 Customers */}
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
                    🏆 Top 3 Customers
                  </h2>
                  <ul className="space-y-4">
                    {data.topCustomers.map((customer, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-gray-600 font-medium"
                      >
                        <span>{customer.customer_name}</span>
                        <span className="text-blue-600 font-bold">
                          Rs.{customer.totalPaid}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Most Used Payment Method */}
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
                    💳 Most Used Payment Method
                  </h2>
                  <p className="text-gray-600 text-xl font-bold">
                    {data.mostUsedPaymentMethod}
                  </p>
                </div>

                {/* Busiest Payment Day */}
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
                    📅 Busiest Payment Day
                  </h2>
                  <p className="text-gray-600 text-xl font-bold">
                    {data.busiestDay}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 mt-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center mb-4">
                  <span className="text-blue-600 text-2xl mr-3">📊</span>
                  <h2 className="text-2xl font-semibold text-gray-700">
                    Weekly Overview Summary
                  </h2>
                </div>
                <p className="text-gray-600 text-md leading-relaxed">
                  This screen provides a comprehensive weekly overview of
                  payment activity. It highlights the
                  <span className="font-semibold text-blue-600">
                    {" "}
                    top 3 customers
                  </span>{" "}
                  with the highest payment totals, showcases the{" "}
                  <span className="font-semibold text-green-600">
                    {" "}
                    most frequently used payment method
                  </span>
                  , and identifies the{" "}
                  <span className="font-semibold text-purple-600">
                    {" "}
                    busiest day
                  </span>{" "}
                  for customer transactions.
                </p>
              </div>

              {/* Bottom Action */}
              <div className="mt-10 text-center">
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleDateString()} • All data is
                  refreshed weekly
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPaymentPage;
