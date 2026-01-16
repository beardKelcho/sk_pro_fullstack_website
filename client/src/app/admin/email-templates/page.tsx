'use client';

import React, { useMemo, useState } from 'react';
import {
  EmailTemplate,
  EmailTemplateVariant,
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  useEmailTemplates,
  usePreviewEmailTemplate,
  useUpdateEmailTemplate,
} from '@/services/emailTemplateService';
import { toast } from 'react-toastify';

const emptyVariant: EmailTemplateVariant = {
  name: 'default',
  weight: 100,
  locales: {
    tr: { subject: '', html: '' },
    en: { subject: '', html: '' },
  },
};

const emptyForm = {
  key: '',
  name: '',
  description: '',
  enabled: true,
  variants: [emptyVariant] as EmailTemplateVariant[],
};

const safeJsonParse = (raw: string): Record<string, any> => {
  if (!raw?.trim()) return {};
  const v = JSON.parse(raw);
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  return v as Record<string, any>;
};

export default function EmailTemplatesPage() {
  const { data: templates, isLoading, error } = useEmailTemplates();
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const deleteMutation = useDeleteEmailTemplate();
  const previewMutation = usePreviewEmailTemplate();

  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeLocale, setActiveLocale] = useState<'tr' | 'en'>('tr');

  const [previewDataRaw, setPreviewDataRaw] = useState<string>(
    JSON.stringify(
      {
        userName: 'Ahmet',
        taskTitle: 'LED Wall Kurulum',
        taskDescription: 'Sahne kurulumu ve test',
        dueDateLineHtml: '<p><strong>Son Tarih:</strong> 16.01.2026</p>',
        changesRowsHtml:
          '<tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Durum:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;"><span style="color:#d32f2f;">Açık</span> → <span style="color:#28a745;">Tamamlandı</span></td></tr>',
        clientName: 'Acme',
        projectName: 'Festival 2026',
        startDate: '16.01.2026',
        oldStatusLabel: 'Onay Bekleyen',
        newStatusLabel: 'Aktif',
        equipmentName: 'Analog Way Aquilon',
        maintenanceDate: '20.01.2026',
        inviterName: 'SK Admin',
        roleLabel: 'Teknisyen',
        userEmail: 'teknisyen@example.com',
        temporaryPasswordHtml:
          '<p><strong>Geçici Şifre:</strong> 123456</p><p style="color:#d32f2f;font-size:12px;">⚠️ İlk girişte şifrenizi değiştirmeniz önerilir.</p>',
        adminLoginUrl: 'http://localhost:3000/admin/login',
      },
      null,
      2
    )
  );
  const [previewResult, setPreviewResult] = useState<{ subject: string; html: string; used?: any } | null>(null);

  const isBusy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || previewMutation.isPending;

  const canSubmit = useMemo(() => {
    if (!form.key.trim() || !form.name.trim()) return false;
    if (!Array.isArray(form.variants) || form.variants.length === 0) return false;
    const v0 = form.variants[0];
    if (!v0?.name?.trim()) return false;
    const tr = v0?.locales?.tr;
    if (!tr?.subject?.trim() || !tr?.html?.trim()) return false;
    return true;
  }, [form]);

  const activeVariant = form.variants[activeVariantIdx] || form.variants[0];
  const activeContent = activeVariant?.locales?.[activeLocale] || { subject: '', html: '' };

  const handleStartCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setActiveVariantIdx(0);
    setActiveLocale('tr');
    setPreviewResult(null);
  };

  const handleStartEdit = (t: EmailTemplate) => {
    setEditing(t);
    setForm({
      key: t.key,
      name: t.name,
      description: t.description || '',
      enabled: t.enabled,
      variants: (t.variants && t.variants.length > 0 ? t.variants : [emptyVariant]) as EmailTemplateVariant[],
    });
    setActiveVariantIdx(0);
    setActiveLocale('tr');
    setPreviewResult(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Email template silinsin mi?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Email template silindi');
      if (editing?._id === id) handleStartCreate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Silme başarısız');
    }
  };

  const handleAddVariant = () => {
    const nextName = `variant-${form.variants.length + 1}`;
    setForm((p) => ({
      ...p,
      variants: [
        ...p.variants,
        {
          ...emptyVariant,
          name: nextName,
        },
      ],
    }));
    setActiveVariantIdx(form.variants.length);
  };

  const handleRemoveVariant = (idx: number) => {
    if (form.variants.length <= 1) return;
    setForm((p) => ({
      ...p,
      variants: p.variants.filter((_, i) => i !== idx),
    }));
    setActiveVariantIdx(0);
  };

  const handleUpdateActiveVariant = (patch: Partial<EmailTemplateVariant>) => {
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => (i === activeVariantIdx ? { ...v, ...patch } : v)),
    }));
  };

  const handleUpdateActiveLocaleContent = (patch: Partial<{ subject: string; html: string }>) => {
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => {
        if (i !== activeVariantIdx) return v;
        return {
          ...v,
          locales: {
            ...v.locales,
            [activeLocale]: {
              ...(v.locales?.[activeLocale] || { subject: '', html: '' }),
              ...patch,
            },
          },
        };
      }),
    }));
  };

  const handlePreview = async () => {
    try {
      const data = safeJsonParse(previewDataRaw);
      const res = await previewMutation.mutateAsync({
        key: form.key.trim(),
        locale: activeLocale,
        variantName: activeVariant?.name,
        data,
        template: {
          key: form.key.trim(),
          variants: form.variants,
        },
      });
      setPreviewResult(res);
      toast.success('Önizleme hazır');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Önizleme alınamadı');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('key, ad ve en az 1 variant + TR subject/html zorunlu');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing._id,
          data: {
            name: form.name.trim(),
            description: form.description?.trim() || undefined,
            enabled: form.enabled,
            variants: form.variants,
          },
        });
        toast.success('Email template güncellendi');
      } else {
        await createMutation.mutateAsync({
          key: form.key.trim(),
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          enabled: form.enabled,
          variants: form.variants,
        });
        toast.success('Email template oluşturuldu');
      }
      handleStartCreate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'İşlem başarısız');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Şablonları</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Değişkenli ({'{{var}}'} / {'{{{var}}}'}) HTML şablonlar + canlı önizleme + A/B variant.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
          disabled={isBusy}
        >
          Yeni Şablon
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editing ? 'Şablon Düzenle' : 'Şablon Oluştur'}
          </h2>
          {editing && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{editing._id}</code>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
            <input
              value={form.key}
              onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              placeholder="örn: task_assigned"
              disabled={Boolean(editing)}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Not: Key create sonrası değiştirilemez.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              placeholder="örn: Görev Atandı"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama (opsiyonel)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              placeholder="örn: Task assigned email"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-700"
              />
              Aktif
            </label>
          </div>
        </div>

        {/* Variant / Locale selector */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Variant:</span>
            {form.variants.map((v, idx) => (
              <button
                key={`${v.name}-${idx}`}
                type="button"
                onClick={() => setActiveVariantIdx(idx)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  idx === activeVariantIdx
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {v.name}
              </button>
            ))}
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-2 rounded-lg text-sm border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={isBusy}
            >
              + Variant
            </button>
            {form.variants.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveVariant(activeVariantIdx)}
                className="px-3 py-2 rounded-lg text-sm border bg-red-600 text-white border-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isBusy}
              >
                Variant Sil
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Dil:</span>
            {(['tr', 'en'] as const).map((lc) => (
              <button
                key={lc}
                type="button"
                onClick={() => setActiveLocale(lc)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  lc === activeLocale
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {lc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Variant adı</label>
                <input
                  value={activeVariant?.name || ''}
                  onChange={(e) => handleUpdateActiveVariant({ name: e.target.value })}
                  className="w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Weight</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={activeVariant?.weight ?? 100}
                  onChange={(e) => handleUpdateActiveVariant({ weight: Number(e.target.value) })}
                  className="w-28 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject ({activeLocale.toUpperCase()})</label>
              <input
                value={activeContent.subject}
                onChange={(e) => handleUpdateActiveLocaleContent({ subject: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                placeholder="örn: Görev Güncellendi - SK Production"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTML ({activeLocale.toUpperCase()})</label>
              <textarea
                value={activeContent.html}
                onChange={(e) => handleUpdateActiveLocaleContent({ html: e.target.value })}
                className="w-full min-h-[260px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 font-mono text-xs"
                placeholder="<div>...</div>"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {'{{var}}'} escape’li, {'{{{var}}}'} raw HTML basar. Nested: {'{{user.name}}'}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Önizleme</h3>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  disabled={isBusy}
                >
                  Çalıştır
                </button>
              </div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mt-2 mb-1">Preview data (JSON)</label>
              <textarea
                value={previewDataRaw}
                onChange={(e) => setPreviewDataRaw(e.target.value)}
                className="w-full min-h-[180px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2 font-mono text-xs"
              />
            </div>

            {previewResult && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>Subject:</strong> {previewResult.subject}
                    </div>
                    {previewResult.used && (
                      <div className="mt-1">
                        <strong>Used:</strong> {previewResult.used.templateKey} / {previewResult.used.variantName} / {previewResult.used.locale}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">HTML Render</div>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: previewResult.html }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
            disabled={!canSubmit || isBusy}
          >
            {editing ? 'Kaydet' : 'Oluştur'}
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Şablonlar</h2>
          {isLoading && <span className="text-sm text-gray-500">Yükleniyor…</span>}
        </div>

        {error ? (
          <div className="p-5 text-sm text-red-600">Email template listesi alınamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Key</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Ad</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Durum</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Variant</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600 dark:text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(templates || []).map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      <code className="text-xs">{t.key}</code>
                    </td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{t.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          t.enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {t.enabled ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      {(t.variants || []).length}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(t)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          disabled={isBusy}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          disabled={isBusy}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(templates || []).length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                      Henüz email template yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

