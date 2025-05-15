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

 const chartData = useMemo(() => {
  // Group registrations by date and count them
  const registrationsByDate = reportData.reduce((acc, customer) => {
    const date = new Date(customer.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to array of dates and sort chronologically
  const sortedDates = Object.keys(registrationsByDate).sort((a, b) => new Date(a) - new Date(b));
  
  // Calculate cumulative registrations
  let cumulativeCount = 0;
  const cumulativeData = sortedDates.map(date => {
    cumulativeCount += registrationsByDate[date];
    return cumulativeCount;
  });

  return {
    labels: sortedDates,
    datasets: [{
      label: "Cumulative Registrations",
      data: cumulativeData,
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
      tension: 0.3, // Makes the line slightly curved
      fill: true,
      pointBackgroundColor: "rgba(75, 192, 192, 1)",
      pointRadius: 4,
      pointHoverRadius: 6
    }],
  };
}, [reportData]);

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
        maintainAspectRatio: false,
        plugins: {
          title: { 
            display: true, 
            text: "Customer Registrations Over Time",
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
              font: {
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: "Total Registrations",
              font: {
                weight: 'bold'
              }
            },
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
        }
      },
    });
  }
}, [reportData, chartData]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Registration Report</h2>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button 
                  onClick={generateReport} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : "View Report"}
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  disabled={loadingPdf}
                >
                  {loadingPdf ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </span>
                  ) : "Download PDF"}
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {reportData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((customer, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {customer.f_name} {customer.l_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(customer.createdAt).toISOString().split('T')[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {reportData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Trends</h3>
                <div className="h-80">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            )}

            {!loading && reportData.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No records found</h3>
                <p className="mt-1 text-sm text-gray-500">Try selecting different date range to generate the report.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegistrationReport;