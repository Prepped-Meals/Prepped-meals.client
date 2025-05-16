import React, { useState } from 'react';
import Button from "../components/button";
import SidebarAdmin from "../components/sidebarAdmin";
import Header from "../components/headerAdmin";
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminMealReports = () => {
    const [lowStockMeals, setLowStockMeals] = useState([]);
    const [fastMovingMeals, setFastMovingMeals] = useState([]);
    const [slowMovingMeals, setSlowMovingMeals] = useState([]);
    const [showLowStock, setShowLowStock] = useState(false);
    const [showFastSlow, setShowFastSlow] = useState(false);
    const [lowStockLastUpdated, setLowStockLastUpdated] = useState(null);
    const [movingMealsLastUpdated, setMovingMealsLastUpdated] = useState(null);

    // NEW: Date range state for fast/slow moving meals filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // NEW: Stock filter mode state ('low' or 'lowest')
    const [stockFilterMode, setStockFilterMode] = useState('low');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const fetchLowStockMeals = async () => {
        try {
            const response = await axios.get('/api/mealReports/low-stock');
            setLowStockMeals(response.data);
            setShowLowStock(true);
            setLowStockLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching low stock meals:', error);
        }
    };

    // UPDATED: Use startDate and endDate to fetch filtered moving meals
    const fetchMovingMeals = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        try {
            const response = await axios.get(`/api/mealReports/moving-meals-by-date?startDate=${startDate}&endDate=${endDate}`);
            setFastMovingMeals(response.data.fastMovingMeals);
            setSlowMovingMeals(response.data.slowMovingMeals);
            setShowFastSlow(true);
            setMovingMealsLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching moving meals:', error);
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
        } catch (error) {
            console.error('Error downloading low stock report PDF:', error);
        }
    };

    // UPDATED: Use startDate and endDate to download filtered fast/slow moving meals report PDF
    const handleDownloadFastSlowMovingReport = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        try {
            const res = await fetch(`/api/mealReports/moving-meals-pdf?startDate=${startDate}&endDate=${endDate}`);
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `moving-meals-report-${startDate}-to-${endDate}.pdf`;
            link.click();
        } catch (error) {
            console.error('Error downloading fast/slow moving report PDF:', error);
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

    // New handlers with validation for today and no equal start/end dates
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;

        if (newStartDate > today) {
            alert('Start date cannot be after today.');
            return;
        }

        if (endDate && (newStartDate >= endDate)) {
            alert('Start date must be before end date.');
            return;
        }

        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;

        if (newEndDate > today) {
            alert('End date cannot be after today.');
            return;
        }

        if (startDate && (newEndDate <= startDate)) {
            alert('End date must be after start date.');
            return;
        }

        setEndDate(newEndDate);
    };

    // Filter low stock meals according to selected filter mode
    const filteredLowStockMeals = lowStockMeals.filter(meal => {
        if (stockFilterMode === 'lowest') return meal.meal_stock < 4;
        return true; // 'low' mode shows all low stock meals (assuming <10 on backend)
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

                    {/* Changed container here to stack reports vertically */}
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
                                    {/* Dropdown for filtering mode */}
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

                                    {/* Chart for Low Stock */}
                                    {filteredLowStockMeals.length > 0 && (
                                        <div className="mt-6" style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={filteredLowStockMeals}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="meal_name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar
                                                        dataKey="meal_stock"
                                                        name="Meal Stock"
                                                        isAnimationActive={false}
                                                        shape={({ x, y, width, height, payload }) => {
                                                            const isLowStock = payload.meal_stock < 4;
                                                            return (
                                                                <g>
                                                                    <rect
                                                                        x={x}
                                                                        y={y}
                                                                        width={width}
                                                                        height={height}
                                                                        fill={isLowStock ? '#f87171' : '#8884d8'}
                                                                    />
                                                                    {isLowStock && (
                                                                        <text
                                                                            x={x + width / 2}
                                                                            y={y - 10}
                                                                            textAnchor="middle"
                                                                            fill="#e11d48"
                                                                            fontSize={12}
                                                                            fontWeight="bold"
                                                                        >
                                                                            Low Stock
                                                                        </text>
                                                                    )}
                                                                </g>
                                                            );
                                                        }}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Fast/Slow Moving Report */}
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Fast/Slow Moving Report</h2>

                            {/* NEW: Date range inputs */}
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

                                    {/* Chart for Fast/Slow Moving Meals */}
                                    {fastMovingMeals.length + slowMovingMeals.length > 0 && (
                                        <div className="mt-6" style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={combinedMovingMeals()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="meal_name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="fast" name="Fast Moving" fill="#60a5fa" />
                                                    <Bar dataKey="slow" name="Slow Moving" fill="#f87171" />
                                                </BarChart>
                                            </ResponsiveContainer>
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
