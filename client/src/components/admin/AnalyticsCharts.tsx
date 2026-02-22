'use client';

import React from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
} from 'recharts';

const COLORS = ['#0066CC', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4dabf7'];

interface AnalyticsChartsProps {
    projectStatusData: any[];
    taskStatusData: any[];
    taskPriorityData: any[];
    projectTrend: any[];
    completedTrend: any[];
    forecast: any[];
    data: any;
}

export default function AnalyticsCharts({
    projectStatusData,
    taskStatusData,
    taskPriorityData,
    projectTrend,
    completedTrend,
    forecast,
    data
}: AnalyticsChartsProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Projeler • Durum Dağılımı</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={projectStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                                    {projectStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Ortalama proje süresi: {data.projects.avgDurationDays.toFixed(1)} gün
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Projeler • Aylık Trend</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={projectTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#0066CC" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Görevler • Tamamlanma Trend (Günlük)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={completedTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" hide />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tahmin (7 gün)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecast}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" hide />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="expected" fill="#FFBB28" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Basit tahmin: son 14 gün ortalaması.</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Görevler • Durum</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={taskStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                                    {taskStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Görevler • Öncelik</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskPriorityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0066CC" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
