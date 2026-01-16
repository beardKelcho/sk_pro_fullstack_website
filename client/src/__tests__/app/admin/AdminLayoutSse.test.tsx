import React from 'react';
import { render, act } from '@testing-library/react';

const invalidateQueriesMock = jest.fn().mockResolvedValue(undefined);

let capturedOnEvent: ((evt: { event: string; data: any }) => void) | null = null;

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter' }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/monitoring',
}));

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => true,
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
  },
}));

jest.mock('@/utils/sseClient', () => ({
  connectSse: (opts: any) => {
    capturedOnEvent = opts?.onEvent ?? null;
    return () => undefined;
  },
}));

// Layout bağımlılıklarını “noop” hale getiriyoruz (test odak: SSE handler)
jest.mock('@/components/admin/AdminSidebar', () => ({
  __esModule: true,
  default: () => <aside data-testid="sidebar" />,
}));

jest.mock('@/components/admin/AdminHeader', () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

jest.mock('@/components/admin/GlobalSearch', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/admin/Breadcrumb', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/common/OfflineIndicator', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/common/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/admin/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AdminLayout SSE', () => {
  beforeEach(() => {
    capturedOnEvent = null;
    invalidateQueriesMock.mockClear();
    localStorage.setItem('accessToken', 'test-token');
  });

  afterEach(() => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  });

  it('monitoring:update gelince monitoring query cache invalidate eder', async () => {
    const AdminLayout = (await import('@/app/admin/layout')).default;

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>
    );

    // Effect connectSse ile onEvent register eder
    expect(typeof capturedOnEvent).toBe('function');

    await act(async () => {
      capturedOnEvent?.({ event: 'monitoring:update', data: { ts: Date.now() } });
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['monitoring'], exact: false });
  });
});

