'use client';

import React from 'react';

interface QRCodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  code: string;
  qrImage: string; // data URL (base64 png)
}

export default function QRCodePrintModal({ isOpen, onClose, title, code, qrImage }: QRCodePrintModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `${(title || code).replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=600,height=700');
    if (!w) return;

    const safeTitle = (title || 'QR Kod').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${safeTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            .wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
            img { width: 320px; height: 320px; object-fit: contain; }
            .title { font-size: 16px; font-weight: 700; text-align: center; }
            .code { font-size: 12px; color: #333; word-break: break-all; text-align: center; }
            @media print { body { margin: 0; } .wrap { padding: 16px; } }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="title">${safeTitle}</div>
            <img src="${qrImage}" alt="QR" />
            <div class="code">${safeCode}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">QR Kod Hazır</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Etiket için indir veya yazdır</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Kapat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-64 h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} alt="QR" className="w-full h-full object-contain" />
            </div>
            {title && (
              <p className="text-sm font-medium text-gray-900 dark:text-white text-center">{title}</p>
            )}
            <code className="text-xs text-gray-600 dark:text-gray-300 break-all text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 w-full">
              {code}
            </code>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            PNG İndir
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary"
          >
            Yazdır
          </button>
        </div>
      </div>
    </div>
  );
}

