'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartData } from '@/services/dashboardService';

interface DashboardChartsProps {
  charts: ChartData;
}

const COLORS = {
  equipment: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  projects: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
  tasks: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
};

const statusLabels: { [key: string]: string } = {
  'AVAILABLE': 'Müsait',
  'IN_USE': 'Kullanımda',
  'MAINTENANCE': 'Bakımda',
  'DAMAGED': 'Arızalı',
  'PLANNING': 'Onay Bekleyen', // legacy
  'PENDING_APPROVAL': 'Onay Bekleyen',
  'APPROVED': 'Onaylanan',
  'ACTIVE': 'Aktif',
  'ON_HOLD': 'Ertelendi',
  'COMPLETED': 'Tamamlandı',
  'CANCELLED': 'İptal Edildi',
  'TODO': 'Yapılacak',
  'IN_PROGRESS': 'Devam Ediyor',
};

export default function DashboardCharts({ charts }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Ekipman Durum Dağılımı - Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Ekipman Durum Dağılımı
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={charts.equipmentStatus.map(item => ({
                ...item,
                name: statusLabels[item.name] || item.name
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {charts.equipmentStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.equipment[index % COLORS.equipment.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Proje Durum Dağılımı - Donut Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Proje Durum Dağılımı
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={charts.projectStatus.map(item => ({
                ...item,
                name: statusLabels[item.name] || item.name
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {charts.projectStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.projects[index % COLORS.projects.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Aylık Aktivite - Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Aylık Aktivite (Son 30 Gün)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={charts.activityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="projects" fill="#3B82F6" name="Projeler" />
            <Bar dataKey="tasks" fill="#10B981" name="Görevler" />
            <Bar dataKey="equipment" fill="#F59E0B" name="Ekipman" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Görev Tamamlanma Trendi - Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Görev Tamamlanma Trendi (Son 30 Gün)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={charts.taskCompletionTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Tamamlanan Görevler"
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ekipman Kullanım Oranları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Ekipman Kullanım Oranları
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {charts.equipmentUsage.available}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Müsait</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {charts.equipmentUsage.inUse}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kullanımda</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {charts.equipmentUsage.maintenance}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bakımda</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {charts.equipmentUsage.damaged}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Arızalı</p>
          </div>
        </div>
      </div>
    </div>
  );
}

