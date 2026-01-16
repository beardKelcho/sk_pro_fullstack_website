'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CommentResourceType, useComments, useCreateComment, useDeleteComment } from '@/services/commentService';

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

  const canSubmit = useMemo(() => message.trim().length > 0, [message]);

  const handleToggleMention = (userId: string) => {
    setSelectedMentions((prev) => (prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({ message: message.trim(), mentions: selectedMentions });
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
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Yorum yaz…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
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
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.message}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Henüz yorum yok.</div>
        )}
      </div>
    </div>
  );
}

