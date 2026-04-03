import type { InventoryItem } from '@/services/inventoryService';
import type { Project } from '@/services/projectService';

export type ReportProjectScope = 'all' | 'active' | 'upcoming' | 'past';

export type ReportSummaryCard = {
  key: string;
  label: string;
  value: string;
  description: string;
};

type ProjectStatusLabel =
  | 'Onay Bekleyen'
  | 'Onaylanan'
  | 'Devam Ediyor'
  | 'Tamamlandı'
  | 'Ertelendi'
  | 'İptal Edildi';

const PROJECT_STATUS_LABELS: Record<NonNullable<Project['status']>, ProjectStatusLabel> = {
  PLANNING: 'Onay Bekleyen',
  PENDING_APPROVAL: 'Onay Bekleyen',
  APPROVED: 'Onaylanan',
  ACTIVE: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  ON_HOLD: 'Ertelendi',
  CANCELLED: 'İptal Edildi',
};

const INVENTORY_STATUS_LABELS: Record<NonNullable<InventoryItem['status']>, string> = {
  AVAILABLE: 'Musait',
  IN_USE: 'Kullanimda',
  MAINTENANCE: 'Bakimda',
  RETIRED: 'Emekli',
  MISSING: 'Kayip',
};

const getDayStart = (value: Date) => {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getDayEnd = (value: Date) => {
  const copy = new Date(value);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

export const getProjectScopeLabel = (scope: ReportProjectScope) => {
  switch (scope) {
    case 'active':
      return 'Aktif';
    case 'upcoming':
      return 'Yaklasan';
    case 'past':
      return 'Gecmis';
    case 'all':
    default:
      return 'Tum Projeler';
  }
};

export const filterProjectsByScope = (
  projects: Project[],
  scope: ReportProjectScope,
  referenceDate = new Date()
) => {
  if (scope === 'all') {
    return projects;
  }

  const dayStart = getDayStart(referenceDate);
  const dayEnd = getDayEnd(referenceDate);

  return projects.filter((project) => {
    const startDate = project.startDate ? new Date(project.startDate) : null;
    const endDate = project.endDate ? new Date(project.endDate) : null;

    if (scope === 'upcoming') {
      return Boolean(startDate && startDate > dayEnd);
    }

    if (scope === 'past') {
      return Boolean(endDate && endDate < dayStart);
    }

    return Boolean(startDate && startDate <= dayEnd && (!endDate || endDate >= dayStart));
  });
};

export const buildInventoryStatusStats = (items: InventoryItem[]) => {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.status || 'AVAILABLE';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([key, value]) => ({
    key,
    name: INVENTORY_STATUS_LABELS[key as InventoryItem['status']] || key,
    value,
  }));
};

export const buildProjectStatusStats = (projects: Project[]) => {
  const counts = projects.reduce<Record<string, number>>((acc, project) => {
    const key = project.status || 'PENDING_APPROVAL';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([key, value]) => ({
    key,
    name: PROJECT_STATUS_LABELS[key as Project['status']] || key,
    toplam: value,
  }));
};

export const buildReportSummaryCards = (
  inventoryItems: InventoryItem[],
  scopedProjects: Project[],
  scope: ReportProjectScope
): ReportSummaryCard[] => {
  const availableCount = inventoryItems.filter((item) => item.status === 'AVAILABLE').length;
  const maintenanceCount = inventoryItems.filter((item) => item.status === 'MAINTENANCE').length;
  const completedProjects = scopedProjects.filter((project) => project.status === 'COMPLETED').length;
  const totalBudget = scopedProjects.reduce((sum, project) => sum + (project.budget || 0), 0);

  return [
    {
      key: 'inventory-total',
      label: 'Toplam Envanter Kaydi',
      value: `${inventoryItems.length}`,
      description: 'Sistemde izlenen ekipman karti sayisi',
    },
    {
      key: 'inventory-available',
      label: 'Musait Ekipman',
      value: `${availableCount}`,
      description: maintenanceCount > 0 ? `${maintenanceCount} kayit su an bakimda` : 'Bakim bekleyen ekipman yok',
    },
    {
      key: 'projects-scoped',
      label: `${getProjectScopeLabel(scope)} Adedi`,
      value: `${scopedProjects.length}`,
      description: 'Secili kapsam icindeki proje sayisi',
    },
    {
      key: 'projects-budget',
      label: 'Toplam Butce',
      value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalBudget),
      description: completedProjects > 0 ? `${completedProjects} proje tamamlanmis durumda` : 'Tamamlanan proje bulunmuyor',
    },
  ];
};
