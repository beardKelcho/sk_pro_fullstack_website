import http from './http';

export interface CalendarEvent {
  id: string;
  type: 'project' | 'maintenance';
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface CalendarEventsResponse {
  success: boolean;
  range: {
    startDate: string;
    endDate: string;
  };
  counts: {
    projects: number;
    maintenances: number;
    events: number;
  };
  events: CalendarEvent[];
}

/**
 * Takvim etkinliklerini getir
 */
export const getCalendarEvents = async (
  startDate: Date,
  endDate: Date,
  statuses?: string[]
): Promise<CalendarEventsResponse> => {
  const params: any = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
  if (statuses && statuses.length > 0) {
    params.status = statuses.join(',');
  }
  const response = await http.get<CalendarEventsResponse>('/calendar/events', { params });
  return response.data;
};
