'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateReportSchedule, ReportSchedule } from '@/services/reportScheduleService';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AddReportSchedulePage() {
  const router = useRouter();
  const createMutation = useCreateReportSchedule();
  
  const [formData, setFormData] = useState<Partial<ReportSchedule>>({
    name: '',
    type: 'WEEKLY',
    reportType: 'DASHBOARD',
    recipients: [],
    schedule: {
      frequency: 'WEEKLY',
      dayOfWeek: 1,
      time: '09:00',
    },
    format: 'PDF',
    isActive: true,
  });
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.recipients || formData.recipients.length === 0) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      await createMutation.mutateAsync(formData as any);
      toast.success('Rapor zamanlaması başarıyla oluşturuldu');
      router.push('/admin/report-schedules');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Rapor zamanlaması oluşturulurken bir hata oluştu');
    }
  };

  const handleAddRecipient = () => {
    if (recipientEmail && !formData.recipients?.includes(recipientEmail)) {
      setFormData({
        ...formData,
        recipients: [...(formData.recipients || []), recipientEmail],
      });
      setRecipientEmail('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients?.filter(r => r !== email) || [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/report-schedules" className="inline-flex items-center text-[#0066CC] dark:text-primary-light hover:underline mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Rapor Zamanlama
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Rapor Zamanlaması</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zamanlama Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
            placeholder="Örn: Haftalık Dashboard Raporu"
            required
          />
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rapor Tipi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.reportType}
            onChange={(e) => setFormData({ ...formData, reportType: e.target.value as ReportSchedule['reportType'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="DASHBOARD">Dashboard Özeti</option>
            <option value="EQUIPMENT">Ekipman Raporu</option>
            <option value="PROJECTS">Proje Raporu</option>
            <option value="TASKS">Görev Raporu</option>
            <option value="MAINTENANCE">Bakım Raporu</option>
            <option value="ALL">Tüm Raporlar</option>
          </select>
        </div>

        {/* Schedule Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zamanlama Tipi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => {
              const type = e.target.value as 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
              setFormData({
                ...formData,
                type,
                schedule: {
                  ...formData.schedule!,
                  frequency: type,
                },
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="WEEKLY">Haftalık</option>
            <option value="MONTHLY">Aylık</option>
            <option value="CUSTOM">Özel (Cron Expression)</option>
          </select>
        </div>

        {/* Schedule Details */}
        {formData.type === 'WEEKLY' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Haftanın Günü <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.schedule?.dayOfWeek || 1}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, dayOfWeek: parseInt(e.target.value) },
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="0">Pazar</option>
                <option value="1">Pazartesi</option>
                <option value="2">Salı</option>
                <option value="3">Çarşamba</option>
                <option value="4">Perşembe</option>
                <option value="5">Cuma</option>
                <option value="6">Cumartesi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saat <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.schedule?.time || '09:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, time: e.target.value },
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
        )}

        {formData.type === 'MONTHLY' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ayın Günü <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.schedule?.dayOfMonth || 1}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, dayOfMonth: parseInt(e.target.value) },
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saat <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.schedule?.time || '09:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, time: e.target.value },
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
        )}

        {formData.type === 'CUSTOM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cron Expression <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.schedule?.cronExpression || ''}
              onChange={(e) => setFormData({
                ...formData,
                schedule: { ...formData.schedule!, cronExpression: e.target.value },
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
              placeholder="0 9 * * 1 (Her Pazartesi 09:00)"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cron expression formatı: dakika saat gün ay haftanın-günü
            </p>
          </div>
        )}

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alıcılar (Email) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRecipient();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
              placeholder="email@example.com"
            />
            <button
              type="button"
              onClick={handleAddRecipient}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
            >
              Ekle
            </button>
          </div>
          {formData.recipients && formData.recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value as ReportSchedule['format'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="PDF">PDF</option>
            <option value="EXCEL">Excel</option>
            <option value="CSV">CSV</option>
          </select>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-[#0066CC] focus:ring-[#0066CC] border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Aktif (Zamanlama hemen başlasın)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/admin/report-schedules">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {createMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Oluşturuluyor...
              </>
            ) : (
              'Oluştur'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

