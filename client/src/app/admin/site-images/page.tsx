'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAllImages, createImage, deleteImage, deleteMultipleImages, updateImage, SiteImage } from '@/services/siteImageService';
import { toast } from 'react-toastify';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import logger from '@/utils/logger';

export default function SiteImagesPage() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  // Varsayılan kategori 'project' - anasayfada gösterilmek için
  const [imageCategory, setImageCategory] = useState<'project' | 'gallery' | 'hero' | 'other'>('project');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const response = await getAllImages(params);
      setImages(response.images || []);
    } catch (error) {
      logger.error('Resimler yükleme hatası:', error);
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
    
    files.forEach((file, index) => {
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
      formData.append('type', 'site-images');

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/multiple`, {
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
        // Path'i doğru oluştur
        let imagePath = fileData.url.replace(/^\/uploads\//, '');
        if (!imagePath || imagePath === fileData.url) {
          imagePath = `${imageCategory || 'site-images'}/${fileData.filename}`;
        }
        
        return createImage({
          filename: fileData.filename,
          originalName: fileData.originalname,
          path: imagePath,
          url: fileData.url,
          category: imageCategory,
          order: images.length + index,
          isActive: true,
        });
      });

      await Promise.all(uploadPromises);

      toast.success(`${uploadData.files.length} resim başarıyla yüklendi`);
      setShowUploadModal(false);
      setSelectedFiles([]);
      // Varsayılan kategori 'project' - anasayfada gösterilmek için
      setImageCategory('project');
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
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteImage(id);
      toast.success('Resim başarıyla silindi');
      setSelectedImageIds([]);
      fetchImages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resim silinirken bir hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) {
      toast.error('Lütfen silmek için en az bir resim seçin');
      return;
    }

    if (!confirm(`${selectedImageIds.length} resmi silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const result = await deleteMultipleImages(selectedImageIds);
      toast.success(`${result.deletedCount} resim başarıyla silindi`);
      setSelectedImageIds([]);
      fetchImages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resimler silinirken bir hata oluştu');
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
    if (selectedImageIds.length === filteredImages.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(filteredImages.map(img => img._id || img.id || '').filter(Boolean));
    }
  };

  const handleToggleActive = async (image: SiteImage) => {
    try {
      await updateImage(image._id || image.id || '', {
        isActive: !image.isActive,
      });
      toast.success(`Resim ${image.isActive ? 'pasif' : 'aktif'} hale getirildi`);
      fetchImages();
    } catch (error: any) {
      toast.error('Resim güncellenirken bir hata oluştu');
    }
  };

  const categoryNames = {
    all: 'Tümü',
    project: 'Proje',
    gallery: 'Galeri',
    hero: 'Hero',
    other: 'Diğer',
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Site Resimleri Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Anasayfada gösterilen resimleri yönetin
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors"
          >
            Resim Ekle
          </button>
          {selectedImageIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Seçili Resimleri Sil ({selectedImageIds.length})
            </button>
          )}
          <Link href="/admin/projects">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Projeler
            </button>
          </Link>
        </div>
      </div>

      {/* Kategori Filtresi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-[#0066CC] dark:bg-primary-light text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Resim Listesi */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Resim bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedCategory === 'all' 
              ? 'Henüz hiç resim eklenmemiş' 
              : `${categoryNames[selectedCategory as keyof typeof categoryNames]} kategorisinde resim bulunamadı`}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary"
            >
              Resim Ekle
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Toplu İşlemler */}
          {filteredImages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedImageIds.length === filteredImages.length && filteredImages.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tümünü Seç ({selectedImageIds.length}/{filteredImages.length})
                  </span>
                </label>
              </div>
              {selectedImageIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
                >
                  Seçili {selectedImageIds.length} Resmi Sil
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => {
              const imageId = image._id || image.id || '';
              const isSelected = selectedImageIds.includes(imageId);
              return (
              <div
                key={imageId}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 transition-all relative modern-card group ${
                  isSelected
                    ? 'border-[#0066CC] dark:border-primary-light ring-2 ring-[#0066CC] dark:ring-primary-light shadow-xl scale-105'
                    : image.isActive 
                      ? 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700' 
                      : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-20 bg-white/95 dark:bg-gray-800/95 rounded-lg p-1.5 shadow-lg backdrop-blur-sm">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectImage(imageId)}
                    className="w-5 h-5 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light cursor-pointer"
                  />
                </div>
                
                {/* Seçili badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-[#0066CC] to-[#00C49F] dark:from-primary-light dark:to-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    ✓ Seçili
                  </div>
                )}
                
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {(() => {
                  const imageUrl = getImageUrl({ image, fallback: '' });
                  
                  if (!imageUrl || imageUrl.trim() === '') {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Resim yok</p>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      <LazyImage
                        src={imageUrl}
                        alt={image.originalName}
                        fill
                        objectFit="cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                        quality={85}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-[#0066CC] dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                {!image.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-sm font-semibold bg-red-600/90 px-3 py-1.5 rounded-full">Pasif</span>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {image.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {categoryNames[image.category as keyof typeof categoryNames]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(image)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                      image.isActive
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {image.isActive ? 'Pasif Yap' : 'Aktif Yap'}
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
                    className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
            );
            })}
          </div>
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
                  Resim Yükle
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kategori
                    </label>
                    <select
                      value={imageCategory}
                      onChange={(e) => setImageCategory(e.target.value as any)}
                      className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                    >
                      <option value="project">Proje (Anasayfada gösterilir)</option>
                      <option value="gallery">Galeri</option>
                      <option value="hero">Hero</option>
                      <option value="other">Diğer</option>
                    </select>
                    {imageCategory === 'project' && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        Bu resim anasayfadaki carousel'de gösterilecektir.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resim Dosyası
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
                      Birden fazla resim seçebilirsiniz. Maksimum dosya boyutu: 10MB. Desteklenen formatlar: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-base font-medium text-white hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] dark:focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? `Yükleniyor... (${selectedFiles.length} dosya)` : `${selectedFiles.length} Resmi Yükle`}
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

