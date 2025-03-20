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
      EDIT: (id: string) => `/admin/projects/edit/${id}`,
      VIEW: (id: string) => `/admin/projects/view/${id}`,
    },
    CLIENTS: {
      LIST: '/admin/clients',
      ADD: '/admin/clients/add',
      EDIT: (id: string) => `/admin/clients/edit/${id}`,
      VIEW: (id: string) => `/admin/clients/view/${id}`,
    },
    TASKS: {
      LIST: '/admin/tasks',
      ADD: '/admin/tasks/add',
      EDIT: (id: string) => `/admin/tasks/edit/${id}`,
      VIEW: (id: string) => `/admin/tasks/view/${id}`,
    },
    EQUIPMENT: {
      LIST: '/admin/equipment',
      ADD: '/admin/equipment/add',
      EDIT: (id: string) => `/admin/equipment/edit/${id}`,
      VIEW: (id: string) => `/admin/equipment/view/${id}`,
    },
    CALENDAR: '/admin/calendar',
    SETTINGS: '/admin/settings',
  },
} as const; 