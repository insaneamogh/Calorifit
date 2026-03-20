import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore } from '../../store/useStore';
import { logsAPI, waterAPI } from '../../services/api';
import CalorieRing from '../../components/ui/CalorieRing';
import { Colors } from '../../constants/colors';

const today = () => new Date().toISOString().split('T')[0];

const MEAL_META: Record<string, { icon: string; color: string; label: string }> = {
  breakfast: { icon: '☀️', color: Colors.breakfast, label: 'Breakfast' },
  lunch:     { icon: '🍽', color: Colors.lunch,     label: 'Lunch'     },
  dinner:    { icon: '🌙', color: Colors.dinner,    label: 'Dinner'    },
  snack:     { icon: '🍪', color: Colors.snack,     label: 'Snacks'    },
};

export default function Dashboard() {
  const { user, todayLog, waterToday, setTodayLog, setWaterToday } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [streak] = useState(user?.streak || 0);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: `${Colors.primary}20`,
            borderWidth: 1, borderColor: `${Colors.primary}30`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>⚡</Text>
          </View>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#fff', letterSpacing: -0.5 }}>
            Sanctuary
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {streak > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#171717', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ fontSize: 12 }}>🔥</Text>
              <Text style={{ color: '#f59e0b', fontFamily: 'Inter_700Bold', fontSize: 12 }}>{streak}</Text>
            </View>
          )}
          <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Calorie Ring */}
        <CalorieRing eaten={totals.calories} burned={0} goal={goal} />

        {/* Macros row */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          {[
            { label: 'Protein', value: totals.protein, goalVal: proteinGoal, color: '#f97316' },
            { label: 'Carbs',   value: totals.carbs,   goalVal: carbGoal,    color: Colors.primary },
            { label: 'Fats',    value: totals.fat,     goalVal: fatGoal,     color: Colors.tertiary },
          ].map((m) => {
            const pct = Math.min(1, m.value / (m.goalVal || 1));
            return (
              <View key={m.label} style={{ flex: 1, backgroundColor: '#171717', padding: 14, borderRadius: 16, gap: 8 }}>
                <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  {m.label}
                </Text>
                <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <View style={{ height: 5, backgroundColor: m.color, borderRadius: 4, width: `${pct * 100}%` }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 13 }}>{Math.round(m.value)}g</Text>
                  <Text style={{ color: `${m.color}99`, fontFamily: 'Inter_700Bold', fontSize: 10 }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Today's Log */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#fff', letterSpacing: -0.3 }}>Today's Log</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.primary }}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 10 }}>
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
                activeOpacity={0.8}
                style={{
                  backgroundColor: isEmpty ? `${meta.color}08` : '#171717',
                  borderRadius: 16, padding: 16,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isEmpty ? `${meta.color}20` : 'transparent',
                  borderLeftWidth: 4,
                  borderLeftColor: meta.color,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: `${meta.color}15`,
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: isEmpty ? `${Colors.onSurface}60` : '#fff' }}>
                    {meta.label}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#a3a3a3', marginTop: 2 }} numberOfLines={1}>
                    {desc}
                  </Text>
                </View>
                {isEmpty ? (
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: meta.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>{Math.round(mealCals)}</Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#a3a3a3', letterSpacing: 1, textTransform: 'uppercase' }}>kcal</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hydration Card */}
        <LinearGradient
          colors={['#1d4ed8', '#1e3a8a']}
          style={{ borderRadius: 20, padding: 20, marginTop: 20 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 28 }}>💧</Text>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: '#fff' }}>
                    {waterConsumed.toFixed(1)}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    / {waterGoal}L
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Hydration Goal
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => addWater(250)}
              style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: '#1d4ed8', fontFamily: 'Inter_700Bold', fontSize: 13 }}>+ 250ml</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4, marginTop: 16 }}>
            <View style={{
              height: 6, backgroundColor: '#fff', borderRadius: 4,
              width: `${Math.min(100, (waterConsumed / waterGoal) * 100)}%`,
            }} />
          </View>
        </LinearGradient>

        {/* Glass macro summary */}
        <View style={{
          marginTop: 16,
          backgroundColor: 'rgba(23,23,23,0.9)',
          borderRadius: 18, padding: 14,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        }}>
          <View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#a3a3a3', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
              Remaining
            </Text>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#fff' }}>
              {Math.max(0, goal - Math.round(totals.calories)).toLocaleString()} kcal
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            {[
              { label: 'Prot', value: Math.max(0, proteinGoal - Math.round(totals.protein)), color: '#f97316' },
              { label: 'Carb', value: Math.max(0, carbGoal - Math.round(totals.carbs)),   color: Colors.primary },
              { label: 'Fat',  value: Math.max(0, fatGoal - Math.round(totals.fat)),      color: Colors.tertiary },
            ].map((m) => (
              <View key={m.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: m.color }}>{m.value}g</Text>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 8, color: '#a3a3a3', letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
