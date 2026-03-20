import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { authAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useStore();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 40 }}>
          <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
          Welcome back
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 40 }}>
          Sign in to your Sanctuary
        </Text>

        <View style={{ gap: 16 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#404040"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#171717',
              borderRadius: 14, padding: 18,
              color: '#fff', fontFamily: 'Inter_400Regular', fontSize: 16,
              borderWidth: 1, borderColor: '#262626',
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#404040"
            secureTextEntry
            style={{
              backgroundColor: '#171717',
              borderRadius: 14, padding: 18,
              color: '#fff', fontFamily: 'Inter_400Regular', fontSize: 16,
              borderWidth: 1, borderColor: '#262626',
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16, paddingVertical: 18,
              alignItems: 'center', marginTop: 8,
            }}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 6 }}>
          <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_400Regular' }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/onboarding')}>
            <Text style={{ color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
