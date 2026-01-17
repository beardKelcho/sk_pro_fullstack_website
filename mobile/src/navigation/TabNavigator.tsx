import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { EquipmentScreen } from '../screens/EquipmentScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { Text } from 'react-native';

export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Equipment: undefined;
  Calendar: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0B1220' },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#0B1220',
          borderTopColor: 'rgba(255,255,255,0.10)',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00C49F',
        tabBarInactiveTintColor: '#9FB2C8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: 'Görevler',
          tabBarLabel: 'Görevler',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>✓</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Equipment"
        component={EquipmentScreen}
        options={{
          title: 'Ekipmanlar',
          tabBarLabel: 'Ekipmanlar',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Takvim',
          tabBarLabel: 'Takvim',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📅</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
