import React, { useState } from 'react';
import Button from "../components/button";
import SidebarAdmin from "../components/sidebarAdmin"; // Sidebar component
import Header from "../components/headerAdmin"; 
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminMealReports = () => {
    const [lowStockMeals, setLowStockMeals] = useState([]);
    const [fastMovingMeals, setFastMovingMeals] = useState([]);
    const [slowMovingMeals, setSlowMovingMeals] = useState([]);
    const [showLowStock, setShowLowStock] = useState(false);
    const [showFastSlow, setShowFastSlow] = useState(false);

    const fetchLowStockMeals = async () => {
        try {
            const response = await axios.get('/api/mealReports/low-stock');
            setLowStockMeals(response.data);
            setShowLowStock(true);
        } catch (error) {
            console.error('Error fetching low stock meals:', error);
        }
    };

    const fetchMovingMeals = async () => {
        try {
            const response = await axios.get('/api/mealReports/moving-meals');
            setFastMovingMeals(response.data.fastMovingMeals);
            setSlowMovingMeals(response.data.slowMovingMeals);
            setShowFastSlow(true);
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

    const handleDownloadFastSlowMovingReport = async () => {
        try {
            const res = await fetch('/api/mealReports/moving-meals-pdf', { method: 'GET' });
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'moving-meals-report.pdf';
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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin /> {/* Sidebar */}

            <div className="flex flex-col flex-1">
                <Header /> {/* Header added here */}

                <div className="p-8 flex-1">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Meal Reports
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Low Stock Report */}
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Low Stock Report</h2>
                            <div className="flex gap-4 mb-6">
                                <Button onClick={fetchLowStockMeals} className="bg-green-700 hover:bg-green-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">View Report</Button>
                                <Button onClick={handleDownloadLowStockReport} className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">Download PDF</Button>
                            </div>

                            {showLowStock && (
                                <>
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
                                                {lowStockMeals.map(meal => (
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
                                    {lowStockMeals.length > 0 && (
                                        <div className="mt-6" style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={lowStockMeals}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="meal_name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="meal_stock" fill="#8884d8" name="Meal Stock" />
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
                            <div className="flex gap-4 mb-6">
                                <Button onClick={fetchMovingMeals} className="bg-green-700 hover:bg-green-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">View Report</Button>
                                <Button onClick={handleDownloadFastSlowMovingReport} className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-5 py-2 rounded-full shadow-sm transition">Download PDF</Button>
                            </div>

                            {showFastSlow && (
                                <>
                                    <div className="overflow-x-auto transition-all duration-300">
                                        <table className="min-w-full text-sm text-gray-700 border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="px-6 py-3 text-left">Meal ID</th>
                                                    <th className="px-6 py-3 text-left">Meal Name</th>
                                                    <th className="px-6 py-3 text-left">Total Sold</th>
                                                    <th className="px-6 py-3 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...fastMovingMeals, ...slowMovingMeals].map(meal => (
                                                    <tr key={meal.meal_id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 border-t">{meal.meal_id}</td>
                                                        <td className="px-6 py-3 border-t">{meal.meal_name}</td>
                                                        <td className="px-6 py-3 border-t">{meal.total_sold}</td>
                                                        <td className="px-6 py-3 border-t">
                                                            {meal.total_sold > 10 ? (
                                                                <span className="text-green-600 font-semibold">Fast-Moving</span>
                                                            ) : (
                                                                <span className="text-red-500 font-semibold">Slow-Moving</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Chart for Fast/Slow Moving */}
                                    {combinedMovingMeals().length > 0 && (
                                        <div className="mt-6" style={{ width: '100%', height: 350 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={combinedMovingMeals()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="meal_name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="fast" fill="#4CAF50" name="Fast-Moving Meals" />
                                                    <Bar dataKey="slow" fill="#F44336" name="Slow-Moving Meals" />
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
