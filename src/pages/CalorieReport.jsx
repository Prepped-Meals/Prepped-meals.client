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
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("week");
  const [reportData, setReportData] = useState([]);
  const [highestCaloriesDay, setHighestCaloriesDay] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // ✅ useRef instead of useState
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

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    if (!startDate || !endDate) {
      setError("Select start and end dates.");
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
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate report.");
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    try {
      // Ensure the URL includes startDate, endDate, and mode
      const res = await axios.get(
        `/api/orders/downloadPDF/${customerId}`,  // Make sure the customerId is in the correct URL path
        { 
          params: { startDate, endDate, mode },  // Attach startDate, endDate, and mode as query parameters
          withCredentials: true, 
          responseType: "blob"  // Ensure response is of type "blob" to handle PDF
        }
      );
  
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Calorie_Report_${startDate}_to_${endDate}.pdf`;
      link.click();  // Trigger download
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF.");
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
      const newChart = new ChartJS(chartRef.current, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: "Calories Consumed" },
          },
        },
      });
      chartInstanceRef.current = newChart;
    }
  }, [chartData, reportData]); // ✅ no chartInstance in dependency

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Calorie Report</h2>

      <div className="mb-4 flex gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2" />
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="border p-2">
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
        <button onClick={generateReport} className="bg-green-600 text-white px-4 py-2 rounded">
          View Report
        </button>
        <button onClick={downloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
          Download PDF
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      {reportData.length > 0 && (
        <>
          <table className="min-w-full border mt-6">
            <thead>
              <tr>
                <th className="border p-2">Meal</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Calories</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{item.mealName}</td>
                  <td className="border p-2">{item.date}</td>
                  <td className="border p-2">{item.calories}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {highestCaloriesDay && (
            <div className="mt-4 text-lg font-semibold">
              Day with Highest Calories: {highestCaloriesDay.day} ({highestCaloriesDay.calories} calories)
            </div>
          )}

          <div className="mt-8">
            <canvas ref={chartRef}></canvas>
          </div>
        </>
      )}

      {!loading && reportData.length === 0 && <p className="text-gray-600 mt-4">No records found for the selected dates.</p>}
    </div>
  );
};

export default CalorieReport;
