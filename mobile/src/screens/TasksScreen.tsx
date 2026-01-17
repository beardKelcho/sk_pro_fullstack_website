import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TasksScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Görevler</Text>
      <Text style={styles.subtitle}>MVP Faz-1: Liste/Detay entegrasyonu sırada.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#9FB2C8', marginTop: 6 }
});

