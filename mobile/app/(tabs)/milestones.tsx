import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

function BoltIcon({ color = '#fff', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function BackIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FireIcon({ color = '#f97316' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M8.5 14.5A3.5 3.5 0 0012 18a3.5 3.5 0 003.5-3.5c0-2-1.5-3.5-2-5.5-.5 2-3.5 3.5-5 5.5z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2c.5 3-1 5-2 7 2-1 4-3 4-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WaterIcon({ color = '#60a5fa' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DumbbellIcon({ color = '#f97316' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 5v14M18 5v14" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M3 8h3M18 8h3M3 16h3M18 16h3" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M6 12h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SunIcon({ color = '#10b981' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.8} />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function LeafIcon({ color = '#10b981' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 001.64 1.16C7 19 9 17 12 16c-1.5 2-2 4-2 4s3-2 5-5c1.5 2 1.5 4 1.5 4s2-3 2-7c0-3.5-1.5-4.5-1.5-4.5z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShieldIcon({ color = '#94a3b8' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UsersIcon({ color = '#cd7f32' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const currentXP = 19350;
const nextRankXP = 20000;
const xpProgress = currentXP / nextRankXP;

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const COMPLETED_DAYS = [true, true, true, true, true, false, false];

const CHALLENGES = [
  {
    title: 'Hydration Hero',
    desc: 'Drink 3L Today',
    icon: <WaterIcon />,
    progress: 0.8,
    progressColor: Colors.primary,
    tag: '24 hrs left',
    tagColor: '#3b82f6',
  },
  {
    title: 'Protein Power',
    desc: 'Hit 150g Protein',
    icon: <DumbbellIcon />,
    progress: 0.65,
    progressColor: '#f97316',
    tag: '2 Days',
    tagColor: '#f97316',
  },
  {
    title: 'Morning Warrior',
    desc: 'Log by 9AM',
    icon: <SunIcon />,
    progress: 1.0,
    progressColor: '#10b981',
    tag: 'Complete!',
    tagColor: '#10b981',
  },
];

const TROPHIES = [
  { title: 'Veggie Master', icon: <LeafIcon color="#10b981" />, bg: '#78350f', border: '#d97706' },
  { title: '30 Day Warrior', icon: <ShieldIcon color="#94a3b8" />, bg: '#1e293b', border: '#94a3b8' },
  { title: 'Team Momentum', icon: <UsersIcon color="#cd7f32" />, bg: '#292524', border: '#cd7f32' },
];

export default function MilestonesScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 14,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <BackIcon color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border2,
            alignItems: 'center', justifyContent: 'center', marginRight: 10,
          }}>
            <BoltIcon color={Colors.primary} size={16} />
          </View>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: theme.text, letterSpacing: -0.5 }}>
            Kinetic Sanctuary
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <BellIcon color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Progression */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 20, padding: 20, marginTop: 4,
          borderWidth: 1, borderColor: theme.border,
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10,
          }}>
            Current Progression
          </Text>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: theme.text, letterSpacing: -1, marginBottom: 6 }}>
            Elite Level 42
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 18 }}>
            You are 650 XP away from reaching Master Rank. Keep pushing your limits.
          </Text>

          {/* XP Progress Bar */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ height: 8, backgroundColor: theme.surface2, borderRadius: 4 }}>
              <View style={{
                height: 8, backgroundColor: Colors.primary, borderRadius: 4,
                width: `${xpProgress * 100}%`,
              }} />
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{
              flex: 1, backgroundColor: theme.surface2, borderRadius: 12, padding: 14,
              alignItems: 'center', marginRight: 10,
            }}>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: Colors.primary, letterSpacing: -0.5 }}>
                19,350 XP
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary, marginTop: 4 }}>
                Total XP
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: theme.surface2, borderRadius: 12, padding: 14,
              alignItems: 'center',
            }}>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: theme.text, letterSpacing: -0.5 }}>
                Rank: 450
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary, marginTop: 4 }}>
                Global Rank
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Momentum */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 20, padding: 20, marginTop: 14,
          borderWidth: 1, borderColor: theme.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text }}>
              Daily Momentum
            </Text>
            {/* Fire streak badge - no emoji, SVG fire */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(249,115,22,0.12)', paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
            }}>
              <View style={{ marginRight: 6 }}>
                <FireIcon />
              </View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#f97316' }}>
                124 Days
              </Text>
            </View>
          </View>

          {/* Day circles */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {DAY_LETTERS.map((letter, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: COMPLETED_DAYS[idx] ? Colors.primary : theme.surface2,
                  borderWidth: 1,
                  borderColor: COMPLETED_DAYS[idx] ? Colors.primary : theme.border,
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 6,
                  ...(COMPLETED_DAYS[idx] ? {
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                  } : {}),
                }}>
                  <Text style={{
                    fontFamily: 'Inter_700Bold', fontSize: 13,
                    color: COMPLETED_DAYS[idx] ? '#fff' : theme.textTertiary,
                  }}>
                    {letter}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Challenges */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, letterSpacing: -0.3 }}>
              Active Challenges
            </Text>
          </View>

          {CHALLENGES.map((ch, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: theme.surface, borderRadius: 16, padding: 18, marginBottom: 10,
                borderWidth: 1, borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: `${ch.progressColor}15`,
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    {ch.icon}
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text }}>
                      {ch.title}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                      {ch.desc}
                    </Text>
                  </View>
                </View>
                <View style={{
                  backgroundColor: `${ch.tagColor}18`, paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 10, borderWidth: 1, borderColor: `${ch.tagColor}30`,
                }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: ch.tagColor }}>
                    {ch.tag}
                  </Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: theme.surface2, borderRadius: 3 }}>
                <View style={{
                  height: 6, backgroundColor: ch.progressColor, borderRadius: 3,
                  width: `${ch.progress * 100}%`,
                }} />
              </View>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, marginTop: 6 }}>
                {Math.round(ch.progress * 100)}% complete
              </Text>
            </View>
          ))}

          <TouchableOpacity style={{
            borderWidth: 1, borderColor: theme.border, borderRadius: 14,
            paddingVertical: 15, alignItems: 'center', marginTop: 4,
          }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.textSecondary }}>
              Browse All Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trophy Room */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary, letterSpacing: 1.8, textTransform: 'uppercase' }}>
                Trophy Room
              </Text>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, marginTop: 2 }}>
                64 Trophies
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {TROPHIES.map((trophy, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1, backgroundColor: trophy.bg, borderRadius: 16, padding: 16,
                  alignItems: 'center', borderWidth: 1, borderColor: trophy.border,
                  marginRight: idx < 2 ? 10 : 0,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${trophy.border}25`,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                }}>
                  {trophy.icon}
                </View>
                <Text style={{
                  fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#fff',
                  textAlign: 'center', lineHeight: 16,
                }}>
                  {trophy.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
