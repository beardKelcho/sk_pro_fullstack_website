import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../auth/AuthContext';
import { getDashboardStats, DashboardStatsResponse } from '../api/dashboard';

export const DashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00C49F" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton label="Yeniden Dene" onPress={loadStats} style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C49F" />}
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Hoş geldin {user?.name || '—'}</Text>

      {stats && (
        <>
          {/* Ekipman İstatistikleri */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ekipmanlar</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.stats.equipment.total}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#00C49F' }]}>{stats.stats.equipment.available}</Text>
                <Text style={styles.statLabel}>Müsait</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#0066CC' }]}>{stats.stats.equipment.inUse}</Text>
                <Text style={styles.statLabel}>Kullanımda</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.stats.equipment.maintenance}</Text>
                <Text style={styles.statLabel}>Bakımda</Text>
              </View>
            </View>
          </View>

          {/* Proje İstatistikleri */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Projeler</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.stats.projects.total}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#00C49F' }]}>{stats.stats.projects.active}</Text>
                <Text style={styles.statLabel}>Aktif</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#9FB2C8' }]}>{stats.stats.projects.completed}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
            </View>
          </View>

          {/* Görev İstatistikleri */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Görevler</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.stats.tasks.total}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.stats.tasks.open}</Text>
                <Text style={styles.statLabel}>Açık</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#00C49F' }]}>{stats.stats.tasks.completed}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
            </View>
          </View>

          {/* Yaklaşan Bakımlar */}
          {stats.upcomingMaintenances.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Yaklaşan Bakımlar</Text>
              {stats.upcomingMaintenances.map((m) => (
                <View key={m._id} style={styles.upcomingItem}>
                  <Text style={styles.upcomingText}>
                    {m.equipment.name} - {new Date(m.scheduledDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Yaklaşan Projeler */}
          {stats.upcomingProjects.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Yaklaşan Projeler</Text>
              {stats.upcomingProjects.map((p) => (
                <View key={p._id} style={styles.upcomingItem}>
                  <Text style={styles.upcomingText}>
                    {p.name} - {new Date(p.startDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <PrimaryButton label="Çıkış Yap" onPress={signOut} style={{ marginTop: 20, marginBottom: 20, backgroundColor: '#1B2A44' }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#9FB2C8', marginTop: 6, marginBottom: 18 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9FB2C8', marginTop: 12 },
  errorText: { color: '#FF6B6B', textAlign: 'center', marginBottom: 8 },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 16,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#9FB2C8', fontSize: 12, marginTop: 4 },
  upcomingItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  upcomingText: { color: '#CFE0F5', fontSize: 14 },
});

