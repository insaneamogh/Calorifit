import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function Welcome() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient
        colors={['#0a1a4d', '#050a1a', '#000000']}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 32 }}
      >
        {/* Logo / Hero area */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
            justifyContent: 'center', alignItems: 'center', marginBottom: 28,
          }}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={{
            fontFamily: 'Inter_900Black',
            fontSize: 38, color: '#fff',
            letterSpacing: -1.5, textAlign: 'center',
          }}>
            Kinetic{'\n'}Sanctuary
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15, color: '#555',
            marginTop: 14, textAlign: 'center',
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
              borderRadius: 14, paddingVertical: 18,
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
              backgroundColor: '#111',
              borderRadius: 14, paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1, borderColor: '#1a1a1a',
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#666' }}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
