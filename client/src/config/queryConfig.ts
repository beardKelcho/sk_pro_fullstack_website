/**
 * React Query Configuration
 * Cache stratejileri ve default ayarlar
 * 
 * @module config/queryConfig
 * @description React Query için optimize edilmiş cache yapılandırması
 */

/**
 * Query cache key prefix'leri
 * Organize cache key'ler için kullanılır
 */
export const QueryKeys = {
  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    charts: (period: number) => ['dashboard', 'charts', period] as const,
  },
  
  // Equipment
  equipment: {
    all: (filters?: any) => ['equipment', filters] as const,
    detail: (id: string) => ['equipment', id] as const,
    maintenance: (filters?: any) => ['equipment', 'maintenance', filters] as const,
  },
  
  // Projects
  projects: {
    all: (filters?: any) => ['projects', filters] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  
  // Tasks
  tasks: {
    all: (filters?: any) => ['tasks', filters] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
  
  // Users
  users: {
    all: (filters?: any) => ['users', filters] as const,
    detail: (id: string) => ['users', id] as const,
  },
  
  // Customers
  customers: {
    all: (filters?: any) => ['customers', filters] as const,
    detail: (id: string) => ['customers', id] as const,
  },
  
  // Widgets
  widgets: {
    all: ['userWidgets'] as const,
    detail: (id: string) => ['widget', id] as const,
  },
  
  // Monitoring
  monitoring: {
    dashboard: (timeRange: string) => ['monitoring', 'dashboard', timeRange] as const,
    performance: (timeRange: string) => ['monitoring', 'performance', timeRange] as const,
    apiMetrics: (timeRange: string) => ['monitoring', 'api-metrics', timeRange] as const,
    userActivity: (timeRange: string) => ['monitoring', 'user-activity', timeRange] as const,
  },
} as const;

/**
 * Cache time stratejileri (milisaniye cinsinden)
 * Veri türüne göre optimize edilmiş cache süreleri
 */
export const CacheTimes = {
  // Kısa süreli cache (sık değişen veriler)
  SHORT: 1 * 60 * 1000, // 1 dakika
  
  // Orta süreli cache (orta sıklıkta değişen veriler)
  MEDIUM: 5 * 60 * 1000, // 5 dakika
  
  // Uzun süreli cache (seyrek değişen veriler)
  LONG: 15 * 60 * 1000, // 15 dakika
  
  // Çok uzun süreli cache (nadiren değişen veriler)
  VERY_LONG: 30 * 60 * 1000, // 30 dakika
} as const;

/**
 * Stale time stratejileri (milisaniye cinsinden)
 * Veri ne kadar süre "fresh" kalacak
 */
export const StaleTimes = {
  // Anında stale (her zaman yeniden fetch)
  IMMEDIATE: 0,
  
  // Kısa stale time (sık değişen veriler)
  SHORT: 30 * 1000, // 30 saniye
  
  // Orta stale time (orta sıklıkta değişen veriler)
  MEDIUM: 2 * 60 * 1000, // 2 dakika
  
  // Uzun stale time (seyrek değişen veriler)
  LONG: 5 * 60 * 1000, // 5 dakika
  
  // Çok uzun stale time (nadiren değişen veriler)
  VERY_LONG: 10 * 60 * 1000, // 10 dakika
} as const;

/**
 * Refetch interval stratejileri (milisaniye cinsinden)
 * Otomatik yeniden fetch sıklığı
 */
export const RefetchIntervals = {
  // Anında refetch (real-time veriler)
  REALTIME: 5 * 1000, // 5 saniye
  
  // Kısa interval (sık güncellenen veriler)
  SHORT: 30 * 1000, // 30 saniye
  
  // Orta interval (orta sıklıkta güncellenen veriler)
  MEDIUM: 2 * 60 * 1000, // 2 dakika
  
  // Uzun interval (seyrek güncellenen veriler)
  LONG: 5 * 60 * 1000, // 5 dakika
  
  // Çok uzun interval (nadiren güncellenen veriler)
  VERY_LONG: 10 * 60 * 1000, // 10 dakika
  
  // Refetch yok (manuel refresh)
  NONE: false,
} as const;

/**
 * Veri türüne göre cache stratejisi
 * Her veri türü için optimize edilmiş ayarlar
 */
export const CacheStrategies = {
  // Dashboard verileri (orta sıklıkta güncellenir)
  dashboard: {
    staleTime: StaleTimes.MEDIUM,
    gcTime: CacheTimes.MEDIUM,
    refetchInterval: RefetchIntervals.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  
  // Ekipman verileri (seyrek değişir)
  equipment: {
    staleTime: StaleTimes.LONG,
    gcTime: CacheTimes.LONG,
    refetchInterval: RefetchIntervals.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  
  // Proje verileri (orta sıklıkta değişir)
  projects: {
    staleTime: StaleTimes.MEDIUM,
    gcTime: CacheTimes.MEDIUM,
    refetchInterval: RefetchIntervals.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  
  // Görev verileri (sık değişir)
  tasks: {
    staleTime: StaleTimes.SHORT,
    gcTime: CacheTimes.SHORT,
    refetchInterval: RefetchIntervals.SHORT,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  
  // Kullanıcı verileri (seyrek değişir)
  users: {
    staleTime: StaleTimes.LONG,
    gcTime: CacheTimes.LONG,
    refetchInterval: RefetchIntervals.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  
  // Müşteri verileri (seyrek değişir)
  customers: {
    staleTime: StaleTimes.LONG,
    gcTime: CacheTimes.LONG,
    refetchInterval: RefetchIntervals.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  
  // Widget verileri (orta sıklıkta değişir)
  widgets: {
    staleTime: StaleTimes.MEDIUM,
    gcTime: CacheTimes.MEDIUM,
    refetchInterval: RefetchIntervals.NONE,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  
  // Monitoring verileri (sık güncellenir)
  monitoring: {
    staleTime: StaleTimes.SHORT,
    gcTime: CacheTimes.SHORT,
    refetchInterval: RefetchIntervals.SHORT,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  
  // Site içerik verileri (nadiren değişir)
  siteContent: {
    staleTime: StaleTimes.VERY_LONG,
    gcTime: CacheTimes.VERY_LONG,
    refetchInterval: RefetchIntervals.VERY_LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  
  // Site görselleri (nadiren değişir)
  siteImages: {
    staleTime: StaleTimes.VERY_LONG,
    gcTime: CacheTimes.VERY_LONG,
    refetchInterval: RefetchIntervals.NONE,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  
  // Bakım verileri (orta sıklıkta değişir)
  maintenance: {
    staleTime: StaleTimes.MEDIUM,
    gcTime: CacheTimes.MEDIUM,
    refetchInterval: RefetchIntervals.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
} as const;

/**
 * Cache invalidation stratejileri
 * Mutation sonrası hangi query'lerin invalidate edileceği
 */
export const InvalidationStrategies = {
  // Ekipman güncellemesi sonrası
  equipment: {
    onUpdate: (id: string) => [
      QueryKeys.equipment.all(),
      QueryKeys.equipment.detail(id),
      QueryKeys.dashboard.stats,
    ],
    onDelete: () => [
      QueryKeys.equipment.all(),
      QueryKeys.dashboard.stats,
    ],
    onCreate: () => [
      QueryKeys.equipment.all(),
      QueryKeys.dashboard.stats,
    ],
  },
  
  // Proje güncellemesi sonrası
  projects: {
    onUpdate: (id: string) => [
      QueryKeys.projects.all(),
      QueryKeys.projects.detail(id),
      QueryKeys.dashboard.stats,
    ],
    onDelete: () => [
      QueryKeys.projects.all(),
      QueryKeys.dashboard.stats,
    ],
    onCreate: () => [
      QueryKeys.projects.all(),
      QueryKeys.dashboard.stats,
    ],
  },
  
  // Görev güncellemesi sonrası
  tasks: {
    onUpdate: (id: string) => [
      QueryKeys.tasks.all(),
      QueryKeys.tasks.detail(id),
      QueryKeys.dashboard.stats,
    ],
    onDelete: () => [
      QueryKeys.tasks.all(),
      QueryKeys.dashboard.stats,
    ],
    onCreate: () => [
      QueryKeys.tasks.all(),
      QueryKeys.dashboard.stats,
    ],
  },
  
  // Kullanıcı güncellemesi sonrası
  users: {
    onUpdate: (id: string) => [
      QueryKeys.users.all(),
      QueryKeys.users.detail(id),
    ],
    onDelete: () => [
      QueryKeys.users.all(),
    ],
    onCreate: () => [
      QueryKeys.users.all(),
    ],
  },
  
  // Widget güncellemesi sonrası
  widgets: {
    onUpdate: (id: string) => [
      QueryKeys.widgets.all,
      QueryKeys.widgets.detail(id),
    ],
    onDelete: () => [
      QueryKeys.widgets.all,
    ],
    onCreate: () => [
      QueryKeys.widgets.all,
    ],
  },
} as const;

/**
 * Optimistic update helper fonksiyonları
 * UI'ı hemen güncellemek için kullanılır
 */
export const OptimisticUpdates = {
  /**
   * Ekipman için optimistic update
   */
  equipment: {
    update: (queryClient: any, id: string, updates: any) => {
      // Mevcut veriyi al
      const previousData = queryClient.getQueryData(QueryKeys.equipment.detail(id));
      
      // Optimistic update yap
      if (previousData) {
        queryClient.setQueryData(QueryKeys.equipment.detail(id), {
          ...previousData,
          ...updates,
        });
      }
      
      // List query'yi de güncelle
      queryClient.setQueriesData(
        { queryKey: QueryKeys.equipment.all() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            equipment: old.equipment?.map((item: any) =>
              (item._id === id || item.id === id) ? { ...item, ...updates } : item
            ),
          };
        }
      );
    },
  },
  
  /**
   * Proje için optimistic update
   */
  projects: {
    update: (queryClient: any, id: string, updates: any) => {
      const previousData = queryClient.getQueryData(QueryKeys.projects.detail(id));
      
      if (previousData) {
        queryClient.setQueryData(QueryKeys.projects.detail(id), {
          ...previousData,
          ...updates,
        });
      }
      
      queryClient.setQueriesData(
        { queryKey: QueryKeys.projects.all() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            projects: old.projects?.map((item: any) =>
              (item._id === id || item.id === id) ? { ...item, ...updates } : item
            ),
          };
        }
      );
    },
  },
  
  /**
   * Görev için optimistic update
   */
  tasks: {
    update: (queryClient: any, id: string, updates: any) => {
      const previousData = queryClient.getQueryData(QueryKeys.tasks.detail(id));
      
      if (previousData) {
        queryClient.setQueryData(QueryKeys.tasks.detail(id), {
          ...previousData,
          ...updates,
        });
      }
      
      queryClient.setQueriesData(
        { queryKey: QueryKeys.tasks.all() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks?.map((item: any) =>
              (item._id === id || item.id === id) ? { ...item, ...updates } : item
            ),
          };
        }
      );
    },
  },
} as const;
