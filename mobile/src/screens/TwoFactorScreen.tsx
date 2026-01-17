import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactor'>;

export const TwoFactorScreen: React.FC<Props> = ({ route, navigation }) => {
  const { verify2FA } = useAuth();
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verify2FA({
        email: route.params.email,
        token: token.trim() || undefined,
        backupCode: backupCode.trim() || undefined
      });
      navigation.replace('Dashboard');
    } catch (e: any) {
      Alert.alert('2FA başarısız', e?.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2FA Doğrulama</Text>
      <Text style={styles.subtitle}>{route.params.email}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Doğrulama Kodu</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          keyboardType="number-pad"
          placeholder="123456"
          placeholderTextColor="#7E8AA2"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Backup Code (opsiyonel)</Text>
        <TextInput
          value={backupCode}
          onChangeText={setBackupCode}
          autoCapitalize="characters"
          placeholder="A1B2C3D4"
          placeholderTextColor="#7E8AA2"
          style={styles.input}
        />

        <PrimaryButton label={loading ? 'Doğrulanıyor…' : 'Doğrula'} onPress={handleVerify} disabled={loading} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#9FB2C8', textAlign: 'center', marginTop: 6, marginBottom: 18 },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)'
  },
  label: { color: '#CFE0F5', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff'
  }
});

