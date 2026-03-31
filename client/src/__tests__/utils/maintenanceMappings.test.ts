import apiClient from '@/services/api/axios';
import {
  getAllMaintenance,
  mapBackendMaintenancePriorityToFrontend,
  mapBackendMaintenanceStatusToFrontend,
  mapBackendMaintenanceTypeToFrontend,
  mapFrontendMaintenancePriorityToBackend,
  mapFrontendMaintenanceStatusToBackend,
  mapFrontendMaintenanceTypeToBackend,
} from '@/services/maintenanceService';

jest.mock('@/services/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('maintenance service mappings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends maintenance filters including priority and search', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: { maintenances: [], total: 0, page: 1, totalPages: 0 },
    });

    await getAllMaintenance({
      status: 'SCHEDULED',
      type: 'ROUTINE',
      priority: 'HIGH',
      search: 'kamera',
      page: 2,
      limit: 25,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/maintenance', {
      params: {
        status: 'SCHEDULED',
        type: 'ROUTINE',
        priority: 'HIGH',
        search: 'kamera',
        page: 2,
        limit: 25,
      },
    });
  });

  it('maps maintenance values between backend and frontend labels', () => {
    expect(mapBackendMaintenanceTypeToFrontend('ROUTINE')).toBe('Periyodik Bakım');
    expect(mapBackendMaintenanceStatusToFrontend('IN_PROGRESS')).toBe('Devam Ediyor');
    expect(mapBackendMaintenancePriorityToFrontend('URGENT')).toBe('Acil');

    expect(mapFrontendMaintenanceTypeToBackend('Kalibrasyon')).toBe('INSPECTION');
    expect(mapFrontendMaintenanceTypeToBackend('Periyodik')).toBe('ROUTINE');
    expect(mapFrontendMaintenanceStatusToBackend('Tamamlandı')).toBe('COMPLETED');
    expect(mapFrontendMaintenancePriorityToBackend('Yüksek')).toBe('HIGH');
  });

  it('keeps safe defaults for optional maintenance priority values', () => {
    expect(mapBackendMaintenancePriorityToFrontend(undefined)).toBe('Orta');
    expect(mapFrontendMaintenancePriorityToBackend('Bilinmiyor')).toBeUndefined();
  });
});
