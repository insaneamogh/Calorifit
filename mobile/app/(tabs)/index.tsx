import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { router } from 'expo-router';
import { useStore } from '../../store/useStore';
import { logsAPI, waterAPI } from '../../services/api';
import CalorieRing from '../../components/ui/CalorieRing';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { getShifaRating, getShifaColor, getShifaLabel, getShifaBgColor } from '../../utils/shifa';

const today = () => new Date().toISOString().split('T')[0];

// Meal icon components (SVG-based, no emojis)
function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.8} />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ForkKnifeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 2v6a4 4 0 01-4 4M17 2v20M21 2c0 4-2 8-4 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CookieIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
      <Circle cx={8} cy={9} r={1} fill={color} />
      <Circle cx={15} cy={8} r={1} fill={color} />
      <Circle cx={10} cy={15} r={1} fill={color} />
      <Circle cx={16} cy={14} r={1} fill={color} />
    </Svg>
  );
}

const MEAL_META: Record<string, { icon: (c: string) => JSX.Element; color: string; label: string }> = {
  breakfast: { icon: (c) => <SunIcon color={c} />, color: Colors.breakfast, label: 'Breakfast' },
  lunch:     { icon: (c) => <ForkKnifeIcon color={c} />, color: Colors.lunch, label: 'Lunch' },
  dinner:    { icon: (c) => <MoonIcon color={c} />, color: Colors.dinner, label: 'Dinner' },
  snack:     { icon: (c) => <CookieIcon color={c} />, color: Colors.snack, label: 'Snacks' },
};

