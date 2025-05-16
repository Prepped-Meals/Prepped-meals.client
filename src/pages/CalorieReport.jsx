import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, BarController);

const CalorieReport = () => {
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("week");
  const [reportData, setReportData] = useState([]);
  const [highestCaloriesDay, setHighestCaloriesDay] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/customers/me", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setCustomerId(data._id);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchCustomer();
  }, [navigate]);

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

    // Validate maximum date range (e.g., 1 year)
    const maxDateRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if ((end - start) > maxDateRange) {
      setError("Date range cannot exceed 1 year.");
      return false;
    }

    // Validate minimum date range based on mode
    if (mode === "week" && (end - start) < (6 * 24 * 60 * 60 * 1000)) {
      setError("For weekly reports, please select at least 7 days.");
      return false;
    }

    if (mode === "month" && (end - start) < (28 * 24 * 60 * 60 * 1000)) {
      setError("For monthly reports, please select at least 28 days.");
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
        `/api/orders/calorie-report/${customerId}?startDate=${startDate}&endDate=${endDate}&mode=${mode}`,
        { withCredentials: true }
      );

      const { detailedMeals, highestCaloriesDay } = response.data;

      if (Array.isArray(detailedMeals)) {
        setReportData(detailedMeals);
        setHighestCaloriesDay(highestCaloriesDay);
      } else {
        setReportData([]);
        setHighestCaloriesDay(null);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
      setReportData([]);
      setHighestCaloriesDay(null);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    setLoadingPdf(true);
    setError(null);

    if (!validateDates()) {
      setLoadingPdf(false);
      return;
    }

    try {
      const res = await axios.get(
        `/api/orders/downloadPDF/${customerId}`,
        { 
          params: { startDate, endDate, mode },
          withCredentials: true, 
          responseType: "blob"
        }
      );
  
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Calorie_Report_${startDate}_to_${endDate}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const chartData = useMemo(() => ({
    labels: reportData.map(item => item.date),
    datasets: [{
      label: "Calories",
      data: reportData.map(item => item.calories),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    }],
  }), [reportData]);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartRef.current && reportData.length > 0) {
      const ctx = chartRef.current.getContext("2d");
      const newChart = new ChartJS(ctx, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { 
              display: true, 
              text: "Calories Consumed",
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
                text: "Calories",
                font: {
                  weight: 'bold'
                }
              },
              beginAtZero: true
            },
          },
          interaction: {
            intersect: false,
            mode: 'nearest'
          }
        },
      });
      chartInstanceRef.current = newChart;
    }
  }, [chartData, reportData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-800 p-6 text-white">
          <h1 className="text-3xl font-bold">Calorie Consumption Report</h1>
          <p className="mt-2">Track your calorie consumption over time</p>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate Report</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={generateReport} 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                disabled={loadingPdf || reportData.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
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
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
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

          {reportData.length > 0 ? (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Calorie Consumption Data</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mealName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.calories}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {highestCaloriesDay && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Highest Calorie Day</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>{highestCaloriesDay.day} with {highestCaloriesDay.calories} calories consumed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Calorie Consumption Chart</h3>
                <div className="h-96">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No report data</h3>
                <p className="mt-1 text-sm text-gray-500">Select a date range and generate a report to view your calorie consumption.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CalorieReport;