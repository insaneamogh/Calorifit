import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Index() {
  const user = useStore((s) => s.user);
  const accessToken = useStore((s) => s.accessToken);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && accessToken) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [user, accessToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#3b82f6" size="large" />
    </View>
  );
}
