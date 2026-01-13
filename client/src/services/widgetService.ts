/**
 * Widget Service
 * Dashboard widget'larını yönetir (CRUD işlemleri)
 * 
 * @module services/widgetService
 * @description Kullanıcı widget'larını API üzerinden yönetir ve React Query ile cache'ler
 */

import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CacheStrategies, QueryKeys, InvalidationStrategies } from '@/config/queryConfig';

/**
 * Widget interface'i
 * @interface Widget
 */
export interface Widget {
  _id?: string;
  userId: string;
  type: 'STAT_CARD' | 'PIE_CHART' | 'DONUT_CHART' | 'LINE_CHART' | 'BAR_CHART' | 'TABLE' | 'LIST' | 'CUSTOM';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings: {
    [key: string]: any;
  };
  isVisible: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WidgetResponse {
  success: boolean;
  widgets?: Widget[];
  widget?: Widget;
  message?: string;
}

/**
 * Kullanıcının widget'larını API'den çeker
 * 
 * @returns Kullanıcının widget listesi
 * @throws {Error} API hatası durumunda
 * 
 * @example
 * ```typescript
 * const widgets = await getUserWidgets();
 * widgets.forEach(widget => console.log(widget.type));
 * ```
 */
export const getUserWidgets = async (): Promise<Widget[]> => {
  try {
    const response = await apiClient.get<WidgetResponse>('/widgets');
    return response.data.widgets || [];
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Widget\'lar getirme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget\'lar getirilemedi');
  }
};

/**
 * ID'ye göre tek bir widget getirir
 * 
 * @param id - Widget ID
 * @returns Widget objesi
 * @throws {Error} Widget bulunamazsa veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * const widget = await getWidgetById('widget123');
 * console.log(widget.title);
 * ```
 */
export const getWidgetById = async (id: string): Promise<Widget> => {
  try {
    const response = await apiClient.get<WidgetResponse>(`/widgets/${id}`);
    if (!response.data.widget) {
      throw new Error('Widget bulunamadı');
    }
    return response.data.widget;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Widget getirme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget getirilemedi');
  }
};

/**
 * Yeni widget oluşturur
 * 
 * @param widget - Oluşturulacak widget verileri
 * @returns Oluşturulan widget objesi
 * @throws {Error} Widget oluşturulamazsa veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * const newWidget = await createWidget({
 *   type: 'STAT_CARD',
 *   position: { x: 0, y: 0, w: 4, h: 2 }
 * });
 * ```
 */
export const createWidget = async (widget: Partial<Widget>): Promise<Widget> => {
  try {
    const response = await apiClient.post<WidgetResponse>('/widgets', widget);
    if (!response.data.widget) {
      throw new Error('Widget oluşturulamadı');
    }
    return response.data.widget;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Widget oluşturma hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget oluşturulamadı');
  }
};

/**
 * Mevcut widget'ı günceller
 * 
 * @param id - Güncellenecek widget ID
 * @param updates - Güncellenecek widget özellikleri
 * @returns Güncellenmiş widget objesi
 * @throws {Error} Widget güncellenemezse veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * const updated = await updateWidget('widget123', { isVisible: false });
 * ```
 */
export const updateWidget = async (id: string, updates: Partial<Widget>): Promise<Widget> => {
  try {
    const response = await apiClient.put<WidgetResponse>(`/widgets/${id}`, updates);
    if (!response.data.widget) {
      throw new Error('Widget güncellenemedi');
    }
    return response.data.widget;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Widget güncelleme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget güncellenemedi');
  }
};

/**
 * Widget'ı siler
 * 
 * @param id - Silinecek widget ID
 * @throws {Error} Widget silinemezse veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * await deleteWidget('widget123');
 * ```
 */
export const deleteWidget = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/widgets/${id}`);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Widget silme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget silinemedi');
  }
};

/**
 * Birden fazla widget'ı toplu olarak günceller
 * Genellikle drag & drop sonrası pozisyon güncellemeleri için kullanılır
 * 
 * @param widgets - Güncellenecek widget listesi (id, position, order, isVisible)
 * @throws {Error} Güncelleme başarısız olursa veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * await updateWidgetsBulk([
 *   { id: 'widget1', position: { x: 0, y: 0, w: 4, h: 2 }, order: 0 },
 *   { id: 'widget2', position: { x: 4, y: 0, w: 4, h: 2 }, order: 1 }
 * ]);
 * ```
 */
