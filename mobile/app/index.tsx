import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Index() {
  const user = useStore((s) => s.user);
  const accessToken = useStore((s) => s.accessToken);
  const isHydrated = useStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return; // Wait for store to load from AsyncStorage

    // Small delay for splash feel, then navigate
    const timer = setTimeout(() => {
      if (user && accessToken) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isHydrated, user, accessToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#3b82f6" size="large" />
    </View>
  );
}
