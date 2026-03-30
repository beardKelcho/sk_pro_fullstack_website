import { ROUTES } from '@/constants/routes';

describe('ROUTES', () => {
  it('should expose stable top-level public routes', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.SERVICES).toBe('/services');
    expect(ROUTES.CONTACT).toBe('/contact');
  });

  it('should expose admin routes', () => {
    expect(ROUTES.ADMIN.DASHBOARD).toBe('/admin');
    expect(ROUTES.ADMIN.LOGIN).toBe('/admin/login');
    expect(ROUTES.ADMIN.CALENDAR).toBe('/admin/calendar');
    expect(ROUTES.ADMIN.SETTINGS).toBe('/admin/settings');
  });

  it('should generate admin detail routes from ids', () => {
    expect(ROUTES.ADMIN.PROJECTS.EDIT('42')).toBe('/admin/projects/edit?id=42');
    expect(ROUTES.ADMIN.PROJECTS.VIEW('42')).toBe('/admin/projects/view?id=42');
    expect(ROUTES.ADMIN.CLIENTS.EDIT('24')).toBe('/admin/clients/edit?id=24');
    expect(ROUTES.ADMIN.CLIENTS.VIEW('24')).toBe('/admin/clients/view?id=24');
    expect(ROUTES.ADMIN.TASKS.EDIT('12')).toBe('/admin/tasks/edit?id=12');
    expect(ROUTES.ADMIN.TASKS.VIEW('12')).toBe('/admin/tasks/view?id=12');
    expect(ROUTES.ADMIN.EQUIPMENT.EDIT('7')).toBe('/admin/inventory/view?id=7');
    expect(ROUTES.ADMIN.EQUIPMENT.VIEW('7')).toBe('/admin/inventory/view?id=7');
  });
});
