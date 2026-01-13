'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Widget } from '@/services/widgetService';

interface LineChartWidgetProps {
  widget: Widget;
  dashboardStats?: any;
  chartData?: any;
  isEditable?: boolean;
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ widget, chartData, isEditable = false }) => {
  const getChartData = () => {
    const chartType = widget.settings?.chartType;
    
    if (chartType === 'task_completion') {
      // taskCompletion veya taskCompletionTrend formatını destekle
      const completionData = chartData?.taskCompletion || chartData?.taskCompletionTrend || [];
      
      if (completionData.length > 0) {
        return completionData.map((item: any) => ({
          name: item.date || item.month || item.name || '',
          'Tamamlanan': item.completed || item.value || 0,
          'Toplam': item.total || item.completed || 0, // Eğer total yoksa completed kullan
        }));
      }
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Tamamlanan" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="Toplam" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Veri yükleniyor...
        </div>
      )}
    </div>
  );
};

export default LineChartWidget;

