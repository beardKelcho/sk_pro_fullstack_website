import apiClient from '@/services/api/axios';
import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  type: 'equipment' | 'project' | 'task' | 'client' | 'user' | 'maintenance';
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total: number;
  results: {
    equipment: SearchResult[];
    projects: SearchResult[];
    tasks: SearchResult[];
    clients: SearchResult[];
    users: SearchResult[];
    maintenance: SearchResult[];
  };
  all: SearchResult[];
}

export interface SearchSuggestionsResponse {
  success: boolean;
  suggestions: string[];
}

export const globalSearch = async (query: string, limit: number = 10): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>('/search', {
    params: { q: query, limit },
  });
  return response.data;
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const response = await apiClient.get<SearchSuggestionsResponse>('/search/suggestions', {
    params: { q: query },
  });
  return response.data.suggestions;
};

// React Query Hooks
export const useGlobalSearch = (query: string, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: () => globalSearch(query, limit),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30 saniye
  });
};

export const useSearchSuggestions = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
};

