import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import SidebarAdmin from '../components/sidebarAdmin';
import HeaderAdmin from '../components/headerAdmin';

// Register the necessary components for the line chart
ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RegistrationReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const chartRef = useRef(null);


  //validateDates function to check the date inputs
  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return false;
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("Start date cannot be after end date.");
      return false;
    }

    if (start > now || end > now) {
      setError("Dates cannot be in the future.");
      return false;
    }

    if (start.toDateString() === end.toDateString()) {
      setError("Start and end dates cannot be the same.");
      return false;
    }

    return true;
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    if (!validateDates()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `/api/registration-report-data?startDate=${startDate}&endDate=${endDate}`,
        { withCredentials: true }
      );

      const { customers } = response.data;

      if (Array.isArray(customers)) {
        setReportData(customers);
      } else {
        setReportData([]);
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
      setReportData([]);
    }

    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!validateDates()) return;

    setLoadingPdf(true);
    try {
      const res = await axios.get(
        `/api/registration-report?startDate=${startDate}&endDate=${endDate}`,
        { withCredentials: true, responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Registration_Report_${startDate}_to_${endDate}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const chartData = useMemo(() => ({
    labels: reportData.map(customer => {
      const date = new Date(customer.createdAt);
      return date.toISOString().split('T')[0];
    }),
    datasets: [{
      label: "Registrations",
      data: reportData.map(() => 1),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    }],
  }), [reportData]);

  useEffect(() => {
    if (chartRef.current && reportData.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      if (ChartJS.getChart(ctx)) {
        ChartJS.getChart(ctx).destroy();
      }

      new ChartJS(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: "Customer Registrations Over Time" },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              title: {
                display: true,
                text: "Registrations Count",
              },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [reportData, chartData]);

  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <h2 className="text-2xl font-bold mb-4 p-6">Customer Registration Report</h2>

        <div className="mb-4 flex gap-2 p-6">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2"
          />
          <button onClick={generateReport} className="bg-green-600 text-white px-4 py-2 rounded">
            View Report
          </button>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loadingPdf}
          >
            {loadingPdf ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        {error && <p className="text-red-500 p-6">{error}</p>}
        {loading && <p>Loading...</p>}

        {reportData.length > 0 && (
          <>
            <table className="min-w-full border mt-6 p-6">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((customer, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{customer.f_name} {customer.l_name}</td>
                    <td className="border p-2">{customer.email}</td>
                    <td className="border p-2">{new Date(customer.createdAt).toISOString().split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 p-6">
              <canvas ref={chartRef}></canvas>
            </div>
          </>
        )}

        {!loading && reportData.length === 0 && <p className="text-gray-600 mt-4 p-6">No records found for the selected dates.</p>}
      </div>
    </div>
  );
};

export default RegistrationReport;
