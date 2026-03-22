import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { progressAPI } from '../../services/api';
import { useStore } from '../../store/useStore';

function BoltIcon({ color = Colors.primary, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SettingsIcon({ color = '#666' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={1.8} />
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

interface Stats {
  streak: number;
  avgCalories: number;
  dailyCalGoal: number;
  currentWeight: number;
  goalWeight: number;
  totalLost: number;
}

interface Tip {
  color: string;
  text: string;
}

function generateTips(
  todayCalories: number,
  todayProtein: number,
  waterMl: number,
  calGoal: number,
  proteinGoal: number,
  waterGoalMl: number,
  streak: number,
): Tip[] {
  const tips: Tip[] = [];

  // Protein check
  if (proteinGoal > 0 && todayProtein < proteinGoal * 0.8) {
    tips.push({
      color: '#f97316',
      text: `Increase protein intake -- you're at ${Math.round(todayProtein)}g of your ${Math.round(proteinGoal)}g goal`,
    });
  } else if (proteinGoal > 0 && todayProtein >= proteinGoal * 0.8) {
    tips.push({
      color: '#10b981',
      text: 'Protein intake is on track -- keep it up!',
    });
  }

  // Calorie check
  if (calGoal > 0 && todayCalories > calGoal * 1.1) {
    tips.push({
      color: '#f87171',
      text: `You're over your calorie goal by ${Math.round(todayCalories - calGoal)} kcal -- consider lighter meals`,
    });
  } else if (calGoal > 0 && todayCalories > 0 && todayCalories <= calGoal) {
    tips.push({
      color: '#10b981',
      text: 'Calorie intake is within your daily target',
    });
  }

  // Water check
  if (waterGoalMl > 0 && waterMl < waterGoalMl * 0.7) {
    tips.push({
      color: '#60a5fa',
      text: `Stay hydrated -- you're at ${Math.round((waterMl / waterGoalMl) * 100)}% of your water goal`,
    });
  } else if (waterGoalMl > 0 && waterMl >= waterGoalMl * 0.7) {
    tips.push({
      color: '#10b981',
      text: 'Good hydration today! Keep drinking water regularly',
    });
  }

  // Streak check
  if (streak > 7) {
    tips.push({
      color: '#a855f7',
      text: `${streak}-day streak! Great consistency -- keep the momentum going`,
    });
  } else if (streak > 0) {
    tips.push({
      color: Colors.primary,
      text: `${streak}-day streak -- log every day to build consistency`,
    });
  }

  // Fallback if no tips generated
  if (tips.length === 0) {
    tips.push({
      color: Colors.primary,
      text: 'Start logging meals and water to get personalized tips',
    });
  }

  return tips;
}

export default function CoachScreen() {
  const { theme } = useTheme();
  const user = useStore((s) => s.user);
  const todayLog = useStore((s) => s.todayLog);
  const waterToday = useStore((s) => s.waterToday);

  const [stats, setStats] = useState<Stats | null>(null);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calGoal = user?.dailyCalGoal || 0;
  const proteinGoal = user?.dailyProteinGoal || 0;
  const waterGoalMl = user?.dailyWaterGoalMl || 2500;

  const todayCalories = todayLog?.totals?.calories || 0;
  const todayProtein = todayLog?.totals?.protein || 0;
  const waterLiters = +(waterToday / 1000).toFixed(1);
  const waterGoalL = +(waterGoalMl / 1000).toFixed(1);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, calRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getCalories(7),
      ]);
      setStats(statsRes.data);
      setCaloriesData(calRes.data?.data || []);
    } catch (err) {
      console.log('Coach fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const streak = stats?.streak || user?.streak || 0;

  const tips = generateTips(
    todayCalories,
    todayProtein,
    waterToday,
    calGoal,
    proteinGoal,
    waterGoalMl,
    streak,
  );

  // Compute a simple nutrition score (0-10) from today's data
  const computeScore = () => {
    if (calGoal === 0) return 0;
    let score = 5; // base
    // Calorie adherence
    const calRatio = todayCalories / calGoal;
    if (calRatio >= 0.8 && calRatio <= 1.1) score += 2;
    else if (calRatio >= 0.5 && calRatio <= 1.3) score += 1;
    // Protein adherence
    if (proteinGoal > 0) {
      const protRatio = todayProtein / proteinGoal;
      if (protRatio >= 0.8) score += 1.5;
      else if (protRatio >= 0.5) score += 0.5;
    }
    // Water
    if (waterGoalMl > 0) {
      const waterRatio = waterToday / waterGoalMl;
      if (waterRatio >= 0.8) score += 1;
      else if (waterRatio >= 0.5) score += 0.5;
    }
    // Streak bonus
    if (streak > 7) score += 0.5;
    return Math.min(10, Math.round(score * 10) / 10);
  };

  const score = computeScore();
  const scoreDots = Math.min(5, Math.round(score / 2));

  const weeklyTargets = [
    { label: 'Calories', current: Math.round(todayCalories), goal: calGoal, unit: 'kcal', color: Colors.primary },
    { label: 'Protein', current: Math.round(todayProtein), goal: Math.round(proteinGoal), unit: 'g', color: '#f97316' },
    { label: 'Water', current: waterLiters, goal: waterGoalL, unit: 'L', color: '#60a5fa' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

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
            Vitality AI Coach
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <SettingsIcon color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Subtitle */}
        <Text style={{
          fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textSecondary,
          marginBottom: 20, lineHeight: 22,
        }}>
          {user?.name ? `${user.name}, ` : ''}
          {streak > 0
            ? `you're on a ${streak}-day logging streak`
            : 'start logging to get personalized insights'}
        </Text>

        {/* Score Card */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 24, padding: 24,
          borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 20,
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Nutrition Score
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 72, color: Colors.primary, letterSpacing: -3 }}>
              {score.toFixed(1)}
            </Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: theme.textTertiary, marginBottom: 10, marginLeft: 4 }}>
              /10
            </Text>
          </View>

          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 18 }}>
            {score >= 8 ? 'Excellent nutrition today!'
              : score >= 6 ? 'Good progress -- a few tweaks can help'
              : score >= 4 ? 'Room for improvement -- check the tips below'
              : 'Log more meals for an accurate score'}
          </Text>

          {/* Dot indicator */}
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: i < scoreDots ? Colors.primary : theme.surface2,
                  marginRight: i < 4 ? 6 : 0,
                }}
              />
            ))}
          </View>
        </View>

        {/* AI Tips */}
        <View style={{
          backgroundColor: theme.isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)',
          borderRadius: 20, padding: 20,
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)',
          marginBottom: 20,
        }}>
          <Text style={{
            fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text, marginBottom: 16,
          }}>
            Personalized Tips
          </Text>

          {tips.map((tip, idx) => (
            <View
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < tips.length - 1 ? 14 : 0 }}
            >
              <View style={{
                width: 10, height: 10, borderRadius: 5, backgroundColor: tip.color,
                marginTop: 4, marginRight: 12,
              }} />
              <Text style={{
                flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13,
                color: theme.textSecondary, lineHeight: 20,
              }}>
                {tip.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Daily Targets */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Today's Targets
          </Text>

          {weeklyTargets.map((target, idx) => {
            const pct = target.goal > 0 ? Math.min(1, target.current / target.goal) : 0;
            return (
              <View
                key={idx}
                style={{
                  backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                  borderWidth: 1, borderColor: theme.border,
                  marginBottom: idx < weeklyTargets.length - 1 ? 10 : 0,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.text }}>
                    {target.label}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textTertiary }}>
                    Goal: {target.goal}{target.unit}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: theme.surface2, borderRadius: 3, marginBottom: 8 }}>
                  <View style={{ height: 6, backgroundColor: target.color, borderRadius: 3, width: `${pct * 100}%` as any }} />
                </View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: target.color }}>
                  {target.current}{target.unit}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Weekly Summary */}
        {stats && (
          <View style={{
            backgroundColor: theme.surface, borderRadius: 16, padding: 18,
            borderWidth: 1, borderColor: theme.border,
          }}>
            <Text style={{
              fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
              letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14,
            }}>
              Weekly Summary
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 4 }}>
                  {stats.avgCalories || 0}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                  Avg kcal/day
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: 12 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 4 }}>
                  {stats.totalLost > 0 ? `-${stats.totalLost}` : stats.totalLost < 0 ? `+${Math.abs(stats.totalLost)}` : '0'} kg
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                  Weight change
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: 12 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: Colors.primary, marginBottom: 4 }}>
                  {streak}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                  Day streak
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
