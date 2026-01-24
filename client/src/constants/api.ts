export const API_ENDPOINTS = {
    PROJECTS: {
        BASE: '/projects',
        BY_ID: (id: string) => `/projects/${id}`,
        TASKS: (id: string) => `/projects/${id}/tasks`,
        TEAM: (id: string) => `/projects/${id}/team`,
        EQUIPMENT: (id: string) => `/projects/${id}/equipment`,
    },
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
        CHARTS: '/dashboard/charts',
    },
    EXPORT: {
        PROJECTS: '/api/export/projects',
    }
} as const;
