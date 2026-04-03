import type { SearchResponse, SearchResult } from '@/services/searchService';

export type SearchTypeFilter = 'all' | SearchResult['type'];

export type GroupedSearchResults = Array<{
  type: SearchResult['type'];
  results: SearchResult[];
}>;

const SEARCH_TYPE_ORDER: SearchResult['type'][] = [
  'equipment',
  'project',
  'task',
  'client',
  'user',
  'maintenance',
];

const RESULT_KEY_BY_TYPE: Record<SearchResult['type'], keyof SearchResponse['results']> = {
  equipment: 'equipment',
  project: 'projects',
  task: 'tasks',
  client: 'clients',
  user: 'users',
  maintenance: 'maintenance',
};

export const filterSearchResponse = (
  response: SearchResponse | undefined,
  typeFilter: SearchTypeFilter
): {
  allResults: SearchResult[];
  groupedResults: GroupedSearchResults;
  total: number;
} => {
  if (!response) {
    return {
      allResults: [],
      groupedResults: [],
      total: 0,
    };
  }

  const groupedResults = SEARCH_TYPE_ORDER.map((type) => ({
    type,
    results:
      typeFilter === 'all' || typeFilter === type
        ? response.results[RESULT_KEY_BY_TYPE[type]] || []
        : [],
  })).filter((group) => group.results.length > 0);

  return {
    allResults: groupedResults.flatMap((group) => group.results),
    groupedResults,
    total: groupedResults.reduce((sum, group) => sum + group.results.length, 0),
  };
};

export const buildSearchTypeCounts = (response: SearchResponse | undefined) => {
  const counts = SEARCH_TYPE_ORDER.reduce<Record<SearchResult['type'], number>>(
    (acc, type) => {
      acc[type] = response?.results[RESULT_KEY_BY_TYPE[type]]?.length || 0;
      return acc;
    },
    {
      equipment: 0,
      project: 0,
      task: 0,
      client: 0,
      user: 0,
      maintenance: 0,
    }
  );

  return {
    all: Object.values(counts).reduce((sum, count) => sum + count, 0),
    ...counts,
  };
};