// Water drop SVG icon
function WaterDropIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke="#60a5fa" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Trash icon for water reset
function TrashIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function Dashboard() {
  const { user, todayLog, waterToday, setTodayLog, setWaterToday } = useStore();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dateStr = today();
      const [logRes, waterRes] = await Promise.all([
        logsAPI.getDay(dateStr),
        waterAPI.getDay(dateStr),
      ]);
      setTodayLog(logRes.data);
      setWaterToday(waterRes.data.totalMl || 0);
    } catch (err: any) {
      console.error('Dashboard load error:', err.message);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const addWater = async (ml: number) => {
    try {
      await waterAPI.log(ml);
      setWaterToday((waterToday || 0) + ml);
    } catch {
      Alert.alert('Error', 'Could not log water');
    }
  };

  const totals = todayLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal = user?.dailyCalGoal || 2000;
  const proteinGoal = user?.dailyProteinGoal || 150;
  const carbGoal = user?.dailyCarbGoal || 250;
  const fatGoal = user?.dailyFatGoal || 65;
  const waterGoal = (user?.dailyWaterGoalMl || 2500) / 1000;
  const waterConsumed = (waterToday || 0) / 1000;

  // Group items by meal
  const byMeal: Record<string, typeof todayLog.items> = { breakfast: [], lunch: [], dinner: [], snack: [] };
  todayLog?.items?.forEach((item) => {
    const meal = item.meal.toLowerCase();
    if (byMeal[meal]) byMeal[meal].push(item);
    else byMeal['snack'].push(item);
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 14,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: theme.surface2,
            borderWidth: 1, borderColor: theme.border2,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, letterSpacing: -0.5 }}>
            Sanctuary
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={8} stroke="#666" strokeWidth={1.8} />
            <Path d="M21 21l-4.35-4.35" stroke="#666" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Calorie Ring */}
        <CalorieRing eaten={totals.calories} burned={0} goal={goal} />

        {/* Macros row */}
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {[
            { label: 'Protein', value: totals.protein, goalVal: proteinGoal, color: '#f97316' },
            { label: 'Carbs',   value: totals.carbs,   goalVal: carbGoal,    color: Colors.primary },
            { label: 'Fats',    value: totals.fat,     goalVal: fatGoal,     color: Colors.tertiary },
          ].map((m, idx) => {
            const pct = Math.min(1, m.value / (m.goalVal || 1));
            return (
              <View key={m.label} style={{
                flex: 1, backgroundColor: theme.surface, padding: 14, borderRadius: 14,
                borderWidth: 1, borderColor: theme.border,
                marginRight: idx < 2 ? 10 : 0,
              }}>
                <Text style={{
                  color: theme.textSecondary, fontFamily: 'Inter_600SemiBold', fontSize: 9,
                  letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
                }}>
                  {m.label}
                </Text>
                <View style={{ height: 4, backgroundColor: theme.surface2, borderRadius: 2 }}>
                  <View style={{ height: 4, backgroundColor: m.color, borderRadius: 2, width: `${pct * 100}%` }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: theme.text, fontFamily: 'Inter_700Bold', fontSize: 13 }}>
                    {Math.round(m.value)}g
                  </Text>
                  <Text style={{ color: theme.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Today's Log */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 19, color: theme.text, letterSpacing: -0.3 }}>
            Today's Log
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary }}>View All</Text>
          </TouchableOpacity>
        </View>

        <View>
          {Object.entries(byMeal).map(([mealKey, items]) => {
            const meta = MEAL_META[mealKey];
            const mealCals = items.reduce((s, i) => s + i.calories, 0);
            const isEmpty = items.length === 0;
            const desc = items.length > 0
              ? items.slice(0, 2).map((i) => i.food.name).join(', ')
              : `Log your ${meta.label.toLowerCase()}`;

            return (
              <TouchableOpacity
                key={mealKey}
                onPress={() => router.push(`/(tabs)/log?meal=${mealKey}`)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 14, padding: 16, marginBottom: 8,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderLeftWidth: 3,
                  borderLeftColor: meta.color,
                }}
              >
                <View style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: `${meta.color}12`,
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  {meta.icon(meta.color)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: isEmpty ? theme.textTertiary : theme.text }}>
                    {meta.label}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textTertiary, marginTop: 2 }} numberOfLines={1}>
                    {desc}
                  </Text>
                </View>
                {isEmpty ? (
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: `${meta.color}20`, borderWidth: 1, borderColor: `${meta.color}40`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: meta.color, fontSize: 16, fontFamily: 'Inter_400Regular', marginTop: -1 }}>+</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: theme.text }}>{Math.round(mealCals)}</Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>kcal</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Daily Shifa Index Card */}
        {todayLog?.mealShifa?.total && todayLog.mealShifa.total.shifaIndex > 0 && (() => {
          const dayShifa = todayLog.mealShifa.total;
          const rating = getShifaRating(dayShifa.shifaIndex);
          const color = getShifaColor(rating);
          const bgColor = getShifaBgColor(rating);
          const label = getShifaLabel(rating);
          return (
            <View style={{
              backgroundColor: bgColor, borderRadius: 16, padding: 18, marginTop: 14,
              borderWidth: 1, borderColor: `${color}25`,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#555', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                    Daily Shifa Index
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color, letterSpacing: -1, marginRight: 6 }}>
                      {dayShifa.shifaIndex}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color }}>{label}</Text>
                  </View>
                </View>
                <View style={{
                  width: 42, height: 42, borderRadius: 21,
                  backgroundColor: `${color}18`,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </View>
              {/* Per-meal breakdown */}
              <View style={{ flexDirection: 'row', marginTop: 14 }}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => {
                  const ms = todayLog?.mealShifa?.[m];
                  if (!ms || ms.shifaIndex <= 0) return null;
                  const mRating = getShifaRating(ms.shifaIndex);
                  const mColor = getShifaColor(mRating);
                  return (
                    <View key={m} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 10, alignItems: 'center', marginRight: 8 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                        {m.slice(0, 4)}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: mColor }}>{ms.shifaIndex}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Hydration Card */}
        <View style={{
          backgroundColor: '#0c1a3d', borderRadius: 18, padding: 18, marginTop: 18,
          borderWidth: 1, borderColor: '#1a2a5a',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginRight: 12 }}>
                <WaterDropIcon />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 24, color: '#fff', marginRight: 4 }}>
                    {waterConsumed.toFixed(1)}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    / {waterGoal}L
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Hydration Goal
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ padding: 6, marginRight: 8 }}>
                <TrashIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addWater(250)}
                style={{
                  backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 8,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                }}
              >
                <Text style={{ color: '#60a5fa', fontFamily: 'Inter_700Bold', fontSize: 12 }}>+ 250ml</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 2, marginTop: 14 }}>
            <View style={{
              height: 4, backgroundColor: '#3b82f6', borderRadius: 2,
              width: `${Math.min(100, (waterConsumed / waterGoal) * 100)}%`,
            }} />
          </View>
        </View>

        {/* Remaining macro summary */}
        <View style={{
          marginTop: 12,
          backgroundColor: theme.surface,
          borderRadius: 14, padding: 14,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          borderWidth: 1, borderColor: theme.border,
        }}>
          <View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>
              Remaining
            </Text>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: theme.text }}>
              {Math.max(0, goal - Math.round(totals.calories)).toLocaleString()} kcal
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[
              { label: 'Prot', value: Math.max(0, proteinGoal - Math.round(totals.protein)), color: '#f97316' },
              { label: 'Carb', value: Math.max(0, carbGoal - Math.round(totals.carbs)),   color: Colors.primary },
              { label: 'Fat',  value: Math.max(0, fatGoal - Math.round(totals.fat)),      color: Colors.tertiary },
            ].map((m, idx) => (
              <View key={m.label} style={{ alignItems: 'center', marginLeft: idx > 0 ? 20 : 0 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: m.color }}>{m.value}g</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Access */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, letterSpacing: -0.3, marginBottom: 14 }}>
            Quick Access
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              {
                label: 'Workout Logger',
                color: '#f97316',
                bg: 'rgba(249,115,22,0.1)',
                border: 'rgba(249,115,22,0.2)',
                route: '/(tabs)/workout' as const,
                icon: (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M6 5v14M18 5v14" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
                    <Path d="M3 8h3M18 8h3M3 16h3M18 16h3" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
                    <Path d="M6 12h12" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                ),
              },
              {
                label: 'AI Coach',
                color: Colors.primary,
                bg: 'rgba(59,130,246,0.1)',
                border: 'rgba(59,130,246,0.2)',
                route: '/(tabs)/coach' as const,
                icon: (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ),
              },
              {
                label: 'Pantry',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.1)',
                border: 'rgba(16,185,129,0.2)',
                route: '/(tabs)/pantry' as const,
                icon: (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 001.64 1.16C7 19 9 17 12 16c-1.5 2-2 4-2 4s3-2 5-5c1.5 2 1.5 4 1.5 4s2-3 2-7c0-3.5-1.5-4.5-1.5-4.5z" stroke="#10b981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ),
              },
              {
                label: 'Milestones',
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.1)',
                border: 'rgba(245,158,11,0.2)',
                route: '/(tabs)/milestones' as const,
                icon: (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M6 9H4.5a2.5 2.5 0 010-5H6" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M18 9h1.5a2.5 2.5 0 000-5H18" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M4 22h16" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" />
                    <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M18 2H6v7a6 6 0 0012 0V2z" stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ),
              },
            ].map((card, idx) => (
              <TouchableOpacity
                key={card.label}
                onPress={() => router.push(card.route)}
                activeOpacity={0.7}
                style={{
                  width: '47%',
                  backgroundColor: card.bg,
                  borderRadius: 16, padding: 18,
                  borderWidth: 1, borderColor: card.border,
                  marginRight: idx % 2 === 0 ? '6%' : 0,
                  marginBottom: 12,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: `${card.color}18`,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  {card.icon}
                </View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text }}>
                  {card.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
