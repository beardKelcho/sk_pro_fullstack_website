'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CommentResourceType, useComments, useCreateComment, useDeleteComment } from '@/services/commentService';
import RichTextEditor from './RichTextEditor';

type MentionUser = { id: string; name: string };

interface CommentsPanelProps {
  resourceType: CommentResourceType;
  resourceId: string;
  mentionableUsers?: MentionUser[];
}

export default function CommentsPanel({ resourceType, resourceId, mentionableUsers = [] }: CommentsPanelProps) {
  const { data: comments, isLoading } = useComments(resourceType, resourceId);
  const createMutation = useCreateComment(resourceType, resourceId);
  const deleteMutation = useDeleteComment(resourceType, resourceId);

  const [message, setMessage] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);

  // HTML içeriğinden sadece metni çıkar (boş kontrolü için)
  const getPlainText = (html: string): string => {
    if (typeof window === 'undefined') return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const canSubmit = useMemo(() => {
    const plainText = getPlainText(message);
    return plainText.trim().length > 0;
  }, [message]);

  const handleToggleMention = (userId: string) => {
    setSelectedMentions((prev) => (prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      // HTML içeriğini gönder (backend'de sanitize edilecek)
      await createMutation.mutateAsync({ message: message, mentions: selectedMentions });
      setMessage('');
      setSelectedMentions([]);
      toast.success('Yorum eklendi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Yorum eklenemedi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yorum silinsin mi?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Yorum silindi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Yorum silinemedi');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Yorumlar</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {comments?.length ?? 0} kayıt
          </span>
        </div>

        {mentionableUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">@mention</p>
            <div className="flex flex-wrap gap-2">
              {mentionableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleToggleMention(u.id)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedMentions.includes(u.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <RichTextEditor
            value={message}
            onChange={setMessage}
            placeholder="Yorum yaz…"
            disabled={createMutation.isPending}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit || createMutation.isPending}
            className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
          >
            {createMutation.isPending ? 'Gönderiliyor…' : 'Yorum Ekle'}
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">Yükleniyor…</div>
        ) : comments && comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.author?.name || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c._id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                  aria-label="Yorumu sil"
                >
                  Sil
                </button>
              </div>
              <div
                className="mt-2 text-sm text-gray-800 dark:text-gray-200 rich-text-content"
                dangerouslySetInnerHTML={{ __html: c.message }}
              />
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Henüz yorum yok.</div>
        )}
      </div>
      <style jsx global>{`
        .rich-text-content {
          line-height: 1.6;
        }
        .rich-text-content p {
          margin: 0.5rem 0;
        }
        .rich-text-content p:first-child {
          margin-top: 0;
        }
        .rich-text-content p:last-child {
          margin-bottom: 0;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .rich-text-content h1,
        .rich-text-content h2,
        .rich-text-content h3 {
          margin: 0.75rem 0 0.5rem 0;
          font-weight: 600;
        }
        .rich-text-content h1 {
          font-size: 1.25rem;
        }
        .rich-text-content h2 {
          font-size: 1.125rem;
        }
        .rich-text-content h3 {
          font-size: 1rem;
        }
        .rich-text-content a {
          color: #0066cc;
          text-decoration: underline;
        }
        .dark .rich-text-content a {
          color: #60a5fa;
        }
        .rich-text-content strong {
          font-weight: 600;
        }
        .rich-text-content em {
          font-style: italic;
        }
        .rich-text-content u {
          text-decoration: underline;
        }
        .rich-text-content s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}

