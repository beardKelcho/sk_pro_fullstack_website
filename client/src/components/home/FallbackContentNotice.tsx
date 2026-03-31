import React from 'react';

interface FallbackContentNoticeProps {
  message: string;
}

export default function FallbackContentNotice({ message }: FallbackContentNoticeProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-lg backdrop-blur dark:border-amber-500/30 dark:bg-amber-950/85 dark:text-amber-100">
      <p className="font-semibold">Geçici içerik modu</p>
      <p className="mt-1 leading-5">{message}</p>
    </div>
  );
}
