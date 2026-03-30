import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const refreshMock = jest.fn();

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent() {
    return <div data-testid="dynamic-widget" />;
  };
});

jest.mock('@/hooks/useDashboard', () => ({
  useDashboard: jest.fn(),
}));

jest.mock('@/components/admin/widgets/StatCardWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="stat-card-widget" />,
}));

const { useDashboard } = jest.requireMock('@/hooks/useDashboard') as {
  useDashboard: jest.Mock;
};

describe('Admin dashboard page', () => {
  beforeEach(() => {
    refreshMock.mockClear();
  });

  it('shows a retry action when the API is unavailable', async () => {
    useDashboard.mockReturnValue({
      stats: {
        equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        tasks: { total: 0, open: 0, completed: 0 },
        clients: { total: 0, active: 0 },
      },
      chartData: null,
      chartsLoading: false,
      recentProjects: [],
      upcomingMaintenances: [],
      loading: false,
      apiAvailable: false,
      refresh: refreshMock,
    });

    const DashboardPage = (await import('@/app/admin/dashboard/page')).default;
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Yeniden Dene' }));
    expect(refreshMock).toHaveBeenCalled();
  });

  it('renders localized project statuses instead of raw enums', async () => {
    useDashboard.mockReturnValue({
      stats: {
        equipment: { total: 0, available: 0, inUse: 0, maintenance: 0 },
        projects: { total: 1, active: 1, completed: 0 },
        tasks: { total: 0, open: 0, completed: 0 },
        clients: { total: 0, active: 0 },
      },
      chartData: null,
      chartsLoading: true,
      recentProjects: [
        {
          _id: 'p1',
          name: 'Festival Setup',
          startDate: '2026-03-01T00:00:00.000Z',
          status: 'PENDING_APPROVAL',
          client: { name: 'Acme' },
        },
      ],
      upcomingMaintenances: [],
      loading: false,
      apiAvailable: true,
      refresh: refreshMock,
    });

    const DashboardPage = (await import('@/app/admin/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText('Onay Bekleyen')).toBeInTheDocument();
    expect(screen.queryByText('PENDING_APPROVAL')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('dashboard-chart-skeleton')).toHaveLength(4);
  });
});
