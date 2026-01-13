'use client';

import React, { useState, useRef } from 'react';
import apiClient from '@/services/api/axios';

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // MB
  multiple?: boolean;
  type?: string; // 'equipment', 'project', 'general'
  label?: string;
  className?: string;
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 10,
  multiple = false,
  type = 'general',
  label = 'Dosya Yükle',
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        onUploadSuccess?.(response.data.file);
        setProgress(100);
      } else {
        throw new Error(response.data.message || 'Yükleme başarısız');
      }
    } catch (error: any) {
      console.error('Dosya yükleme hatası:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Dosya yüklenirken bir hata oluştu';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <label className="block">
        <span className="sr-only">{label}</span>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0066CC] file:text-white hover:file:bg-[#0055AA] disabled:opacity-50"
        />
      </label>
      
      {uploading && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Yükleniyor...</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#0066CC] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

