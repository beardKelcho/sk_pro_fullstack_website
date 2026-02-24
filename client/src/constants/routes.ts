export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  CONTACT: '/contact',
  ADMIN: {
    DASHBOARD: '/admin',
    LOGIN: '/admin/login',
    PROJECTS: {
      LIST: '/admin/projects',
      ADD: '/admin/projects/add',
      EDIT: (id: string) => `/admin/projects/edit?id=${id}`,
      VIEW: (id: string) => `/admin/projects/view?id=${id}`,
    },
    CLIENTS: {
      LIST: '/admin/clients',
      ADD: '/admin/clients/add',
      EDIT: (id: string) => `/admin/clients/edit?id=${id}`,
      VIEW: (id: string) => `/admin/clients/view?id=${id}`,
    },
    TASKS: {
      LIST: '/admin/tasks',
      ADD: '/admin/tasks/add',
      EDIT: (id: string) => `/admin/tasks/edit?id=${id}`,
      VIEW: (id: string) => `/admin/tasks/view?id=${id}`,
    },
    EQUIPMENT: {
      LIST: '/admin/inventory',
      ADD: '/admin/inventory', // Modal based
      EDIT: (id: string) => `/admin/inventory/view?id=${id}`, // Or trigger modal
      VIEW: (id: string) => `/admin/inventory/view?id=${id}`,
    },
    CALENDAR: '/admin/calendar',
    SETTINGS: '/admin/settings',
  },
} as const; 