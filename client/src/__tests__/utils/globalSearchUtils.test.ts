import type { SearchResponse } from '@/services/searchService';
import { buildSearchTypeCounts, filterSearchResponse } from '@/utils/globalSearchUtils';

const mockResponse: SearchResponse = {
  success: true,
  query: 'test',
  total: 4,
  results: {
    equipment: [{ type: 'equipment', id: 'eq-1', title: 'LED Wall' }],
    projects: [{ type: 'project', id: 'pr-1', title: 'Festival' }],
    tasks: [{ type: 'task', id: 'ts-1', title: 'Kurulum' }],
    clients: [],
    users: [{ type: 'user', id: 'us-1', title: 'Ahmet Yilmaz' }],
    maintenance: [],
  },
  all: [],
};

describe('globalSearchUtils', () => {
  it('tum sonuclari filtre yokken korur', () => {
    const result = filterSearchResponse(mockResponse, 'all');

    expect(result.total).toBe(4);
    expect(result.groupedResults).toHaveLength(4);
    expect(result.allResults.map((item) => item.type)).toEqual(['equipment', 'project', 'task', 'user']);
  });

  it('tek bir tipe gore sonuclari filtreler', () => {
    const result = filterSearchResponse(mockResponse, 'project');

    expect(result.total).toBe(1);
    expect(result.groupedResults).toHaveLength(1);
    expect(result.groupedResults[0].type).toBe('project');
    expect(result.allResults[0].title).toBe('Festival');
  });

  it('tip sayaclarini dogru hesaplar', () => {
    const counts = buildSearchTypeCounts(mockResponse);

    expect(counts.all).toBe(4);
    expect(counts.equipment).toBe(1);
    expect(counts.project).toBe(1);
    expect(counts.task).toBe(1);
    expect(counts.user).toBe(1);
    expect(counts.client).toBe(0);
  });
});
