import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { TwoFactorScreen } from '../screens/TwoFactorScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { EquipmentScreen } from '../screens/EquipmentScreen';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  TwoFactor: { email: string };
  Dashboard: undefined;
  Tasks: undefined;
  Equipment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isBootstrapping, isAuthenticated } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1220' }}>
        <ActivityIndicator color="#00C49F" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0B1220' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#0B1220' }
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş' }} />
          <Stack.Screen name="TwoFactor" component={TwoFactorScreen} options={{ title: '2FA' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Görevler' }} />
          <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ title: 'Ekipmanlar' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

