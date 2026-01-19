'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { PermissionButton } from '@/components/common/PermissionButton';
import { Permission } from '@/config/permissions';
import axios from '@/services/api/axios';
import logger from '@/utils/logger';

interface FileItem {
  filename: string;
  path: string;
  size: number;
  uploadedAt: string;
  modifiedAt: string;
  type: 'image' | 'video' | 'document';
  url: string;
  mimetype: string;
}

interface FileListResponse {
  success: boolean;
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const FileManagementPage: React.FC = () => {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dosya listesini yükle
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<FileListResponse>('/upload/list', {
        params: {
          type: fileType === 'all' ? undefined : fileType,
          page: currentPage,
          limit: 50,
          search: searchTerm || undefined,
        },
      });

      if (response.data.success) {
        setFiles(response.data.files);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      logger.error('Dosya listesi yükleme hatası:', error);
      toast.error('Dosya listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fileType, currentPage, searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Dosya seçimi
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Dosya yükleme
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Lütfen yüklenecek dosya seçin');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      if (selectedFiles.length === 1) {
        formData.append('file', selectedFiles[0]);
        formData.append('type', fileType === 'all' ? 'general' : fileType);
        
        const response = await axios.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          toast.success('Dosya başarıyla yüklendi');
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fetchFiles();
        }
      } else {
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('type', fileType === 'all' ? 'general' : fileType);
        
        const response = await axios.post('/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          toast.success(`${selectedFiles.length} dosya başarıyla yüklendi`);
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fetchFiles();
        }
      }
    } catch (error: any) {
      logger.error('Dosya yükleme hatası:', error);
      toast.error(error.response?.data?.message || 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Dosya silme
  const handleDelete = async (filename: string, path: string) => {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // Path'den type'ı çıkar
      const type = path.split('/')[0] || 'general';
      
      await axios.delete(`/upload/${encodeURIComponent(filename)}`, {
        params: { type },
      });

      toast.success('Dosya başarıyla silindi');
      fetchFiles();
    } catch (error: any) {
      logger.error('Dosya silme hatası:', error);
      toast.error(error.response?.data?.message || 'Dosya silinirken bir hata oluştu');
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Tarih formatla
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Dosya tipi ikonu
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dosya Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tüm dosyaları görüntüleyin, yükleyin ve yönetin
          </p>
        </div>
        <PermissionButton
          permission={Permission.FILE_UPLOAD}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Dosya Yükle
        </PermissionButton>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={fileType}
          onChange={(e) => {
            setFileType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Tüm Dosyalar</option>
          <option value="site-images">Site Görselleri</option>
          <option value="videos">Videolar</option>
          <option value="general">Genel</option>
        </select>
      </div>

      {/* Upload Section */}
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {selectedFiles.length} dosya seçildi
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {selectedFiles.map((f) => f.name).join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleUpload}
                isLoading={uploading}
                disabled={uploading}
              >
                Yükle
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFiles([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Dosya bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dosya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Boyut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Yüklenme Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map((file) => (
                    <tr key={file.path} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.filename}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {file.path}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Görüntüle
                          </a>
                          <PermissionButton
                            permission={Permission.FILE_DELETE}
                            onClick={() => handleDelete(file.filename, file.path)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Sil
                          </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Toplam {total} dosya
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileManagementPage;
