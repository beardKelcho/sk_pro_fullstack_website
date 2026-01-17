import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await signIn({ email, password });
      if (result.requires2FA) {
        const twoFaEmail = result.email || email;
        navigation.replace('TwoFactor', { email: twoFaEmail });
      } else {
        navigation.replace('Dashboard');
      }
    } catch (e: any) {
      Alert.alert('Giriş başarısız', e?.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SK Production</Text>
      <Text style={styles.subtitle}>Mobil Panel (MVP)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-posta / Telefon</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="ornek@skproduction.com"
          placeholderTextColor="#7E8AA2"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#7E8AA2"
          style={styles.input}
        />

        <PrimaryButton label={loading ? 'Giriş yapılıyor…' : 'Giriş Yap'} onPress={handleSubmit} disabled={loading} style={{ marginTop: 16 }} />
      </View>

      <Text style={styles.hint}>
        Not: API base URL için {`EXPO_PUBLIC_API_URL`} ayarlayın. (Varsayılan: http://localhost:5001/api)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center'
  },
  subtitle: {
    color: '#9FB2C8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)'
  },
  label: {
    color: '#CFE0F5',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff'
  },
  hint: {
    color: '#7E8AA2',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12
  }
});

