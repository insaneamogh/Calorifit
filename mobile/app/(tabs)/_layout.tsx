import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';

const icons: Record<string, { active: string; inactive: string }> = {
  index:   { active: '⊞', inactive: '⊞' },
  log:     { active: '✎', inactive: '✎' },
  scan:    { active: '⊙', inactive: '⊙' },
  stats:   { active: '↗', inactive: '↗' },
  profile: { active: '◉', inactive: '◉' },
};

const labels: Record<string, string> = {
  index: 'Dashboard',
  log: 'Log',
  scan: 'Scan',
  stats: 'Stats',
  profile: 'Profile',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(10,10,10,0.85)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginTop: 2,
        },
        tabBarBackground: () => (
          <BlurView intensity={30} tint="dark" style={{ flex: 1 }} />
        ),
        tabBarIcon: ({ focused, color }) => {
          const isCenter = route.name === 'scan';
          if (isCenter) {
            return (
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: focused ? Colors.primary : Colors.primary,
                alignItems: 'center', justifyContent: 'center',
                marginTop: -12,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <Text style={{ fontSize: 22, color: '#fff' }}>⊙</Text>
              </View>
            );
          }
          return (
            <View style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: focused ? `${Colors.primary}20` : 'transparent',
            }}>
              <Text style={{ fontSize: 18, color: focused ? Colors.primary : '#555' }}>
                {route.name === 'index' ? '▦' : route.name === 'log' ? '✎' : route.name === 'stats' ? '📊' : '◉'}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="log" options={{ title: 'Log' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
