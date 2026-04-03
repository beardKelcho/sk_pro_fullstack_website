import type { InventoryItem } from '@/services/inventoryService';
import type { Project } from '@/services/projectService';
import {
  buildInventoryStatusStats,
  buildProjectStatusStats,
  buildReportSummaryCards,
  filterProjectsByScope,
} from '@/utils/reportInsights';

const inventoryItems = [
  { _id: '1', name: 'A', category: 'video', location: 'depo', trackingType: 'SERIALIZED', quantity: 1, status: 'AVAILABLE', criticalStockLevel: 1, createdAt: '', updatedAt: '' },
  { _id: '2', name: 'B', category: 'video', location: 'depo', trackingType: 'SERIALIZED', quantity: 1, status: 'MAINTENANCE', criticalStockLevel: 1, createdAt: '', updatedAt: '' },
  { _id: '3', name: 'C', category: 'video', location: 'depo', trackingType: 'SERIALIZED', quantity: 1, status: 'AVAILABLE', criticalStockLevel: 1, createdAt: '', updatedAt: '' },
] satisfies InventoryItem[];

const projects = [
  { name: 'Aktif Proje', startDate: '2026-04-02', endDate: '2026-04-04', status: 'ACTIVE', client: '1' },
  { name: 'Yaklasan Proje', startDate: '2026-04-10', endDate: '2026-04-12', status: 'APPROVED', client: '1', budget: 100000 },
  { name: 'Gecmis Proje', startDate: '2026-03-20', endDate: '2026-03-22', status: 'COMPLETED', client: '1', budget: 50000 },
] satisfies Project[];

describe('reportInsights', () => {
  it('envanter durum istatistiklerini toplar', () => {
    const stats = buildInventoryStatusStats(inventoryItems);

    expect(stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'AVAILABLE', value: 2 }),
        expect.objectContaining({ key: 'MAINTENANCE', value: 1 }),
      ])
    );
  });

  it('projeleri kapsama gore filtreler', () => {
    const referenceDate = new Date('2026-04-03T10:00:00Z');

    expect(filterProjectsByScope(projects, 'upcoming', referenceDate)).toHaveLength(1);
    expect(filterProjectsByScope(projects, 'active', referenceDate)).toHaveLength(1);
    expect(filterProjectsByScope(projects, 'past', referenceDate)).toHaveLength(1);
  });

  it('proje durum istatistiklerini kullanici dostu etiketlerle olusturur', () => {
    const stats = buildProjectStatusStats(projects);

    expect(stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Devam Ediyor', toplam: 1 }),
        expect.objectContaining({ name: 'Onaylanan', toplam: 1 }),
        expect.objectContaining({ name: 'Tamamlandı', toplam: 1 }),
      ])
    );
  });

  it('ozet kartlarini secili kapsama gore hesaplar', () => {
    const cards = buildReportSummaryCards(inventoryItems, projects, 'all');

    expect(cards).toHaveLength(4);
    expect(cards[0]).toEqual(expect.objectContaining({ value: '3' }));
    expect(cards[1]).toEqual(expect.objectContaining({ value: '2' }));
  });
});
