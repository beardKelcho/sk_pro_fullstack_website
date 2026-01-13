'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Widget } from '@/services/widgetService';

interface BarChartWidgetProps {
  widget: Widget;
  dashboardStats?: any;
  chartData?: any;
  isEditable?: boolean;
}

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ widget, chartData, isEditable = false }) => {
  const getChartData = () => {
    const chartType = widget.settings?.chartType;
    
    if (chartType === 'monthly_activity' && chartData?.monthlyActivity) {
      return chartData.monthlyActivity.map((item: any) => ({
        name: item.date || item.month || item.name,
        'Aktiviteler': item.count || item.value || 0,
      }));
    }

    // activityData formatını da destekle
    if (chartType === 'monthly_activity' && chartData?.activityData) {
      return chartData.activityData.map((item: any) => ({
        name: item.date || item.month || item.name,
        'Aktiviteler': (item.projects || 0) + (item.tasks || 0) + (item.equipment || 0),
      }));
    }

    return [];
  };

  const data = getChartData();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full ${
      isEditable 
        ? 'widget-drag-handle cursor-move border-2 border-blue-400 border-dashed relative' 
        : 'cursor-default'
    } ${isEditable ? 'hover:border-blue-500' : ''}`}>
      {isEditable && (
        <div className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded z-10">
          Düzenle
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{widget.title}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Aktiviteler" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Veri yükleniyor...
        </div>
      )}
    </div>
  );
};

export default BarChartWidget;

