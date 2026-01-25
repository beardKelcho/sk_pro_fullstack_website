'use client';

import React, { useState } from 'react';
import { useSiteImages, useUploadSiteImage, useDeleteSiteImage, useDeleteMultipleSiteImages, SiteImage } from '@/hooks/useSiteContent';
import AssetCard from '@/components/admin/media/AssetCard';
import UploadZone from '@/components/admin/media/UploadZone';
import { LayoutGrid, Image as ImageIcon, Video, Layers, Trash2 } from 'lucide-react';

export default function SiteImagesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadCategory, setUploadCategory] = useState<SiteImage['category']>('project');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch images matches hook signature
  const { data: imagesData, isLoading } = useSiteImages(selectedCategory === 'all' ? undefined : selectedCategory);
  const images = imagesData?.images || [];

  const uploadImageMutation = useUploadSiteImage();
  const deleteImageMutation = useDeleteSiteImage();
  const deleteMultipleMutation = useDeleteMultipleSiteImages();
  const isUploading = uploadImageMutation.isPending;

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Sequential upload for simplicity, parallel could be better but riskier for rate limits
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', uploadCategory);
      await uploadImageMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu görseli silmek istediğinize emin misiniz?')) {
      deleteImageMutation.mutate(id);
    }
  };

  const toggleSelect = (id: string) => {
    if (!isSelectionMode) return;

    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Seçili ${selectedIds.size} görseli silmek istediğinize emin misiniz?`)) {
      await deleteMultipleMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const categories = [
    { key: 'all', label: 'Tümü', icon: <LayoutGrid size={18} /> },
    { key: 'project', label: 'Proje', icon: <ImageIcon size={18} /> },
    { key: 'gallery', label: 'Galeri', icon: <ImageIcon size={18} /> },
    // { key: 'video', label: 'Video', icon: <Video size={18} /> }, // If video category exists differently
    { key: 'hero', label: 'Hero', icon: <Layers size={18} /> },
    { key: 'other', label: 'Diğer', icon: <Layers size={18} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Medya Kütüphanesi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Görsel ve video içeriklerinizi yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          >
            <option value="project">Yükleme Hedefi: Proje</option>
            <option value="gallery">Yükleme Hedefi: Galeri</option>
            <option value="hero">Yükleme Hedefi: Hero</option>
            <option value="other">Yükleme Hedefi: Diğer</option>
          </select>
        </div>
      </div>

      {/* Upload Section */}
      <UploadZone onUpload={handleUpload} isUploading={isUploading} />

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        {/* Category Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${selectedCategory === cat.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isSelectionMode && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Seçilileri Sil ({selectedIds.size})
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                 ${isSelectionMode
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
          >
            {isSelectionMode ? 'Vazgeç' : 'Seçim Yap'}
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Toplam <strong>{images.length}</strong> medya ögesi gösteriliyor.
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((img) => (
          <AssetCard
            key={img.id || img._id}
            asset={img}
            isSelected={selectedIds.has(img.id || img._id || '')}
            onToggleSelect={toggleSelect}
            onDelete={handleDelete}
            selectionMode={isSelectionMode}
          />
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>Bu kategoride henüz görsel bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
