'use client';

import React from 'react';
import { Widget } from '@/services/widgetService';
import Link from 'next/link';

interface StatCardWidgetProps {
  widget: Widget;
  dashboardStats?: any;
  chartData?: any;
  isEditable?: boolean;
}

const StatCardWidget: React.FC<StatCardWidgetProps> = ({ widget, dashboardStats, isEditable = false }) => {
  const getStatValue = () => {
    if (!dashboardStats) return 0;

    // dashboardStats.stats yapısını kontrol et
    const stats = dashboardStats.stats || dashboardStats;

    const statType = widget.settings?.statType;
    switch (statType) {
      case 'equipment_total':
        return stats.equipment?.total || 0;
      case 'equipment_available':
        return stats.equipment?.available || 0;
      case 'equipment_inUse':
        return stats.equipment?.inUse || 0;
      case 'projects_total':
        return stats.projects?.total || 0;
      case 'projects_active':
        return stats.projects?.active || 0;
      case 'projects_completed':
        return stats.projects?.completed || 0;
      case 'tasks_total':
        return stats.tasks?.total || 0;
      case 'tasks_open':
        return stats.tasks?.open || 0;
      case 'tasks_completed':
        return stats.tasks?.completed || 0;
      case 'clients_total':
        return stats.clients?.total || 0;
      default:
        return 0;
    }
  };

  const getLink = () => {
    const statType = widget.settings?.statType;
    if (statType?.includes('equipment')) return '/admin/inventory';
    if (statType?.includes('project')) return '/admin/projects';
    if (statType?.includes('task')) return '/admin/tasks';
    if (statType?.includes('client')) return '/admin/clients';
    return undefined;
  };

  const getIcon = () => {
    const statType = widget.settings?.statType;
    if (statType?.includes('equipment')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    }
    if (statType?.includes('project')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    }
    if (statType?.includes('task')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    }
    if (statType?.includes('client')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    return null;
  };

  const link = getLink();
  const content = (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full relative ${isEditable
          ? 'widget-drag-handle cursor-move border-2 border-blue-400 border-dashed'
          : 'cursor-default'
        } ${isEditable ? 'hover:border-blue-500' : ''}`}
    >
      {isEditable && (
        <div className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
          Düzenle
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{widget.title}</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{getStatValue()}</p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {getIcon()}
        </div>
      </div>
      {link && !isEditable && (
        <div className="mt-4">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Detayları görüntüle &rarr;
          </span>
        </div>
      )}
    </div>
  );

  // Edit modu açıkken link'leri devre dışı bırak
  if (link && !isEditable) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
};

export default StatCardWidget;