export const updateWidgetsBulk = async (widgets: Array<{ id: string; position?: any; order?: number; isVisible?: boolean }>): Promise<void> => {
  try {
    await apiClient.put('/widgets/bulk', { widgets });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Toplu widget güncelleme hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Widget\'lar güncellenemedi');
  }
};

/**
 * Kullanıcı için varsayılan widget'ları oluşturur
 * İlk kez dashboard'a giren kullanıcılar için otomatik widget seti
 * 
 * @returns Oluşturulan varsayılan widget listesi
 * @throws {Error} Widget'lar oluşturulamazsa veya API hatası durumunda
 * 
 * @example
 * ```typescript
 * const defaultWidgets = await createDefaultWidgets();
 * console.log(`Created ${defaultWidgets.length} default widgets`);
 * ```
 */
export const createDefaultWidgets = async (): Promise<Widget[]> => {
  try {
    const response = await apiClient.post<WidgetResponse>('/widgets/defaults');
    return response.data.widgets || [];
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Varsayılan widget oluşturma hatası:', error);
    }
    throw new Error(error.response?.data?.message || 'Varsayılan widget\'lar oluşturulamadı');
  }
};

// React Query Hooks
/**
 * Kullanıcının widget'larını React Query ile çeken hook.
 * @returns useQuery hook'unun döndürdüğü değerler.
 */
export const useUserWidgets = () => {
  return useQuery<Widget[], Error>({
    queryKey: QueryKeys.widgets.all,
    queryFn: getUserWidgets,
    ...CacheStrategies.widgets,
  });
};

export const useWidgetById = (id: string | null) => {
  return useQuery({
    queryKey: ['widget', id],
    queryFn: () => getWidgetById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Yeni bir widget oluşturmak için React Query mutation hook'u.
 * Başarılı olursa 'userWidgets' cache'ini geçersiz kılar.
 * @returns useMutation hook'unun döndürdüğü değerler.
 */
export const useCreateWidget = () => {
  const queryClient = useQueryClient();

  return useMutation<Widget, Error, Partial<Widget>>({
    mutationFn: createWidget,
    onSuccess: () => {
      // Cache invalidation stratejisi kullan
      InvalidationStrategies.widgets.onCreate().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Mevcut bir widget'ı güncellemek için React Query mutation hook'u.
 * Başarılı olursa 'userWidgets' ve ilgili 'widget' cache'lerini geçersiz kılar.
 * @returns useMutation hook'unun döndürdüğü değerler.
 */
export const useUpdateWidget = () => {
  const queryClient = useQueryClient();

  return useMutation<Widget, Error, { id: string; updates: Partial<Widget> }>({
    mutationFn: ({ id, updates }) => updateWidget(id, updates),
    onSuccess: (_, variables) => {
      // Cache invalidation stratejisi kullan
      InvalidationStrategies.widgets.onUpdate(variables.id).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Bir widget'ı silmek için React Query mutation hook'u.
 * Başarılı olursa 'userWidgets' cache'ini geçersiz kılar.
 * @returns useMutation hook'unun döndürdüğü değerler.
 */
export const useDeleteWidget = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteWidget,
    onSuccess: () => {
      // Cache invalidation stratejisi kullan
      InvalidationStrategies.widgets.onDelete().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Birden fazla widget'ı toplu olarak güncellemek için React Query mutation hook'u.
 * Başarılı olursa 'userWidgets' cache'ini geçersiz kılar.
 * @returns useMutation hook'unun döndürdüğü değerler.
 */
export const useUpdateWidgetsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Array<{ id: string; position?: any; order?: number; isVisible?: boolean }>>({
    mutationFn: updateWidgetsBulk,
    onSuccess: () => {
      // Cache invalidation stratejisi kullan
      InvalidationStrategies.widgets.onCreate().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

/**
 * Varsayılan widget'ları oluşturmak için React Query mutation hook'u.
 * Başarılı olursa 'userWidgets' cache'ini geçersiz kılar.
 * @returns useMutation hook'unun döndürdüğü değerler.
 */
export const useCreateDefaultWidgets = () => {
  const queryClient = useQueryClient();

  return useMutation<Widget[], Error, void>({
    mutationFn: createDefaultWidgets,
    onSuccess: () => {
      // Cache invalidation stratejisi kullan
      InvalidationStrategies.widgets.onCreate().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

