import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api/auth';

export const DashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  const handleLoadProfile = async () => {
    setLoading(true);
    try {
      const res = await authApi.profile();
      setProfile(res.user || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Hoş geldin {user?.name || profile?.name || '—'}</Text>

      <View style={styles.card}>
        <Text style={styles.kv}>Role: {profile?.role || user?.role || '—'}</Text>
        <Text style={styles.kv}>Email: {profile?.email || user?.email || '—'}</Text>

        {loading ? (
          <View style={{ marginTop: 14 }}>
            <ActivityIndicator color="#00C49F" />
          </View>
        ) : null}

        <PrimaryButton label="Profil Yenile" onPress={handleLoadProfile} style={{ marginTop: 14 }} />
        <PrimaryButton label="Çıkış Yap" onPress={signOut} style={{ marginTop: 10, backgroundColor: '#1B2A44' }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#9FB2C8', marginTop: 6, marginBottom: 18 },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)'
  },
  kv: { color: '#CFE0F5', marginBottom: 6 }
});

