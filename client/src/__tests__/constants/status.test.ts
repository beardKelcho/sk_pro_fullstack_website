import { getStatusName } from '@/constants/status';

describe('status helpers', () => {
  it('maps known project statuses to user-friendly labels', () => {
    expect(getStatusName('project', 'PENDING_APPROVAL')).toBe('Onay Bekleyen');
    expect(getStatusName('project', 'COMPLETED')).toBe('Tamamlandı');
  });

  it('falls back to the original value when mapping is missing', () => {
    expect(getStatusName('project', 'UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
  });

  it('returns a placeholder for empty values', () => {
    expect(getStatusName('task', '')).toBe('-');
  });
});
