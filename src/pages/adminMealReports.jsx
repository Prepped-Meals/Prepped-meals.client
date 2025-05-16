import React, { useState } from 'react';
import Button from "../components/button";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const AdminMealReports = () => {
    const [lowStockMeals, setLowStockMeals] = useState([]);
    const [fastMovingMeals, setFastMovingMeals] = useState([]);
    const [slowMovingMeals, setSlowMovingMeals] = useState([]);
    const [showLowStock, setShowLowStock] = useState(false);
    const [showFastSlow, setShowFastSlow] = useState(false);
    const [lowStockLastUpdated, setLowStockLastUpdated] = useState(null);
    const [movingMealsLastUpdated, setMovingMealsLastUpdated] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stockFilterMode, setStockFilterMode] = useState('low');
    const [error, setError] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const fetchLowStockMeals = async () => {
        try {
            const response = await axios.get('/api/mealReports/low-stock');
            setLowStockMeals(response.data);
            setShowLowStock(true);
            setLowStockLastUpdated(new Date());
            setError(null);
        } catch (error) {
            console.error('Error fetching low stock meals:', error);
            setError("Failed to fetch low stock meals. Please try again.");
        }
    };

    const fetchMovingMeals = async () => {
        setError(null);
        
        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (startDate > today) {
            setError("Start date cannot be after today.");
            return;
        }

        if (endDate > today) {
            setError("End date cannot be after today.");
            return;
        }

        if (startDate >= endDate) {
            setError("Start date must be before end date.");
            return;
        }

        try {
            const response = await axios.get(`/api/mealReports/moving-meals-by-date?startDate=${startDate}&endDate=${endDate}`);
            setFastMovingMeals(response.data.fastMovingMeals);
            setSlowMovingMeals(response.data.slowMovingMeals);
            setShowFastSlow(true);
            setMovingMealsLastUpdated(new Date());
            setError(null);
        } catch (error) {
            console.error('Error fetching moving meals:', error);
            setError("Failed to fetch moving meals report. Please try again.");
        }
    };

    const handleDownloadLowStockReport = async () => {
        try {
            const res = await fetch('/api/mealReports/low-stock-pdf', { method: 'GET' });
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'low-stock-report.pdf';
            link.click();
            setError(null);
        } catch (error) {
            console.error('Error downloading low stock report PDF:', error);
            setError("Failed to download low stock report. Please try again.");
        }
    };

    const handleDownloadFastSlowMovingReport = async () => {
        setError(null);
        
        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (startDate > today) {
            setError("Start date cannot be after today.");
            return;
        }

        if (endDate > today) {
            setError("End date cannot be after today.");
            return;
        }

        if (startDate >= endDate) {
            setError("Start date must be before end date.");
            return;
        }

        try {
            const res = await fetch(`/api/mealReports/moving-meals-pdf?startDate=${startDate}&endDate=${endDate}`);
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `moving-meals-report-${startDate}-to-${endDate}.pdf`;
            link.click();
            setError(null);
        } catch (error) {
            console.error('Error downloading fast/slow moving report PDF:', error);
            setError("Failed to download moving meals report. Please try again.");
        }
    };

    const combinedMovingMeals = () => {
        const mealsMap = {};

        fastMovingMeals.forEach(meal => {
            mealsMap[meal.meal_name] = { meal_name: meal.meal_name, fast: meal.total_sold, slow: 0 };
        });

        slowMovingMeals.forEach(meal => {
            if (mealsMap[meal.meal_name]) {
                mealsMap[meal.meal_name].slow = meal.total_sold;
            } else {
                mealsMap[meal.meal_name] = { meal_name: meal.meal_name, fast: 0, slow: meal.total_sold };
            }
        });

        return Object.values(mealsMap);
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
    };

    const filteredLowStockMeals = lowStockMeals.filter(meal => {
        if (stockFilterMode === 'lowest') return meal.meal_stock < 4;
        return true;
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin />

            <div className="flex flex-col flex-1">
                <Header />

                <div className="p-8 flex-1">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Meal Reports
                    </h1>

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

                    <div className="flex flex-col gap-8">
                        {/* Low Stock Report */}
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Low Stock Report</h2>
                            <div className="flex gap-4 mb-2">
                                <Button onClick={fetchLowStockMeals} className="bg-green-700 hover:bg-green-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">View Report</Button>
                                <Button onClick={handleDownloadLowStockReport} className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">Download PDF</Button>
                            </div>

                            {lowStockLastUpdated && (
                                <p className="text-sm text-gray-500 mb-4">
                                    Last updated: {lowStockLastUpdated.toLocaleString()}
                                </p>
                            )}

                            {showLowStock && (
                                <>
                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="text-gray-700 font-medium">Filter:</label>
                                        <select
                                            value={stockFilterMode}
                                            onChange={(e) => setStockFilterMode(e.target.value)}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="low">Low Stock (&lt; 10)</option>
                                            <option value="lowest">Lowest Stock (&lt; 4)</option>
                                        </select>
                                    </div>

                                    <div className="overflow-x-auto transition-all duration-300">
                                        <table className="min-w-full text-sm text-gray-700 border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="px-6 py-3 text-left">Meal ID</th>
                                                    <th className="px-6 py-3 text-left">Meal Name</th>
                                                    <th className="px-6 py-3 text-left">Meal Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLowStockMeals.map(meal => (
                                                    <tr key={meal.meal_id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 border-t">{meal.meal_id}</td>
                                                        <td className="px-6 py-3 border-t">{meal.meal_name}</td>
                                                        <td className="px-6 py-3 border-t">{meal.meal_stock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredLowStockMeals.length > 0 && (
                                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-700 mb-4">Stock Levels</h3>
                                            <div className="mb-4 flex items-center gap-4">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-purple-600 mr-2"></div>
                                                    <span className="text-sm">Low Stock (4-9)</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-red-500 mr-2"></div>
                                                    <span className="text-sm">Critical Stock (&lt;4)</span>
                                                </div>
                                            </div>
                                            <div style={{ width: '100%', height: 400 }}>
                                                <ResponsiveContainer>
                                                    <BarChart
                                                        data={filteredLowStockMeals}
                                                        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                                                        layout="vertical"
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis type="number" />
                                                        <YAxis
                                                            dataKey="meal_name"
                                                            type="category"
                                                            width={150}
                                                            tick={{ fontSize: 12 }}
                                                            interval={0}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="meal_stock"
                                                            name="Stock Level"
                                                            radius={[0, 4, 4, 0]}
                                                        >
                                                            {filteredLowStockMeals.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={entry.meal_stock < 4 ? '#ef4444' : '#9333ea'}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Fast/Slow Moving Report */}
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Fast/Slow Moving Report</h2>

                            <div className="flex gap-4 mb-4 items-center">
                                <label className="text-gray-700 font-medium">Start Date:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={endDate || today}
                                    className="border rounded px-2 py-1"
                                />
                                <label className="text-gray-700 font-medium">End Date:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate}
                                    max={today}
                                    className="border rounded px-2 py-1"
                                />
                                <Button onClick={fetchMovingMeals} className="bg-green-700 hover:bg-green-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">View Report</Button>
                                <Button onClick={handleDownloadFastSlowMovingReport} className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">Download PDF</Button>
                            </div>

                            {movingMealsLastUpdated && (
                                <p className="text-sm text-gray-500 mb-4">
                                    Last updated: {movingMealsLastUpdated.toLocaleString()}
                                </p>
                            )}

                            {showFastSlow && (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-gray-700 border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="px-6 py-3 text-left">Meal Name</th>
                                                    <th className="px-6 py-3 text-left">Fast Moving (Total Sold)</th>
                                                    <th className="px-6 py-3 text-left">Slow Moving (Total Sold)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {combinedMovingMeals().map(meal => (
                                                    <tr key={meal.meal_name} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 border-t">{meal.meal_name}</td>
                                                        <td className="px-6 py-3 border-t">{meal.fast}</td>
                                                        <td className="px-6 py-3 border-t">{meal.slow}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {fastMovingMeals.length + slowMovingMeals.length > 0 && (
                                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium text-gray-700 mb-4">Sales Performance</h3>
                                            <div style={{ width: '100%', height: 350 }}>
                                                <ResponsiveContainer>
                                                    <BarChart
                                                        data={combinedMovingMeals()}
                                                        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="meal_name"
                                                            tick={{ fontSize: 12 }}
                                                        />
                                                        <YAxis
                                                            label={{
                                                                value: 'Units Sold',
                                                                angle: -90,
                                                                position: 'insideLeft',
                                                                style: { fontSize: 12 }
                                                            }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="fast"
                                                            name="Fast Moving"
                                                            fill="#60a5fa"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                        <Bar
                                                            dataKey="slow"
                                                            name="Slow Moving"
                                                            fill="#f87171"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMealReports;