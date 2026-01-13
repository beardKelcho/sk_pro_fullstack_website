'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useScanQRCode } from '@/services/qrCodeService';
import { toast } from 'react-toastify';

interface QRScannerProps {
  onScanSuccess?: (result: any) => void;
  onClose?: () => void;
  action?: 'VIEW' | 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE' | 'OTHER';
  relatedItem?: string; // Proje ID veya Maintenance ID
  relatedItemType?: 'Project' | 'Maintenance' | 'Other';
  notes?: string;
  location?: string;
}

export default function QRScanner({ 
  onScanSuccess, 
  onClose, 
  action = 'VIEW',
  relatedItem,
  relatedItemType,
  notes,
  location
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanMutation = useScanQRCode();

  useEffect(() => {
    return () => {
      // Component unmount olduğunda scanner'ı temizle
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Arka kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR kod okundu
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Hata mesajı (genellikle okuma devam ederken)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Kamera başlatılamadı');
      toast.error('Kamera başlatılamadı. Lütfen kamera iznini kontrol edin.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Scanner durdurma hatası:', err);
      }
    }
  };

  const handleQRCodeScanned = async (qrContent: string) => {
    try {
      // Scanner'ı durdur
      await stopScanning();

      // QR kod tarama
      const result = await scanMutation.mutateAsync({
        qrContent,
        action,
        relatedItem,
        relatedItemType,
        notes,
        location,
      });

      toast.success('QR kod başarıyla tarandı!');
      
      if (onScanSuccess) {
        onScanSuccess(result);
      }

      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR kod taranırken bir hata oluştu');
      // Hata durumunda tekrar taramaya başla
      setTimeout(() => {
        startScanning();
      }, 2000);
    }
  };

  const handleManualInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qrContent = formData.get('qrContent') as string;

    if (!qrContent.trim()) {
      toast.error('Lütfen QR kod içeriğini girin');
      return;
    }

    await handleQRCodeScanned(qrContent.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">QR Kod Tarama</h2>
          <button
            onClick={() => {
              stopScanning();
              if (onClose) onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
        </div>

        <div className="flex gap-2 mb-4">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Kamerayı Başlat
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Durdur
            </button>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Manuel Giriş:</p>
          <form onSubmit={handleManualInput} className="flex gap-2">
            <input
              type="text"
              name="qrContent"
              placeholder="QR kod içeriğini girin"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={scanMutation.isPending}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {scanMutation.isPending ? 'Taranıyor...' : 'Tara'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

