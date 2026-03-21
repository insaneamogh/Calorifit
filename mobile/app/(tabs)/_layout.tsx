import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

// Clean icon components using SVG instead of emojis
function DashboardIcon({ focused }: { focused: boolean }) {
  const color = focused ? '#fff' : '#555';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={3} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={3} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={13} width={8} height={8} rx={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function LogIcon({ focused }: { focused: boolean }) {
  const color = focused ? '#fff' : '#555';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Line x1={12} y1={8} x2={12} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={12} y1={12} x2={15} y2={15} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ScanIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{
      width: 50, height: 50, borderRadius: 25,
      backgroundColor: Colors.primary,
      alignItems: 'center', justifyContent: 'center',
      marginTop: -14,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M23 19a2 2 0 01-2 2h-3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <Path d="M23 5a2 2 0 00-2-2h-3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <Path d="M1 19a2 2 0 002 2h3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <Path d="M1 5a2 2 0 012-2h3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <Circle cx={12} cy={12} r={4} stroke="#fff" strokeWidth={2} />
      </Svg>
    </View>
  );
}

function StatsIcon({ focused }: { focused: boolean }) {
  const color = focused ? '#fff' : '#555';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 20L9 14L13 18L21 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 10H21V14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? '#fff' : '#555';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(8,8,8,0.92)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 18,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginTop: 4,
        },
        tabBarBackground: () => (
          <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
        ),
        tabBarIcon: ({ focused }) => {
          if (route.name === 'index') return <DashboardIcon focused={focused} />;
          if (route.name === 'log') return <LogIcon focused={focused} />;
          if (route.name === 'scan') return <ScanIcon focused={focused} />;
          if (route.name === 'stats') return <StatsIcon focused={focused} />;
          if (route.name === 'profile') return <ProfileIcon focused={focused} />;
          return null;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="log" options={{ title: 'Log' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="milestones" options={{ href: null }} />
      <Tabs.Screen name="coach" options={{ href: null }} />
      <Tabs.Screen name="pantry" options={{ href: null }} />
      <Tabs.Screen name="workout" options={{ href: null }} />
    </Tabs>
  );
}
