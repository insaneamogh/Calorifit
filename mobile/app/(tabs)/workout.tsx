import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

function BellIcon({ color = '#666' }: { color?: string }) {
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

function BoltIcon({ color = '#fff', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DotsIcon({ color = '#666' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1.5} fill={color} />
      <Circle cx={12} cy={12} r={1.5} fill={color} />
      <Circle cx={12} cy={19} r={1.5} fill={color} />
    </Svg>
  );
}

function HeartPulseIcon({ color = '#60a5fa' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function AvatarIcon({ color = '#555' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const BAR_HEIGHTS = [55, 40, 80, 35, 60, 25, 20];
const HIGHLIGHT_DAY = 2; // Wednesday

type ExerciseType = 'strength' | 'cardio';

interface StrengthExercise {
  type: 'strength';
  name: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
}

interface CardioExercise {
  type: 'cardio';
  name: string;
  category: string;
  duration: number;
  avgHr: number;
  burned: number;
}

type Exercise = StrengthExercise | CardioExercise;

const EXERCISES: Exercise[] = [
  {
    type: 'strength',
    name: 'Incline Bench Press',
    category: 'Chest & Triceps',
    sets: 4,
    reps: 12,
    weight: 85,
  },
  {
    type: 'cardio',
    name: 'HIIT Sprints',
    category: 'Cardio Finish',
    duration: 20,
    avgHr: 162,
    burned: 340,
  },
];

type ToggleType = 'WEEK' | 'ACTIVE';

export default function WorkoutScreen() {
  const { theme } = useTheme();
  const [perfToggle, setPerfToggle] = useState<ToggleType>('WEEK');

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
          {/* Avatar placeholder */}
          <View style={{
            width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface2,
            borderWidth: 1, borderColor: theme.border2,
            alignItems: 'center', justifyContent: 'center', marginRight: 10,
          }}>
            <AvatarIcon color={theme.textTertiary} />
          </View>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: theme.text, letterSpacing: 2, textTransform: 'uppercase' }}>
            Kinetic
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
        {/* Net Calories Card */}
        <View style={{
          backgroundColor: '#0a0f1e', borderRadius: 24, padding: 24, marginBottom: 14,
          borderWidth: 1, borderColor: '#1a2a4a',
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.5)',
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10,
          }}>
            Net Calories Today
          </Text>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 52, color: '#fff', letterSpacing: -2, marginBottom: 14 }}>
            1,420 kcal
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
                Eaten
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>
                2,840
              </Text>
            </View>
            <View style={{
              width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
                Burned
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#f97316' }}>
                1,420
              </Text>
            </View>
          </View>
        </View>

        {/* Sync Apple Health */}
        <View style={{
          backgroundColor: Colors.primary, borderRadius: 18, padding: 18, marginBottom: 20,
          flexDirection: 'row', alignItems: 'center',
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}>
            <BoltIcon color="#fff" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', marginBottom: 2 }}>
              Sync Apple Health
            </Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Last synced 2m ago
            </Text>
          </View>
          <TouchableOpacity style={{
            backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8,
            borderRadius: 10,
          }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#fff' }}>
              Sync
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body Performance */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 20, padding: 20, marginBottom: 20,
          borderWidth: 1, borderColor: theme.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text }}>
              Body Performance
            </Text>
            {/* Toggle pills */}
            <View style={{ flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 10, padding: 3 }}>
              {(['WEEK', 'ACTIVE'] as ToggleType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setPerfToggle(t)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                    backgroundColor: perfToggle === t ? Colors.primary : 'transparent',
                  }}
                >
                  <Text style={{
                    fontFamily: 'Inter_600SemiBold', fontSize: 11,
                    color: perfToggle === t ? '#fff' : theme.textTertiary,
                  }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bar chart */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, marginBottom: 10 }}>
            {DAYS.map((day, idx) => (
              <View key={day} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 24, borderRadius: 6,
                  backgroundColor: idx === HIGHLIGHT_DAY ? Colors.primary : theme.surface2,
                  height: BAR_HEIGHTS[idx],
                  ...(idx === HIGHLIGHT_DAY ? {
                    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4, shadowRadius: 6,
                  } : {}),
                }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {DAYS.map((day, idx) => (
              <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  fontFamily: 'Inter_600SemiBold', fontSize: 8,
                  color: idx === HIGHLIGHT_DAY ? Colors.primary : theme.textTertiary,
                  letterSpacing: 0.5,
                }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Log */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, letterSpacing: -0.3 }}>
            Today's Log
          </Text>
          <TouchableOpacity>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary }}>
              ADD EXERCISE
            </Text>
          </TouchableOpacity>
        </View>

        {EXERCISES.map((ex, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: theme.surface, borderRadius: 16, padding: 18,
              borderWidth: 1, borderColor: theme.border,
              marginBottom: idx < EXERCISES.length - 1 ? 10 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 4 }}>
                  {ex.name}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textTertiary }}>
                  {ex.category}
                </Text>
              </View>
              <TouchableOpacity style={{ padding: 4 }}>
                <DotsIcon color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {ex.type === 'strength' ? (
              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'SETS', value: String(ex.sets) },
                  { label: 'REPS', value: String(ex.reps) },
                  { label: 'WEIGHT', value: `${ex.weight} kg` },
                ].map((stat, sIdx) => (
                  <View key={stat.label} style={{
                    flex: 1, backgroundColor: theme.surface2, borderRadius: 10, padding: 12,
                    alignItems: 'center', marginRight: sIdx < 2 ? 8 : 0,
                  }}>
                    <Text style={{
                      fontFamily: 'Inter_600SemiBold', fontSize: 8, color: theme.textTertiary,
                      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
                    }}>
                      {stat.label}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: theme.text }}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'DURATION', value: `${ex.duration} min` },
                  { label: 'AVG HR', value: `${ex.avgHr}` },
                  { label: 'BURNED', value: `${ex.burned} kcal` },
                ].map((stat, sIdx) => (
                  <View key={stat.label} style={{
                    flex: 1, backgroundColor: theme.surface2, borderRadius: 10, padding: 12,
                    alignItems: 'center', marginRight: sIdx < 2 ? 8 : 0,
                  }}>
                    <Text style={{
                      fontFamily: 'Inter_600SemiBold', fontSize: 8, color: theme.textTertiary,
                      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
                    }}>
                      {stat.label}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 15, color: theme.text }}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

