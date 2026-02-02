'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { globalSearch, getSearchSuggestions, SearchResult } from '@/services/searchService';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSavedSearches, useSearchHistory, useCreateSavedSearch, useDeleteSavedSearch, useClearSearchHistory } from '@/services/savedSearchService';
import { toast } from 'react-toastify';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  equipment: 'Ekipman',
  project: 'Proje',
  task: 'Görev',
  client: 'Müşteri',
  user: 'Kullanıcı',
  maintenance: 'Bakım',
};

const typeColors: Record<string, string> = {
  equipment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  project: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  task: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  client: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  user: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-400',
  maintenance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};

const typePaths: Record<string, string> = {
  equipment: '/admin/inventory/view',
  project: '/admin/projects/view',
  task: '/admin/tasks/view',
  client: '/admin/clients/view',
  user: '/admin/users/view',
  maintenance: '/admin/maintenance',
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'history'>('search');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Saved searches and history
  const { data: savedSearchesData } = useSavedSearches();
  const { data: searchHistoryData } = useSearchHistory(10);
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();
  const clearHistory = useClearSearchHistory();

  const savedSearches = savedSearchesData?.savedSearches || [];
  const searchHistory = searchHistoryData?.history || [];

  // Arama önerileri
  const { data: suggestionsData } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2 && showSuggestions && isOpen,
    staleTime: 30000,
  });

  // Global arama
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: () => globalSearch(query, 10),
    enabled: query.length >= 2 && !showSuggestions,
    staleTime: 30000,
  });

  // Click outside handler
  useClickOutside(containerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  // Input focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleResultClick = useCallback((result: SearchResult) => {
    const path = typePaths[result.type];
    if (path) {
      router.push(`${path}/${result.id}`);
      onClose();
      setQuery('');
      setSelectedIndex(-1);
    }
  }, [router, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const allResults = searchData?.all || [];
        setSelectedIndex(prev =>
          prev < allResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const allResults = searchData?.all || [];
        if (allResults[selectedIndex]) {
          handleResultClick(allResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchData, handleResultClick, onClose]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2 && value.length < 3);
    setSelectedIndex(-1);
    setActiveTab('search');
  };

  const handleSaveSearch = async () => {
    if (!query || query.length < 2) {
      toast.error('Arama kaydetmek için en az 2 karakter girin');
      return;
    }

    try {
      const result = await createSavedSearch.mutateAsync({
        name: query,
        resource: 'All',
        filters: { query },
      });

      if (result && result.success) {
        toast.success('Arama kaydedildi');
        setActiveTab('saved');
      } else {
        toast.error('Arama kaydedilemedi');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Arama kaydedilirken bir hata oluştu';
      toast.error(errorMessage);
      const logger = require('@/utils/logger').default;
      logger.error('Arama kaydetme hatası:', error);
    }
  };

  const handleDeleteSavedSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedSearch.mutateAsync(id);
      toast.success('Kaydedilmiş arama silindi');
    } catch (error: any) {
      toast.error('Arama silinirken bir hata oluştu');
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory.mutateAsync();
      toast.success('Arama geçmişi temizlendi');
    } catch (error: any) {
      toast.error('Arama geçmişi temizlenirken bir hata oluştu');
    }
  };

  const handleUseSavedSearch = (savedSearch: any) => {
    if (savedSearch.filters?.query) {
      setQuery(savedSearch.filters.query);
      setActiveTab('search');
    }
  };

  const handleUseHistory = (historyItem: any) => {
    setQuery(historyItem.query);
    setActiveTab('search');
  };

  if (!isOpen) return null;

  const allResults = searchData?.all || [];
  const suggestions = suggestionsData || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg
            className="w-5 h-5 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Ara... (Ekipman, Proje, Görev, Müşteri, vb.)"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoComplete="off"
            aria-label="Global arama"
          />
          {query && (
            <>
              <button
                onClick={handleSaveSearch}
                className="ml-2 p-1 text-gray-400 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors"
                title="Aramayı kaydet"
                aria-label="Aramayı kaydet"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(-1);
                }}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Aramayı temizle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        {query.length < 2 && (
          <div className="border-b border-gray-200 dark:border-gray-700 flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'search'
                ? 'text-[#0066CC] dark:text-primary-light border-b-2 border-[#0066CC] dark:border-primary-light'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Arama
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'saved'
                ? 'text-[#0066CC] dark:text-primary-light border-b-2 border-[#0066CC] dark:border-primary-light'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Kaydedilmiş ({savedSearches.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'history'
                ? 'text-[#0066CC] dark:text-primary-light border-b-2 border-[#0066CC] dark:border-primary-light'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              Geçmiş ({searchHistory.length})
            </button>
          </div>
        )}

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            activeTab === 'saved' ? (
              <div className="py-2">
                {savedSearches.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Henüz kaydedilmiş arama yok</p>
                  </div>
                ) : (
                  savedSearches.map((saved) => (
                    <button
                      key={saved._id}
                      onClick={() => handleUseSavedSearch(saved)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{saved.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {saved.resource !== 'All' ? saved.resource : 'Tüm Modüller'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSavedSearch(saved._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </button>
                  ))
                )}
              </div>
            ) : activeTab === 'history' ? (
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Arama Geçmişi
                  </span>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Temizle
                    </button>
                  )}
                </div>
                {searchHistory.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Henüz arama geçmişi yok</p>
                  </div>
                ) : (
                  searchHistory.map((history) => (
                    <button
                      key={history._id}
                      onClick={() => handleUseHistory(history)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{history.query}</div>
                          {history.resource && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {history.resource}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(history.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Aramaya başlamak için en az 2 karakter girin</p>
                <p className="text-xs mt-2">Kısayol: Ctrl+K veya Cmd+K</p>
              </div>
            )
          ) : isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC] mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Aranıyor...</p>
            </div>
          ) : showSuggestions && suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Öneriler
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : allResults.length > 0 ? (
            <div className="py-2">
              {/* Kategorize edilmiş sonuçlar */}
              {Object.entries(searchData?.results || {}).map(([type, results]: [string, SearchResult[]]) => {
                if (results.length === 0) return null;
                return (
                  <div key={type} className="mb-4">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {typeLabels[type]} ({results.length})
                    </div>
                    {results.map((result, index) => {
                      const globalIndex = allResults.findIndex(r => r.id === result.id && r.type === result.type);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                        >
                          <div className="flex items-start">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[result.type] || 'bg-gray-100'}`}>
                              {typeLabels[result.type]}
                            </span>
                            <div className="flex-1 ml-3">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {result.title}
                              </div>
                              {result.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {result.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Sonuç bulunamadı</p>
              <p className="text-xs mt-2">Farklı bir arama terimi deneyin</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
              <span className="ml-1">navigate</span>
            </span>
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
              <span className="ml-1">select</span>
            </span>
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              <span className="ml-1">close</span>
            </span>
          </div>
          {searchData && (
            <span>{searchData.total} sonuç bulundu</span>
          )}
        </div>
      </div>
    </div>
  );
}

