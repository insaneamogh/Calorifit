import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function Welcome() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient
        colors={['#001a4d', '#000000']}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 32 }}
      >
        {/* Logo / Hero area */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: `${Colors.primary}20`,
            borderWidth: 1, borderColor: `${Colors.primary}40`,
            justifyContent: 'center', alignItems: 'center', marginBottom: 24,
          }}>
            <Text style={{ fontSize: 36 }}>⚡</Text>
          </View>
          <Text style={{
            fontFamily: 'Inter_900Black',
            fontSize: 40, color: '#fff',
            letterSpacing: -1, textAlign: 'center',
          }}>
            Kinetic{'\n'}Sanctuary
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16, color: '#a3a3a3',
            marginTop: 12, textAlign: 'center',
            lineHeight: 24,
          }}>
            Your premium AI-powered{'\n'}nutrition companion
          </Text>
        </View>

        {/* CTA buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding')}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16, paddingVertical: 18,
              alignItems: 'center',
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{
              backgroundColor: '#171717',
              borderRadius: 16, paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1, borderColor: '#262626',
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#a3a3a3' }}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
