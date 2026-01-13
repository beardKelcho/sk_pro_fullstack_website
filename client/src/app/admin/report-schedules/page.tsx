'use client';

import React, { useState } from 'react';
import { useReportSchedules, useDeleteReportSchedule, ReportSchedule } from '@/services/reportScheduleService';
import { toast } from 'react-toastify';
import Link from 'next/link';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Henüz gönderilmedi';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getReportTypeLabel = (type: ReportSchedule['reportType']) => {
  const labels: Record<ReportSchedule['reportType'], string> = {
    DASHBOARD: 'Dashboard Özeti',
    EQUIPMENT: 'Ekipman Raporu',
    PROJECTS: 'Proje Raporu',
    TASKS: 'Görev Raporu',
    MAINTENANCE: 'Bakım Raporu',
    ALL: 'Tüm Raporlar',
  };
  return labels[type] || type;
};

const getFrequencyLabel = (schedule: ReportSchedule['schedule']) => {
  if (schedule.frequency === 'WEEKLY') {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return `Haftalık - ${days[schedule.dayOfWeek || 0]} ${schedule.time || ''}`;
  } else if (schedule.frequency === 'MONTHLY') {
    return `Aylık - ${schedule.dayOfMonth || 1}. gün ${schedule.time || ''}`;
  } else {
    return `Özel - ${schedule.cronExpression || 'Cron expression'}`;
  }
};

const getFormatLabel = (format: ReportSchedule['format']) => {
  const labels: Record<ReportSchedule['format'], string> = {
    PDF: 'PDF',
    EXCEL: 'Excel',
    CSV: 'CSV',
  };
  return labels[format] || format;
};

export default function ReportSchedulesPage() {
  const { data, isLoading, error, refetch } = useReportSchedules();
  const deleteMutation = useDeleteReportSchedule();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const schedules = data?.schedules || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Bu rapor zamanlamasını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
      toast.success('Rapor zamanlaması başarıyla silindi');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Rapor zamanlaması silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Rapor zamanlamaları yüklenirken bir hata oluştu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapor Zamanlama</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Otomatik rapor gönderimlerini yönetin
          </p>
        </div>
        <Link href="/admin/report-schedules/add">
          <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Zamanlama Ekle
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Zamanlama</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{schedules.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Zamanlama</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {schedules.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pasif Zamanlama</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
            {schedules.filter(s => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zamanlamalar</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {schedules.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Henüz rapor zamanlaması bulunmuyor</p>
              <Link href="/admin/report-schedules/add">
                <button className="mt-4 px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors">
                  İlk Zamanlamayı Oluştur
                </button>
              </Link>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {schedule.name}
                      </h3>
                      {schedule.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Pasif
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Rapor Tipi: {getReportTypeLabel(schedule.reportType)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Zamanlama: {getFrequencyLabel(schedule.schedule)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Format: {getFormatLabel(schedule.format)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Alıcılar: {schedule.recipients.join(', ')}</span>
                      </div>
                      {schedule.lastSent && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Son Gönderim: {formatDate(schedule.lastSent)}</span>
                        </div>
                      )}
                      {schedule.nextRun && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Sonraki Gönderim: {formatDate(schedule.nextRun)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <Link href={`/admin/report-schedules/edit/${schedule._id}`}>
                      <button className="px-3 py-1.5 text-sm text-[#0066CC] hover:text-[#0055AA] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Düzenle
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      disabled={deletingId === schedule._id}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {deletingId === schedule._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                          Siliniyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Sil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

