import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Alert, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { exerciseAPI, aiAPI } from '../../services/api';
import { useStore } from '../../store/useStore';

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

function AvatarIcon({ color = '#555' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PlusIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ color = '#f87171' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  duration?: number | null;
  caloriesBurned?: number | null;
  date: string;
}

interface WeekDay {
  day: string;
  calories: number;
  count: number;
}

const CATEGORIES = ['chest', 'back', 'legs', 'shoulders', 'arms', 'cardio', 'core'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutScreen() {
  const { theme } = useTheme();
  const todayLog = useStore((s) => s.todayLog);
  const user = useStore((s) => s.user);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [perfToggle, setPerfToggle] = useState<'WEEK' | 'ACTIVE'>('WEEK');

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('chest');
  const [formSets, setFormSets] = useState('');
  const [formReps, setFormReps] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [saving, setSaving] = useState(false);

  // AI exercise estimation
  const [aiDesc, setAiDesc] = useState('');
  const [aiEstimating, setAiEstimating] = useState(false);

  const isCardio = formCategory === 'cardio';

  const totalBurned = exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);
  const eatenCalories = todayLog?.totals?.calories || 0;
  const netCalories = Math.round(eatenCalories - totalBurned);

  const fetchData = useCallback(async () => {
    try {
      const [dayRes, weekRes] = await Promise.all([
        exerciseAPI.getDay(todayStr()),
        exerciseAPI.getWeek(),
      ]);
      setExercises(dayRes.data || []);
      setWeekData(weekRes.data?.days || []);
    } catch (err) {
      console.log('Exercise fetch error:', err);
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

  const handleAIEstimate = async () => {
    if (!aiDesc.trim()) return;
    Keyboard.dismiss();
    setAiEstimating(true);
    try {
      const userWeight = user?.weightKg || 70;
      const res = await aiAPI.estimateExercise(aiDesc.trim(), userWeight);
      const data = res.data;
      if (data?.exercises?.length) {
        // Add all estimated exercises
        for (const ex of data.exercises) {
          const exData: any = {
            name: ex.name,
            category: ex.category || 'cardio',
            date: new Date().toISOString(),
            caloriesBurned: ex.caloriesBurned || 0,
          };
          if (ex.duration) exData.duration = ex.duration;
          if (ex.sets) exData.sets = ex.sets;
          if (ex.reps) exData.reps = ex.reps;
          if (ex.weight) exData.weight = ex.weight;

          const addRes = await exerciseAPI.add(exData);
          if (addRes.data) {
            setExercises((prev) => [addRes.data, ...prev]);
          }
        }
        setAiDesc('');
        setShowAddModal(false);
        exerciseAPI.getWeek().then((r) => setWeekData(r.data?.days || [])).catch(() => {});
        Alert.alert('Added!', `${data.exercises.length} exercise(s) logged (${data.totalCalories} kcal burned)`);
      } else {
        Alert.alert('No exercises detected', 'Try describing your workout differently.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to estimate exercise');
    } finally {
      setAiEstimating(false);
    }
  };

  const handleAdd = async () => {
    if (!formName.trim()) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      const data: any = {
        name: formName.trim(),
        category: formCategory,
        date: new Date().toISOString(),
      };
      if (isCardio) {
        data.duration = parseInt(formDuration) || 0;
      } else {
        data.sets = parseInt(formSets) || 0;
        data.reps = parseInt(formReps) || 0;
        data.weight = parseFloat(formWeight) || 0;
      }
      const res = await exerciseAPI.add(data);
      if (res.data) {
        setExercises((prev) => [res.data, ...prev]);
      }
      // Reset form
      setFormName('');
      setFormSets('');
      setFormReps('');
      setFormWeight('');
      setFormDuration('');
      setShowAddModal(false);
      // Re-fetch week data
      exerciseAPI.getWeek().then((r) => setWeekData(r.data?.days || [])).catch(() => {});
    } catch (err) {
      Alert.alert('Error', 'Failed to add exercise');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await exerciseAPI.delete(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
      exerciseAPI.getWeek().then((r) => setWeekData(r.data?.days || [])).catch(() => {});
    } catch {
      Alert.alert('Error', 'Failed to delete exercise');
    }
  };

  const maxBarCal = Math.max(...weekData.map((d) => d.calories), 1);
  const todayDayIdx = (new Date().getDay() + 6) % 7; // 0=Mon

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Net Calories Card */}
        <View style={{
          backgroundColor: theme.isDark ? '#0a0f1e' : theme.surface,
          borderRadius: 24, padding: 24, marginBottom: 14,
          borderWidth: 1, borderColor: theme.isDark ? '#1a2a4a' : theme.border,
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9,
            color: theme.isDark ? 'rgba(255,255,255,0.5)' : theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10,
          }}>
            Net Calories Today
          </Text>
          <Text style={{
            fontFamily: 'Inter_900Black', fontSize: 52,
            color: theme.isDark ? '#fff' : theme.text,
            letterSpacing: -2, marginBottom: 14,
          }}>
            {netCalories.toLocaleString()} kcal
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: 'Inter_600SemiBold', fontSize: 9,
                color: theme.isDark ? 'rgba(255,255,255,0.4)' : theme.textTertiary,
                letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4,
              }}>
                Eaten
              </Text>
              <Text style={{
                fontFamily: 'Inter_700Bold', fontSize: 16,
                color: theme.isDark ? '#fff' : theme.text,
              }}>
                {Math.round(eatenCalories).toLocaleString()}
              </Text>
            </View>
            <View style={{
              width: 1,
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : theme.border,
              marginHorizontal: 16,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: 'Inter_600SemiBold', fontSize: 9,
                color: theme.isDark ? 'rgba(255,255,255,0.4)' : theme.textTertiary,
                letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4,
              }}>
                Burned
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#f97316' }}>
                {Math.round(totalBurned).toLocaleString()}
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
              Auto-import workouts
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
            <View style={{ flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 10, padding: 3 }}>
              {(['WEEK', 'ACTIVE'] as const).map((t) => (
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
            {DAYS.map((day, idx) => {
              const cal = weekData[idx]?.calories || 0;
              const barH = maxBarCal > 0 ? Math.max(4, (cal / maxBarCal) * 80) : 4;
              const isToday = idx === todayDayIdx;
              return (
                <View key={day} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 24, borderRadius: 6,
                    backgroundColor: isToday ? Colors.primary : theme.surface2,
                    height: barH,
                    ...(isToday ? {
                      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4, shadowRadius: 6,
                    } : {}),
                  }} />
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {DAYS.map((day, idx) => {
              const isToday = idx === todayDayIdx;
              return (
                <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{
                    fontFamily: 'Inter_600SemiBold', fontSize: 8,
                    color: isToday ? Colors.primary : theme.textTertiary,
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's Log */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: theme.text, letterSpacing: -0.3 }}>
            Today's Log
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary }}>
              ADD EXERCISE
            </Text>
          </TouchableOpacity>
        </View>

        {exercises.length === 0 ? (
          <View style={{
            backgroundColor: theme.surface, borderRadius: 16, padding: 32,
            borderWidth: 1, borderColor: theme.border, alignItems: 'center',
          }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.textTertiary, marginBottom: 8 }}>
              No exercises logged today
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textTertiary, textAlign: 'center' }}>
              Tap "ADD EXERCISE" to log your first workout
            </Text>
          </View>
        ) : (
          exercises.map((ex, idx) => {
            const isCardioEx = ex.category === 'cardio';
            const burned = ex.caloriesBurned || 0;
            return (
              <View
                key={ex.id}
                style={{
                  backgroundColor: theme.surface, borderRadius: 16, padding: 18,
                  borderWidth: 1, borderColor: theme.border,
                  marginBottom: idx < exercises.length - 1 ? 10 : 0,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 4 }}>
                      {ex.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textTertiary, textTransform: 'capitalize' }}>
                      {ex.category}
                    </Text>
                  </View>
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => {
                    Alert.alert('Delete Exercise', `Remove "${ex.name}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(ex.id) },
                    ]);
                  }}>
                    <TrashIcon color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>

                {isCardioEx ? (
                  <View style={{ flexDirection: 'row' }}>
                    {[
                      { label: 'DURATION', value: `${ex.duration || 0} min` },
                      { label: 'BURNED', value: `${Math.round(burned)} kcal` },
                    ].map((stat, sIdx) => (
                      <View key={stat.label} style={{
                        flex: 1, backgroundColor: theme.surface2, borderRadius: 10, padding: 12,
                        alignItems: 'center', marginRight: sIdx < 1 ? 8 : 0,
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
                ) : (
                  <View style={{ flexDirection: 'row' }}>
                    {[
                      { label: 'SETS', value: String(ex.sets || 0) },
                      { label: 'REPS', value: String(ex.reps || 0) },
                      { label: 'WEIGHT', value: `${ex.weight || 0} kg` },
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
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => { Keyboard.dismiss(); setShowAddModal(false); }}>
        <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={{
                backgroundColor: theme.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
                padding: 24, paddingBottom: 40,
              }}>
                {/* Modal Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text }}>
                    Add Exercise
                  </Text>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowAddModal(false); }} style={{ padding: 4 }}>
                    <CloseIcon color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* AI Describe Input */}
                <View style={{
                  backgroundColor: theme.surface, borderRadius: 14, padding: 12,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: theme.border, marginBottom: 16,
                }}>
                  <TextInput
                    value={aiDesc}
                    onChangeText={setAiDesc}
                    placeholder="Describe workout... e.g. 30 min run, 4x12 bench 60kg"
                    placeholderTextColor={theme.textTertiary}
                    style={{
                      flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14,
                      color: theme.text, paddingVertical: 4, paddingRight: 8,
                    }}
                    editable={!aiEstimating}
                    returnKeyType="send"
                    onSubmitEditing={handleAIEstimate}
                  />
                  <TouchableOpacity
                    onPress={handleAIEstimate}
                    disabled={aiEstimating || !aiDesc.trim()}
                    style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: aiEstimating || !aiDesc.trim() ? `${Colors.primary}60` : Colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {aiEstimating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <BoltIcon color="#fff" size={16} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{
                  flexDirection: 'row', alignItems: 'center', marginBottom: 16,
                }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, marginHorizontal: 12, letterSpacing: 1 }}>
                    OR MANUALLY
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                </View>

                {/* Exercise Name */}
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                  EXERCISE NAME
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                    color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                    marginBottom: 16,
                  }}
                  placeholder="e.g. Bench Press"
                  placeholderTextColor={theme.textTertiary}
                  value={formName}
                  onChangeText={setFormName}
                />

                {/* Category Pills */}
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 8, letterSpacing: 0.5 }}>
                  CATEGORY
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setFormCategory(cat)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8,
                        backgroundColor: formCategory === cat ? Colors.primary : theme.surface,
                        borderWidth: 1, borderColor: formCategory === cat ? Colors.primary : theme.border,
                      }}
                    >
                      <Text style={{
                        fontFamily: 'Inter_600SemiBold', fontSize: 12,
                        color: formCategory === cat ? '#fff' : theme.textSecondary,
                        textTransform: 'capitalize',
                      }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Dynamic fields */}
                {isCardio ? (
                  <View>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                      DURATION (MINUTES)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                        color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                        marginBottom: 16,
                      }}
                      placeholder="30"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="numeric"
                      value={formDuration}
                      onChangeText={setFormDuration}
                    />
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                        SETS
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                          color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                        }}
                        placeholder="4"
                        placeholderTextColor={theme.textTertiary}
                        keyboardType="numeric"
                        value={formSets}
                        onChangeText={setFormSets}
                      />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                        REPS
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                          color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                        }}
                        placeholder="12"
                        placeholderTextColor={theme.textTertiary}
                        keyboardType="numeric"
                        value={formReps}
                        onChangeText={setFormReps}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                        WEIGHT (KG)
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                          color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                        }}
                        placeholder="60"
                        placeholderTextColor={theme.textTertiary}
                        keyboardType="numeric"
                        value={formWeight}
                        onChangeText={setFormWeight}
                      />
                    </View>
                  </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={saving || !formName.trim()}
                  style={{
                    backgroundColor: !formName.trim() ? theme.surface2 : Colors.primary,
                    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: !formName.trim() ? theme.textTertiary : '#fff' }}>
                      Save Exercise
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
