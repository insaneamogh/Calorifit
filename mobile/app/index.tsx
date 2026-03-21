import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';
import { USE_MOCK } from '../services/mockApi';

export default function Index() {
  const user = useStore((s) => s.user);
  const accessToken = useStore((s) => s.accessToken);

  useEffect(() => {
    // In mock mode skip the splash delay entirely
    const ms = USE_MOCK ? 50 : 500;
    const timer = setTimeout(() => {
      if (user && accessToken) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, ms);
    return () => clearTimeout(timer);
  }, [user, accessToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#3b82f6" size="large" />
    </View>
  );
}
