'use client';

import React, { useMemo, useState } from 'react';
import {
  Webhook,
  WebhookEventType,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhookDeliveries,
  useWebhooks,
} from '@/services/webhookService';
import { toast } from 'react-toastify';

const ALL_EVENTS: Array<{ key: WebhookEventType; label: string }> = [
  { key: 'PROJECT_STATUS_CHANGED', label: 'Proje Durumu Değişti' },
  { key: 'TASK_ASSIGNED', label: 'Görev Atandı' },
  { key: 'TASK_UPDATED', label: 'Görev Güncellendi' },
];

const emptyForm = {
  name: '',
  url: '',
  enabled: true,
  events: [] as WebhookEventType[],
  maxAttempts: 10,
  timeoutMs: 10000,
  secret: '',
};

export default function WebhooksPage() {
  const { data: webhooks, isLoading, error } = useWebhooks();
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();

  const [editing, setEditing] = useState<Webhook | null>(null);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const deliveriesQuery = useWebhookDeliveries(selectedWebhookId, { limit: 50 });

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || testMutation.isPending;

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 1 && form.url.trim().length > 8 && form.events.length > 0;
  }, [form]);

  const handleStartCreate = () => {
    setEditing(null);
    setSelectedWebhookId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (wh: Webhook) => {
    setEditing(wh);
    setForm({
      name: wh.name,
      url: wh.url,
      enabled: wh.enabled,
      events: wh.events || [],
      maxAttempts: wh.maxAttempts || 10,
      timeoutMs: wh.timeoutMs || 10000,
      secret: wh.secret || '',
    });
  };

  const handleToggleEvent = (ev: WebhookEventType) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(ev) ? prev.events.filter((e) => e !== ev) : [...prev.events, ev],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Ad, URL ve en az 1 event seçimi zorunlu');
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing._id,
          data: {
            name: form.name.trim(),
            url: form.url.trim(),
            enabled: form.enabled,
            events: form.events,
            maxAttempts: Number(form.maxAttempts) || 10,
            timeoutMs: Number(form.timeoutMs) || 10000,
            secret: form.secret?.trim() || undefined,
          },
        });
        toast.success('Webhook güncellendi');
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          url: form.url.trim(),
          enabled: form.enabled,
          events: form.events,
          maxAttempts: Number(form.maxAttempts) || 10,
          timeoutMs: Number(form.timeoutMs) || 10000,
          // boşsa backend otomatik üretiyor
          ...(form.secret?.trim() ? { secret: form.secret.trim() } : {}),
        });
        toast.success('Webhook oluşturuldu');
      }
      handleStartCreate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Webhook silinsin mi?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Webhook silindi');
      if (editing?._id === id) handleStartCreate();
      if (selectedWebhookId === id) setSelectedWebhookId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Webhook silinemedi');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await testMutation.mutateAsync(id);
      toast.success(`Test OK (HTTP ${res?.status ?? '?'})`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Test başarısız');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhook Yönetimi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Dış sistemlere event bazlı bildirim gönderimi (retry + imzalı payload).
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
          disabled={isBusy}
        >
          Yeni Webhook
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editing ? 'Webhook Düzenle' : 'Webhook Oluştur'}
          </h2>
          {editing && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{editing._id}</code>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              placeholder="Örn: Zapier - Proje Eventleri"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              placeholder="https://example.com/webhook"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Aktif
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Max Attempt</label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.maxAttempts}
              onChange={(e) => setForm((p) => ({ ...p, maxAttempts: Number(e.target.value) }))}
              className="w-24 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Timeout (ms)</label>
            <input
              type="number"
              min={1000}
              max={60000}
              value={form.timeoutMs}
              onChange={(e) => setForm((p) => ({ ...p, timeoutMs: Number(e.target.value) }))}
              className="w-32 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event’ler</label>
          <div className="flex flex-wrap gap-2">
            {ALL_EVENTS.map((ev) => (
              <button
                key={ev.key}
                type="button"
                onClick={() => handleToggleEvent(ev.key)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  form.events.includes(ev.key)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {ev.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret (opsiyonel)</label>
          <input
            value={form.secret}
            onChange={(e) => setForm((p) => ({ ...p, secret: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
            placeholder="Boş bırakılırsa backend otomatik üretir"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            İmza header’ı: <code>X-SKPRO-Signature</code> (HMAC sha256).
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          {editing && (
            <button
              type="button"
              onClick={() => handleTest(editing._id)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              disabled={isBusy}
            >
              Test Gönder
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
            disabled={!canSubmit || isBusy}
          >
            {editing ? 'Kaydet' : 'Oluştur'}
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook’lar</h2>
          {isLoading && <span className="text-sm text-gray-500">Yükleniyor…</span>}
        </div>

        {error ? (
          <div className="p-5 text-sm text-red-600">Webhook listesi alınamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Ad</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">URL</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Event</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Durum</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600 dark:text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(webhooks || []).map((wh) => (
                  <tr key={wh._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{wh.name}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      <code className="text-xs break-all">{wh.url}</code>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((e) => (
                          <span key={e} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          wh.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {wh.enabled ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedWebhookId(selectedWebhookId === wh._id ? null : wh._id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Loglar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTest(wh._id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                          disabled={isBusy}
                        >
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(wh)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          disabled={isBusy}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(wh._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          disabled={isBusy}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(webhooks || []).length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                      Henüz webhook yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deliveries */}
      {selectedWebhookId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Logları</h3>
            <button
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => deliveriesQuery.refetch()}
            >
              Yenile
            </button>
          </div>

          {deliveriesQuery.isLoading ? (
            <p className="text-sm text-gray-500">Yükleniyor…</p>
          ) : (
            <div className="space-y-2">
              {(deliveriesQuery.data || []).map((d) => (
                <div key={d._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        {d.event}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          d.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : d.status === 'FAILED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        }`}
                      >
                        {d.status}
                      </span>
                      <span className="text-xs text-gray-500">attempt: {d.attempts}</span>
                      {d.lastStatusCode !== undefined && <span className="text-xs text-gray-500">HTTP: {d.lastStatusCode}</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(d.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                  {d.lastError && (
                    <p className="text-xs text-red-600 dark:text-red-300 mt-2 break-words">
                      {d.lastError}
                    </p>
                  )}
                </div>
              ))}
              {(deliveriesQuery.data || []).length === 0 && (
                <p className="text-sm text-gray-500">Kayıt yok.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

