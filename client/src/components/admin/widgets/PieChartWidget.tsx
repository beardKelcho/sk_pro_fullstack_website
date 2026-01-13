'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Widget } from '@/services/widgetService';

interface PieChartWidgetProps {
  widget: Widget;
  dashboardStats?: any;
  chartData?: any;
  isEditable?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const PieChartWidget: React.FC<PieChartWidgetProps> = ({ widget, chartData, isEditable = false }) => {
  const getChartData = () => {
    const chartType = widget.settings?.chartType;
    
    if (chartType === 'equipment_status' && chartData?.equipmentStatus) {
      return chartData.equipmentStatus.map((item: any) => ({
        name: item.name === 'AVAILABLE' ? 'Müsait' :
              item.name === 'IN_USE' ? 'Kullanımda' :
              item.name === 'MAINTENANCE' ? 'Bakımda' :
              item.name === 'DAMAGED' ? 'Arızalı' : item.name,
        value: item.value || item.count || 0,
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Veri yükleniyor...
        </div>
      )}
    </div>
  );
};

export default PieChartWidget;

