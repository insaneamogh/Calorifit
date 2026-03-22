import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../store/useStore';
import { progressAPI, logsAPI, waterAPI } from '../../services/api';

const today = () => new Date().toISOString().split('T')[0];

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

function ScaleIcon({ color = '#10b981' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M16 16l-4-4-4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 12V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface StatsData {
  streak: number;
  startWeight?: number;
  currentWeight?: number;
  goalWeight?: number;
  totalLost: number;
  avgCalories: number;
  dailyCalGoal?: number;
}

export default function MilestonesScreen() {
  const { theme } = useTheme();
  const { user, todayLog, waterToday } = useStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [weeklyDays, setWeeklyDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, calRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getCalories(7),
      ]);
      setStats(statsRes.data);

      // Build 7-day activity booleans (Mon→Sun of current week)
      const calData: { date: string; calories: number }[] = calRes.data.data || [];
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun
      // Build Mon-indexed: Monday=0..Sunday=6
      const days: boolean[] = [false, false, false, false, false, false, false];
      for (const entry of calData) {
        const d = new Date(entry.date);
        const dow = d.getDay(); // 0=Sun
        const monIdx = dow === 0 ? 6 : dow - 1; // convert to Mon=0 index
        // Only include days in the current week
        const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7 && entry.calories > 0) {
          days[monIdx] = true;
        }
      }
      setWeeklyDays(days);
    } catch (err: any) {
      console.error('Milestones load error:', err.message);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const streak = stats?.streak ?? 0;
  const totalLost = stats?.totalLost ?? 0;
  const avgCalories = stats?.avgCalories ?? 0;
  const calGoal = stats?.dailyCalGoal ?? user?.dailyCalGoal ?? 2000;
  const proteinGoal = user?.dailyProteinGoal ?? 150;
  const waterGoalMl = user?.dailyWaterGoalMl ?? 2500;

  const todayProtein = todayLog?.totals?.protein ?? 0;
  const todayWaterMl = waterToday ?? 0;

  // Weight progress
  const startWeight = stats?.startWeight;
  const currentWeight = stats?.currentWeight;
  const goalWeight = stats?.goalWeight ?? user?.goalWeight;
  const weightRange = startWeight && goalWeight ? Math.abs(startWeight - goalWeight) : 0;
  const weightProgress = weightRange > 0 ? Math.min(1, Math.abs(totalLost) / weightRange) : 0;

  // Challenges derived from real data
  const waterProgress = Math.min(1, todayWaterMl / waterGoalMl);
  const proteinProgress = Math.min(1, todayProtein / (proteinGoal || 1));
  const calProgress = Math.min(1, avgCalories / (calGoal || 1));

  const CHALLENGES = [
    {
      title: 'Hydration Hero',
      desc: `Drink ${(waterGoalMl / 1000).toFixed(1)}L Today`,
      icon: <WaterIcon />,
      progress: waterProgress,
      progressColor: Colors.primary,
      tag: waterProgress >= 1 ? 'Complete!' : `${Math.round(waterProgress * 100)}%`,
      tagColor: waterProgress >= 1 ? '#10b981' : '#3b82f6',
    },
    {
      title: 'Protein Power',
      desc: `Hit ${proteinGoal}g Protein`,
      icon: <DumbbellIcon />,
      progress: proteinProgress,
      progressColor: '#f97316',
      tag: proteinProgress >= 1 ? 'Complete!' : `${Math.round(todayProtein)}g / ${proteinGoal}g`,
      tagColor: proteinProgress >= 1 ? '#10b981' : '#f97316',
    },
    {
      title: 'Calorie Consistency',
      desc: `Avg ${calGoal} kcal / day`,
      icon: <SunIcon color="#10b981" />,
      progress: calProgress,
      progressColor: '#10b981',
      tag: avgCalories > 0 ? `${avgCalories} avg kcal` : 'No data yet',
      tagColor: '#10b981',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 14,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
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
            Milestones
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <BellIcon color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Weight Progress Card */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 20, padding: 20, marginTop: 4,
          borderWidth: 1, borderColor: theme.border,
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10,
          }}>
            Weight Progress
          </Text>

          {currentWeight ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: theme.text, letterSpacing: -1, marginRight: 8 }}>
                  {currentWeight.toFixed(1)} kg
                </Text>
                {totalLost !== 0 && (
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: totalLost > 0 ? '#10b981' : '#f97316' }}>
                    {totalLost > 0 ? `-${totalLost}` : `+${Math.abs(totalLost)}`} kg
                  </Text>
                )}
              </View>
              {goalWeight && (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 18 }}>
                  {totalLost > 0
                    ? `${totalLost} kg lost toward your ${goalWeight} kg goal. Keep going!`
                    : `Goal: ${goalWeight} kg — log your weight to track progress.`}
                </Text>
              )}

              {/* Weight Progress Bar */}
              {weightRange > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ height: 8, backgroundColor: theme.surface2, borderRadius: 4 }}>
                    <View style={{
                      height: 8, backgroundColor: Colors.primary, borderRadius: 4,
                      width: `${weightProgress * 100}%`,
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                      Start: {startWeight?.toFixed(1)} kg
                    </Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                      Goal: {goalWeight} kg
                    </Text>
                  </View>
                </View>
              )}

              {/* Stats row */}
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  flex: 1, backgroundColor: theme.surface2, borderRadius: 12, padding: 14,
                  alignItems: 'center', marginRight: 10,
                }}>
                  <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: Colors.primary, letterSpacing: -0.5 }}>
                    {streak} days
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary, marginTop: 4 }}>
                    Current Streak
                  </Text>
                </View>
                <View style={{
                  flex: 1, backgroundColor: theme.surface2, borderRadius: 12, padding: 14,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: theme.text, letterSpacing: -0.5 }}>
                    {avgCalories > 0 ? avgCalories.toLocaleString() : '--'}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary, marginTop: 4 }}>
                    Avg kcal / day
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>
              Log your weight to start tracking progress toward your goal.
            </Text>
          )}
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
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(249,115,22,0.12)', paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
            }}>
              <View style={{ marginRight: 6 }}>
                <FireIcon />
              </View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#f97316' }}>
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </Text>
            </View>
          </View>

          {/* Day circles */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {DAY_LETTERS.map((letter, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: weeklyDays[idx] ? Colors.primary : theme.surface2,
                  borderWidth: 1,
                  borderColor: weeklyDays[idx] ? Colors.primary : theme.border,
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 6,
                  ...(weeklyDays[idx] ? {
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                  } : {}),
                }}>
                  <Text style={{
                    fontFamily: 'Inter_700Bold', fontSize: 13,
                    color: weeklyDays[idx] ? '#fff' : theme.textTertiary,
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
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, letterSpacing: -0.3, marginBottom: 14 }}>
            Today's Challenges
          </Text>

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
        </View>

        {/* Weight Logging CTA */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/stats')}
          style={{
            backgroundColor: theme.surface, borderRadius: 16, padding: 18, marginTop: 8,
            borderWidth: 1, borderColor: theme.border,
            flexDirection: 'row', alignItems: 'center',
          }}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: 'rgba(16,185,129,0.12)',
            alignItems: 'center', justifyContent: 'center', marginRight: 14,
          }}>
            <ScaleIcon color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text }}>
              Log Today's Weight
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Track your progress over time
            </Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={theme.textTertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
