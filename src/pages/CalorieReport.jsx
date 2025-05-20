import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement);

const CalorieReport = () => {
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeType, setDateRangeType] = useState("custom");
  const [calorieRange, setCalorieRange] = useState("all");
  const [reportData, setReportData] = useState(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
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
    const today = new Date().toISOString().split('T')[0];
    
    if (dateRangeType === 'custom') {
      if (!startDate || !endDate) {
        setError("Please select both dates");
        return false;
      }
      
      if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        setError("Invalid date format");
        return false;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        setError("Start date must be before end date");
        return false;
      }
      
      if (new Date(startDate) > new Date(today) || new Date(endDate) > new Date(today)) {
        setError("Cannot select dates in the future");
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const handleDateRangeChange = (type) => {
    setDateRangeType(type);
    if (type !== 'custom') {
      setStartDate("");
      setEndDate("");
    }
  };

  const generateReport = async () => {
    setError(null);
    if (!validateDates()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/orders/calorie-report/${customerId}`,
        { 
          params: { 
            startDate, 
            endDate, 
            calorieRange,
            dateRangeType: dateRangeType === 'custom' ? undefined : dateRangeType
          },
          withCredentials: true 
        }
      );
      
      // Process the data to filter by calorie range and exclude 0-calorie meals
      const filteredData = processDataForCalorieRange(response.data, calorieRange);
      setReportData(filteredData);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const processDataForCalorieRange = (data, range) => {
    if (!data.detailedMeals) return data;
    
    // First filter out meals with 0 calories regardless of range
    let filteredDetailedMeals = data.detailedMeals.filter(meal => meal.calories > 0);

    if (range !== 'all') {
      let min = 100;
      let max = Infinity;
      
      switch (range) {
        case '100-150':
          min = 100;
          max = 150;
          break;
        case '151-200':
          min = 151;
          max = 200;
          break;
        case '201-300':
          min = 201;
          max = 300;
          break;
        case '301-400':
          min = 301;
          max = 400;
          break;
        case '401':
          min = 401;
          max = Infinity;
          break;
        default:
          break;
      }
      
      // Apply additional calorie range filter
      filteredDetailedMeals = filteredDetailedMeals.filter(meal => 
        meal.calories >= min && meal.calories <= max
      );
    }
    
    // Calculate new daily totals based on filtered meals
    const filteredDailyCalories = {};
    filteredDetailedMeals.forEach(meal => {
      filteredDailyCalories[meal.date] = (filteredDailyCalories[meal.date] || 0) + meal.calories;
    });
    
    // Calculate new average and highest day
    const daysWithData = Object.entries(filteredDailyCalories);
    const totalCalories = daysWithData.reduce((sum, [_, calories]) => sum + calories, 0);
    const averageCalories = daysWithData.length > 0 ? Math.round(totalCalories / daysWithData.length) : 0;
    
    const highestCaloriesDay = daysWithData.reduce(
      (max, [day, calories]) => calories > max.calories ? { day, calories } : max,
      { day: '', calories: 0 }
    );
    
    // Generate new trend data (only include days with calories > 0)
    const trendData = daysWithData
      .filter(([_, calories]) => calories > 0)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, calories]) => ({ date, calories }));
    
    return {
      ...data,
      detailedMeals: filteredDetailedMeals,
      averageCalories,
      highestCaloriesDay,
      trendData,
      filteredDaysCount: daysWithData.length,
      insight: getCalorieInsights(averageCalories)
    };
  };

  const getCalorieInsights = (averageCalories) => {
    if (averageCalories < 1200) return "Your average intake is very low. Consider consulting a nutritionist.";
    if (averageCalories < 1600) return "Your intake suggests a light eating pattern, appropriate for weight loss.";
    if (averageCalories < 2000) return "Moderate intake typical for moderately active individuals.";
    if (averageCalories < 2500) return "Moderately high intake common for active individuals.";
    if (averageCalories < 3000) return "High intake typical for very active individuals or athletes.";
    return "Very high intake. Monitor carefully if intentional for weight gain or intense training.";
  };

  const downloadPDF = async () => {
    setError(null);
    if (!validateDates()) return;
    
    setLoadingPdf(true);
    try {
      const res = await axios.get(
        `/api/orders/downloadPDF/${customerId}`,
        { 
          params: { 
            startDate, 
            endDate, 
            calorieRange,
            dateRangeType: dateRangeType === 'custom' ? undefined : dateRangeType
          },
          withCredentials: true,
          responseType: "blob"
        }
      );
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      
      let filename;
      if (dateRangeType !== 'custom') {
        filename = `Calorie_Report_${dateRangeType}_${calorieRange}.pdf`;
      } else {
        filename = `Calorie_Report_${startDate}_to_${endDate}_${calorieRange}.pdf`;
      }
      
      link.download = filename;
      link.click();
    } catch (err) {
      console.error(err);
      setError("Failed to download PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (!reportData) return;

    // Store current ref values in variables
    const barChartElement = barChartRef.current;
    const lineChartElement = lineChartRef.current;
    const barChart = barChartElement?.chart;
    const lineChart = lineChartElement?.chart;

    if (barChart) barChart.destroy();
    if (lineChart) lineChart.destroy();

    if (reportData.detailedMeals?.length > 0 && barChartElement) {
      const barCtx = barChartElement.getContext("2d");
      if (barCtx) {
        barChartElement.chart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: reportData.detailedMeals.map(m => m.date),
            datasets: [{
              label: "Calories per Meal",
              data: reportData.detailedMeals.map(m => m.calories),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: { 
                display: true, 
                text: `Calories by Meal (${calorieRange === 'all' ? 'All' : calorieRange === '401' ? '>400' : calorieRange} kcal)`
              }
            }
          }
        });
      }
    }

    if (reportData.trendData?.length > 0 && lineChartElement) {
      const lineCtx = lineChartElement.getContext("2d");
      if (lineCtx) {
        lineChartElement.chart = new Chart(lineCtx, {
          type: "line",
          data: {
            labels: reportData.trendData.map(t => t.date),
            datasets: [{
              label: "Daily Calories",
              data: reportData.trendData.map(t => t.calories),
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderWidth: 2,
              tension: 0.1,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: { 
                display: true, 
                text: `Daily Calorie Trend (${calorieRange === 'all' ? 'All' : calorieRange === '401' ? '>400' : calorieRange} kcal)`
              }
            }
          }
        });
      }
    }

    return () => {
      if (barChartElement?.chart) barChartElement.chart.destroy();
      if (lineChartElement?.chart) lineChartElement.chart.destroy();
    };
  }, [reportData, calorieRange]);

  const getInsightClass = (calories) => {
    if (calories < 1600) return "text-blue-600";
    if (calories < 2200) return "text-green-600";
    if (calories < 2800) return "text-yellow-600";
    return "text-red-600";
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-800 p-6 text-white">
          <h1 className="text-3xl font-bold">Calorie Consumption Report</h1>
          <p className="mt-2">Track your calorie intake over time</p>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <select
                  value={dateRangeType}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="custom">Custom Range</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thismonth">This Month</option>
                  <option value="lastmonth">Last Month</option>
                </select>
              </div>

              {dateRangeType === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      max={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      max={today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Calorie Range</label>
                <select
                  value={calorieRange}
                  onChange={(e) => setCalorieRange(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Calories</option>
                  <option value="100-150">100-150 kcal</option>
                  <option value="151-200">151-200 kcal</option>
                  <option value="201-300">201-300 kcal</option>
                  <option value="301-400">301-400 kcal</option>
                  <option value="401">Above 400 kcal</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? "Generating..." : "View Report"}
              </button>
              <button
                onClick={downloadPDF}
                disabled={loadingPdf || !reportData}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {loadingPdf ? "Downloading..." : "Download PDF"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {reportData ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800">Average Daily Calories</h3>
                  <p className={`text-2xl font-bold ${getInsightClass(reportData.averageCalories)}`}>
                    {reportData.averageCalories} kcal
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {reportData.insight}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Based on {reportData.filteredDaysCount} {reportData.filteredDaysCount === 1 ? 'day' : 'days'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Filter: {calorieRange === 'all' ? 'All calories' : `${calorieRange} kcal`}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800">Highest Calorie Day</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    {reportData.highestCaloriesDay.calories} kcal
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    {reportData.highestCaloriesDay.day || 'No data'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Filter: {calorieRange === 'all' ? 'All calories' : `${calorieRange} kcal`}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800">Days Analyzed</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {reportData.filteredDaysCount}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {dateRangeType === 'custom' ? `${startDate} to ${endDate}` : dateRangeType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Filter: {calorieRange === 'all' ? 'All calories' : `${calorieRange} kcal`}
                  </p>
                </div>
              </div>

              {reportData.trendData?.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Daily Calorie Trend</h3>
                  <div className="h-80">
                    <canvas ref={lineChartRef}></canvas>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow text-center py-12">
                  <p>No trend data available for the selected filters</p>
                </div>
              )}

              {reportData.detailedMeals?.length > 0 ? (
                <>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Meal Breakdown</h3>
                    <div className="h-80">
                      <canvas ref={barChartRef}></canvas>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b">
                      <h3 className="font-medium">Meal Details ({calorieRange === 'all' ? 'All calories' : `${calorieRange} kcal`})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calories</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.detailedMeals.map((meal, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {meal.mealName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {meal.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {meal.calories}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow text-center py-12">
                  <p>No meal data available for the selected filters</p>
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium">No report data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a date range and generate a report
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CalorieReport;