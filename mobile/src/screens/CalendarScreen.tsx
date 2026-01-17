import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCalendarEvents, CalendarEvent } from '../api/calendar';

export const CalendarScreen: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Seçili tarihe göre başlangıç ve bitiş tarihlerini hesapla
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (viewMode === 'month') {
      // Ayın ilk günü
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      // Ayın son günü
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Haftanın ilk günü (Pazartesi)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      // Haftanın son günü (Pazar)
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const loadEvents = async () => {
    try {
      setError(null);
      const { start, end } = getDateRange();
      const data = await getCalendarEvents(start, end);
      setEvents(data.events);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Takvim verileri yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, viewMode]);

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'maintenance') {
      return '#FFA500';
    }
    // Project status colors
    switch (event.status) {
      case 'ACTIVE':
        return '#00C49F';
      case 'COMPLETED':
        return '#9FB2C8';
      case 'CANCELLED':
        return '#FF6B6B';
      default:
        return '#0066CC';
    }
  };

  const formatDateRange = () => {
    const { start, end } = getDateRange();
    if (viewMode === 'month') {
      return start.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    } else {
      return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    return (
      <View style={styles.eventCard}>
        <View style={[styles.eventIndicator, { backgroundColor: getEventColor(item) }]} />
        <View style={styles.eventContent}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text style={styles.eventType}>
            {item.type === 'project' ? '📅 Proje' : '🔧 Bakım'}
          </Text>
          <Text style={styles.eventDate}>
            {isSameDay
              ? startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
              : `${startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </Text>
          {item.status && (
            <Text style={styles.eventStatus}>Durum: {item.status}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00C49F" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Bugün</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          onPress={() => setViewMode('month')}
          style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
        >
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>Ay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('week')}
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>Hafta</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Display */}
      <Text style={styles.dateRangeText}>{formatDateRange()}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C49F" />}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Bu dönemde etkinlik bulunamadı</Text>
          </View>
        }
        contentContainerStyle={events.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9FB2C8', marginTop: 12 },
  errorText: { color: '#FF6B6B', marginBottom: 12 },
  emptyText: { color: '#9FB2C8', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#00C49F',
  },
  todayButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#00C49F',
  },
  viewModeText: {
    color: '#9FB2C8',
    fontSize: 14,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  dateRangeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 12,
  },
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventType: {
    color: '#9FB2C8',
    fontSize: 12,
    marginBottom: 4,
  },
  eventDate: {
    color: '#CFE0F5',
    fontSize: 13,
    marginBottom: 4,
  },
  eventStatus: {
    color: '#9FB2C8',
    fontSize: 12,
  },
});
