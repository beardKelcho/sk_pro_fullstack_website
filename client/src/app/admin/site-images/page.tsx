'use client';

import React, { useState, useRef } from 'react';
import { useSiteImages, useUploadSiteImage, useDeleteSiteImage, SiteImage } from '@/hooks/useSiteContent';
import LazyImage from '@/components/common/LazyImage';
import { getImageUrl } from '@/utils/imageUrl';

export default function SiteImagesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch images matches hook signature
  const { data: imagesData, isLoading } = useSiteImages(selectedCategory === 'all' ? undefined : selectedCategory);
  const images = imagesData?.images || [];

  const uploadImageMutation = useUploadSiteImage();
  const deleteImageMutation = useDeleteSiteImage();
  const isUploading = uploadImageMutation.isPending;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<SiteImage['category']>('project');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', uploadCategory);
      await uploadImageMutation.mutateAsync(formData);
    }

    setShowUploadModal(false);
    setSelectedFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      deleteImageMutation.mutate(id);
    }
  };

  const categoryNames: Record<string, string> = {
    all: 'Tümü',
    project: 'Proje',
    gallery: 'Galeri',
    hero: 'Hero',
    other: 'Diğer',
  };

  if (isLoading) return <div className="p-12 text-center">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Görsel Yönetimi</h1>
        <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Görsel Ekle</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {Object.entries(categoryNames).map(([key, label]) => (
          <button key={key} onClick={() => setSelectedCategory(key)} className={`px-3 py-1 rounded ${selectedCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id || img._id} className="relative group border rounded overflow-hidden">
            <div className="aspect-square relative">
              <LazyImage src={getImageUrl(img.id || img._id)} alt="img" fill className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => handleDelete(img.id || img._id || '')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Sil</button>
            </div>
            <div className="p-2 text-xs truncate dark:text-gray-300">{img.filename}</div>
          </div>
        ))}
        {images.length === 0 && <p className="col-span-full text-center py-8 text-gray-500">Görsel yok.</p>}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Görsel Yükle</h3>
            <div className="space-y-4">
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value as any)}
                className="w-full border p-2 rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              >
                <option value="project">Proje</option>
                <option value="gallery">Galeri</option>
                <option value="hero">Hero</option>
                <option value="other">Diğer</option>
              </select>
              <input type="file" multiple onChange={handleFileSelect} className="block w-full text-sm dark:text-gray-300" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-200 rounded">İptal</button>
                <button onClick={handleUpload} disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {isUploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
