'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllImages, createImage, deleteImage, deleteMultipleImages, updateImage, SiteImage } from '@/services/siteImageService';
import { toast } from 'react-toastify';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import logger from '@/utils/logger';

export default function ProjectGalleryPage() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getAllImages({ category: 'project' });
      setImages(response.images || []);
    } catch (error) {
      logger.error('Resim yükleme hatası:', error);
      toast.error('Resimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Dosya validasyonu
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Resim dosyası değil`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Dosya boyutu 10MB'dan büyük`);
        return;
      }
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Lütfen en az bir dosya seçin');
      return;
    }

    setUploading(true);
    try {
      // Çoklu dosya yükleme
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // type'ı query param ile gönder (multipart field sırası yüzünden multer destination'da body type garanti değil)
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/multiple?type=site-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Dosya yükleme başarısız');
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success || !uploadData.files || uploadData.files.length === 0) {
        throw new Error('Dosya yükleme başarısız');
      }

      // Her dosya için veritabanına kayıt oluştur
      const uploadPromises = uploadData.files.map(async (fileData: any, index: number) => {
        const imagePath = fileData.url.replace(/^\/uploads\//, '');
        
        return createImage({
          filename: fileData.filename,
          originalName: fileData.originalname,
          path: imagePath,
          url: fileData.url,
          category: 'project',
          order: images.length + index,
          isActive: true,
        });
      });

      await Promise.all(uploadPromises);

      toast.success(`${uploadData.files.length} proje görseli başarıyla yüklendi`);
      setShowUploadModal(false);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || 'Resimler yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu proje görselini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteImage(id);
      toast.success('Proje görseli başarıyla silindi');
      setSelectedImageIds([]);
      fetchImages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resim silinirken bir hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) {
      toast.error('Lütfen silmek için en az bir görsel seçin');
      return;
    }

    if (!confirm(`${selectedImageIds.length} proje görselini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const result = await deleteMultipleImages(selectedImageIds);
      toast.success(`${result.deletedCount} proje görseli başarıyla silindi`);
      setSelectedImageIds([]);
      fetchImages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Görseller silinirken bir hata oluştu');
    }
  };

  const handleSelectImage = (id: string) => {
    setSelectedImageIds(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedImageIds.length === images.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(images.map(img => img._id || img.id || '').filter(Boolean));
    }
  };

  const handleToggleActive = async (image: SiteImage) => {
    try {
      await updateImage(image._id || image.id || '', {
        isActive: !image.isActive,
      });
      toast.success(`Proje görseli ${image.isActive ? 'pasif' : 'aktif'} hale getirildi`);
      fetchImages();
    } catch (error: any) {
      toast.error('Proje görseli güncellenirken bir hata oluştu');
    }
  };

  const activeImages = images.filter(img => img.isActive);
  const inactiveImages = images.filter(img => !img.isActive);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Proje Görselleri Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Anasayfadaki &quot;Projelerimiz&quot; bölümünde gösterilen görselleri yönetin
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors"
          >
            Görsel Ekle
          </button>
          {selectedImageIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Seçili Görselleri Sil ({selectedImageIds.length})
            </button>
          )}
          <Link href="/admin/site-images">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Tüm Resimler
            </button>
          </Link>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{images.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeImages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveImages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktif Görseller */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Toplu İşlemler */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedImageIds.length === images.length && images.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tümünü Seç ({selectedImageIds.length}/{images.length})
                  </span>
                </label>
              </div>
              {selectedImageIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
                >
                  Seçili {selectedImageIds.length} Görseli Sil
                </button>
              )}
            </div>
          )}
          {activeImages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aktif Görseller ({activeImages.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activeImages.map((image) => {
                  const imageId = image._id || image.id || '';
                  const isSelected = selectedImageIds.includes(imageId);
                  return (
                    <div
                      key={imageId}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-2 transition-all relative ${
                        isSelected
                          ? 'border-[#0066CC] dark:border-primary-light ring-2 ring-[#0066CC] dark:ring-primary-light'
                          : 'border-green-200 dark:border-green-800'
                      }`}
                    >
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 z-20 bg-white dark:bg-gray-800 rounded p-1 shadow-md">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectImage(imageId)}
                        className="w-5 h-5 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light cursor-pointer"
                      />
                    </div>
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                      {(() => {
                        const imageUrl = getImageUrl({ image, fallback: '' });
                        
                        if (!imageUrl || imageUrl.trim() === '') {
                          return <div className="w-full h-full flex items-center justify-center text-gray-400">Resim yok</div>;
                        }
                        
                        return (
                          <LazyImage
                            src={imageUrl}
                            alt={image.originalName}
                            fill
                            objectFit="cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={80}
                          />
                        );
                      })()}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-3">
                        {image.originalName}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(image)}
                          className="flex-1 px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                        >
                          Pasif Yap
                        </button>
                        <button
                          onClick={() => {
                            const imageId = image._id || image.id;
                            if (!imageId) {
                              toast.error('Resim ID bulunamadı');
                              return;
                            }
                            handleDelete(imageId);
                          }}
                          className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pasif Görseller */}
          {inactiveImages.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pasif Görseller ({inactiveImages.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {inactiveImages.map((image) => {
                  const imageId = image._id || image.id || '';
                  const isSelected = selectedImageIds.includes(imageId);
                  return (
                    <div
                      key={imageId}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-2 transition-all relative opacity-60 ${
                        isSelected
                          ? 'border-[#0066CC] dark:border-primary-light ring-2 ring-[#0066CC] dark:ring-primary-light'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                    {/* Checkbox */}
                    <div className="absolute top-2 left-2 z-20 bg-white dark:bg-gray-800 rounded p-1 shadow-md">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectImage(imageId)}
                        className="w-5 h-5 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light cursor-pointer"
                      />
                    </div>
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                      {(() => {
                        const imageUrl = getImageUrl({ image, fallback: '' });
                        
                        if (!imageUrl || imageUrl.trim() === '') {
                          return <div className="w-full h-full flex items-center justify-center text-gray-400">Resim yok</div>;
                        }
                        
                        return (
                          <>
                            <LazyImage
                              src={imageUrl}
                              alt={image.originalName}
                              className="absolute inset-0 w-full h-full"
                              fill
                              objectFit="cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Pasif</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-3">
                        {image.originalName}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(image)}
                          className="flex-1 px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          Aktif Yap
                        </button>
                        <button
                          onClick={() => {
                            const imageId = image._id || image.id;
                            if (!imageId) {
                              toast.error('Resim ID bulunamadı');
                              return;
                            }
                            handleDelete(imageId);
                          }}
                          className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Proje görseli bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Henüz hiç proje görseli eklenmemiş
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary"
                >
                  Görsel Ekle
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => !uploading && setShowUploadModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Proje Görseli Yükle
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Görsel Dosyası
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0066CC] dark:file:bg-primary-light file:text-white
                      hover:file:bg-[#0055AA] dark:hover:file:bg-primary
                      file:cursor-pointer"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedFiles.length} dosya seçildi:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="truncate">
                            • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Birden fazla görsel seçebilirsiniz. Maksimum dosya boyutu: 10MB. Desteklenen formatlar: JPG, PNG, GIF
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-base font-medium text-white hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? `Yükleniyor... (${selectedFiles.length} dosya)` : `${selectedFiles.length} Görseli Yükle`}
                </button>
                <button
                  onClick={() => {
                    if (!uploading) {
                      setShowUploadModal(false);
                      setSelectedFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }
                  }}
                  disabled={uploading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] dark:focus:ring-primary-light sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

