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

    // Title Page
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Weekly Payment Report", 105, 30, null, null, "center");

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      105,
      40,
      null,
      null,
      "center"
    );

    doc.addPage(); // Move to next page

    // Top 3 Customers Section
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Top 3 Customers", 14, 20);

    autoTable(doc, {
      head: [["Customer Name", "Total Paid ($)"]],
      body: data.topCustomers.map((customer) => [
        customer.customer_name,
        customer.totalPaid,
      ]),
      startY: 30,
    });

    // Bar Chart Section
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.topCustomers.map((customer) => customer.customer_name),
        datasets: [
          {
            label: "Total Paid ($)",
            data: data.topCustomers.map((customer) => customer.totalPaid),
            backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
          },
        ],
      },
      options: {
        responsive: false,
        width: 400,
        height: 300,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Wait for chart to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const imgData = canvas.toDataURL("image/png");

    doc.addPage();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Top Customers Payment Chart", 14, 20);

    doc.addImage(imgData, "PNG", 20, 30, 170, 90);

    // Payment Method & Busiest Day Section
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Other Payment Insights", 14, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Most Used Payment Method: ${data.mostUsedPaymentMethod}`, 14, 40);
    doc.text(`Busiest Day: ${data.busiestDay}`, 14, 55);

    // Save the document
    doc.save("payment-report.pdf");
  };

  return (
    <div className="flex min-h-screen bg-[#d1dfcd]">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content Below Header */}
        <div className="p-10 flex flex-col gap-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Payment Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage payment methods and transactions here.
          </p>

          {/* Report Display */}
          {loading ? (
            <p>Loading payment report...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Weekly Payment Report
              </h2>
              <div>
                <h3 className="text-lg font-medium">Top 3 Customers</h3>
                <ul>
                  {data.topCustomers.map((customer, index) => (
                    <li key={index}>
                      {customer.customer_name} - Rs.{customer.totalPaid}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">
                  Most Used Payment Method
                </h3>
                <p>{data.mostUsedPaymentMethod}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Busiest Payment Day</h3>
                <p>{data.busiestDay}</p>
              </div>

              {/* Button to Generate Report */}
              <button
                onClick={generatePDF}
                className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Generate PDF Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentPage;
