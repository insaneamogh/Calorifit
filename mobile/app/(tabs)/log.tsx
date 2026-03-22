import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../store/useStore';
import { logsAPI, foodsAPI, aiAPI } from '../../services/api';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { getShifaRating, getShifaColor, getShifaLabel, getShifaBgColor } from '../../utils/shifa';

const today = () => new Date().toISOString().split('T')[0];

const SERVING_UNITS = [
  { label: '100g', grams: 100 },
  { label: '1 bowl', grams: 250 },
  { label: '1 cup', grams: 240 },
  { label: '1 spoon', grams: 15 },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  dinner: '#a855f7',
  snack: '#f97316',
};

// SVG Icons
function MicIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={1} width={6} height={12} rx={3} stroke="#fff" strokeWidth={1.8} />
      <Path d="M5 10a7 7 0 0014 0" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={12} y1={17} x2={12} y2={21} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={1.8} />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function FilterIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={6} x2={20} y2={6} stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={12} x2={16} y2={12} stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={11} y1={18} x2={13} y2={18} stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="#fff" strokeWidth={1.8} />
      <Path d="M12 6v6l4 2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ListIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1={8} y1={6} x2={21} y2={6} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={12} x2={21} y2={12} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={18} x2={21} y2={18} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={4} cy={6} r={1} fill="#fff" />
      <Circle cx={4} cy={12} r={1} fill="#fff" />
      <Circle cx={4} cy={18} r={1} fill="#fff" />
    </Svg>
  );
}

function ShifaBadge({ value, size = 'normal' }: { value: number; size?: 'normal' | 'small' | 'large' }) {
  const { theme } = useTheme();
  const rating = getShifaRating(value);
  const color = getShifaColor(rating);
  const bgColor = getShifaBgColor(rating);
  const label = getShifaLabel(rating);

  if (size === 'large') {
    return (
      <View style={{
        backgroundColor: bgColor, borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: `${color}30`,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
            Meal Shifa Index
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color, letterSpacing: -1, marginRight: 6 }}>{value}</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color }}>{label}</Text>
          </View>
        </View>
        <View style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: `${color}20`,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
    );
  }

  if (size === 'small') {
    return (
      <View style={{
        backgroundColor: bgColor, paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 6, flexDirection: 'row', alignItems: 'center',
      }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color, letterSpacing: 0.5 }}>
          SI {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: bgColor, paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: 8, flexDirection: 'row', alignItems: 'center',
    }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color }}>
        SI {value}
      </Text>
    </View>
  );
}

export default function LogScreen() {
  const params = useLocalSearchParams();
  const { todayLog, setTodayLog, user } = useStore();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeMeal, setActiveMeal] = useState<string>((params.meal as string) || 'breakfast');
  const [searchModal, setSearchModal] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState('100');
  const [servingUnit, setServingUnit] = useState('100g');
  const [mealDesc, setMealDesc] = useState('');
  const [describingMeal, setDescribingMeal] = useState(false);
  const [describeResults, setDescribeResults] = useState<any>(null);

  const loadLog = useCallback(async () => {
    try {
      const res = await logsAPI.getDay(today());
      setTodayLog(res.data);
    } catch (err: any) {
      console.error(err.message);
    }
  }, []);

  useEffect(() => { loadLog(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadLog(); setRefreshing(false); };

  const searchFood = async (q: string) => {
    if (!q.trim()) return setSearchResults([]);
    setSearching(true);
    try {
      const res = await foodsAPI.search(q);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addFoodToLog = async () => {
    if (!selectedFood || !grams) return;
    try {
      await logsAPI.addItem({
        date: today(),
        foodId: selectedFood.id,
        meal: activeMeal,
        grams: Number(grams),
      });
      setSearchModal(false);
      setSelectedFood(null);
      setGrams('100');
      setServingUnit('100g');
      setSearchQ('');
      setSearchResults([]);
      await loadLog();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add food');
    }
  };

  const handleDescribeMeal = async () => {
    if (!mealDesc.trim()) return;
    setDescribingMeal(true);
    try {
      const res = await aiAPI.describeFood(mealDesc.trim());
      const data = res.data;
      if (data?.foods?.length) {
        // Auto-log all detected foods
        await logsAPI.addAIItems({
          date: today(),
          meal: activeMeal,
          foods: data.foods.map((f: any) => ({
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            fiber: f.fiber || 0,
            estimatedGrams: f.estimatedGrams || 100,
            glycemicIndex: f.glycemicIndex,
            tags: f.tags || [],
          })),
        });
        setMealDesc('');
        await loadLog();
        Alert.alert('Logged!', `${data.foods.length} item(s) added to ${MEAL_LABELS[activeMeal]}`);
      } else {
        Alert.alert('No food detected', 'Try describing your meal differently.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to analyze meal description');
    } finally {
      setDescribingMeal(false);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert('Remove item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await logsAPI.deleteItem(id);
            await loadLog();
          } catch {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const totals = todayLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const items = todayLog?.items?.filter((i: any) => i.meal.toLowerCase() === activeMeal) || [];
  const mealShifa = todayLog?.mealShifa?.[activeMeal];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, letterSpacing: -0.5 }}>
              Sanctuary
            </Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <SearchIcon color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: theme.text, letterSpacing: -0.5, marginBottom: 4 }}>
          {'What did you eat\ntoday?'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Describe meal input */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: 14, padding: 12, marginTop: 12,
          flexDirection: 'row', alignItems: 'center',
          borderWidth: 1, borderColor: theme.border,
        }}>
          <TextInput
            value={mealDesc}
            onChangeText={setMealDesc}
            placeholder="Describe your meal... e.g. 2 roti with dal"
            placeholderTextColor={theme.textTertiary}
            multiline
            style={{
              flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15,
              color: theme.text, paddingVertical: 4, paddingRight: 8,
              maxHeight: 80,
            }}
            editable={!describingMeal}
            onSubmitEditing={handleDescribeMeal}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleDescribeMeal}
            disabled={describingMeal || !mealDesc.trim()}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: describingMeal || !mealDesc.trim() ? `${Colors.primary}60` : Colors.primary,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {describingMeal ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M22 2L11 13" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          onPress={() => setSearchModal(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
            borderWidth: 1, borderColor: theme.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 10 }}>
              <SearchIcon />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: theme.textTertiary }}>
              Search for food or scan
            </Text>
          </View>
          <FilterIcon />
        </TouchableOpacity>

        {/* Quick Log */}
        <TouchableOpacity style={{
          marginTop: 16, backgroundColor: theme.primaryBg, borderRadius: 14, padding: 16,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          borderWidth: 1, borderColor: theme.primaryBorder,
        }}>
          <View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              Quick Log
            </Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>Recent Meals</Text>
          </View>
          <ClockIcon />
        </TouchableOpacity>

        {/* Meal tabs */}
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Meal Log
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary }}>View History</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(MEAL_LABELS).map(([key, label]) => {
              const mealItems = todayLog?.items?.filter((i: any) => i.meal.toLowerCase() === key) || [];
              const mealCals = mealItems.reduce((s: number, i: any) => s + i.calories, 0);
              const isActive = activeMeal === key;
              const color = MEAL_COLORS[key];
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveMeal(key)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: isActive ? color : theme.surface,
                    borderWidth: 1, borderColor: isActive ? color : theme.border,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' }}>{label}</Text>
                  {mealCals > 0 && (
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: isActive ? 'rgba(255,255,255,0.8)' : theme.textTertiary, marginTop: 2 }}>
                      {Math.round(mealCals)} kcal
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Meal Shifa Index Card */}
        {mealShifa && mealShifa.shifaIndex > 0 && items.length > 0 && (
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <ShifaBadge value={mealShifa.shifaIndex} size="large" />
          </View>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 36, paddingBottom: 20 }}>
            <View style={{
              width: 60, height: 60, borderRadius: 30, backgroundColor: theme.surface,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              borderWidth: 1, borderColor: theme.border,
            }}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M17 2v6a4 4 0 01-4 4M17 2v20M21 2c0 4-2 8-4 8" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text, marginBottom: 6 }}>
              {'No ' + MEAL_LABELS[activeMeal] + ' yet'}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
              {'Add food manually or use AI Scan to\ndetect and log your meal instantly.'}
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            {items.map((item: any) => {
              const itemShifa = item.shifaIndex || 0;
              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                    marginBottom: 8, borderWidth: 1, borderColor: theme.border,
                  }}
                >
                  {/* Top row: badges */}
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    {item.aiDetected && (
                      <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                        <Text style={{ color: theme.green, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1 }}>AI</Text>
                      </View>
                    )}
                    {itemShifa > 0 && (
                      <ShifaBadge value={itemShifa} size="small" />
                    )}
                  </View>

                  {/* Main content row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 4 }}>
                        {item.food.name}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12 }}>
                        {item.grams + 'g | P: ' + Math.round(item.protein) + 'g  C: ' + Math.round(item.carbs) + 'g  F: ' + Math.round(item.fat) + 'g'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                      <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: theme.text }}>{Math.round(item.calories)}</Text>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: theme.textTertiary, letterSpacing: 1 }}>KCAL</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ padding: 6 }}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M18 6L6 18M6 6l12 12" stroke={theme.textTertiary} strokeWidth={2} strokeLinecap="round" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Manual Entry button */}
        <TouchableOpacity
          onPress={() => setSearchModal(true)}
          style={{
            marginTop: 16, backgroundColor: Colors.primary, borderRadius: 14,
            paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <View style={{ marginRight: 8 }}>
            <ListIcon />
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 15 }}>Manual Entry</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Food Search Modal */}
      <Modal visible={searchModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: theme.text }}>Search Food</Text>
            <TouchableOpacity onPress={() => { setSearchModal(false); setSelectedFood(null); }}>
              <Text style={{ color: theme.textTertiary, fontSize: 15, fontFamily: 'Inter_500Medium' }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TextInput
              value={searchQ}
              onChangeText={(t) => { setSearchQ(t); searchFood(t); }}
              placeholder="Search foods..."
              placeholderTextColor={theme.textTertiary}
              autoFocus
              style={{
                backgroundColor: theme.surface, borderRadius: 12, padding: 16,
                color: theme.text, fontFamily: 'Inter_400Regular', fontSize: 16,
                borderWidth: 1, borderColor: theme.border,
              }}
            />
          </View>

          {selectedFood ? (
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: theme.text, flex: 1 }}>{selectedFood.name}</Text>
                  <TouchableOpacity onPress={() => { setSelectedFood(null); setServingUnit('100g'); }}>
                    <Text style={{ color: theme.textTertiary, fontSize: 13 }}>Change</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: theme.textTertiary, fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 8, letterSpacing: 1.2 }}>SERVING SIZE</Text>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  {SERVING_UNITS.map((u, idx) => (
                    <TouchableOpacity
                      key={u.label}
                      onPress={() => { setServingUnit(u.label); setGrams(String(u.grams)); }}
                      style={{
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                        marginRight: idx < SERVING_UNITS.length - 1 ? 6 : 0,
                        backgroundColor: servingUnit === u.label ? Colors.primary : theme.surface2,
                        borderWidth: 1, borderColor: servingUnit === u.label ? Colors.primary : theme.border,
                      }}
                    >
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: servingUnit === u.label ? '#fff' : theme.textSecondary }}>
                        {u.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.border2 }}>
                  <TextInput
                    value={grams}
                    onChangeText={(t) => { setGrams(t); setServingUnit('custom'); }}
                    keyboardType="decimal-pad"
                    style={{ flex: 1, padding: 16, color: theme.text, fontFamily: 'Inter_700Bold', fontSize: 20 }}
                  />
                  <Text style={{ color: theme.textTertiary, fontFamily: 'Inter_500Medium', paddingRight: 16 }}>g</Text>
                </View>
                {!!grams && Number(grams) > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.surface2, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                    {[
                      { label: 'Calories', val: String(Math.round((selectedFood.calories * Number(grams)) / 100)) },
                      { label: 'Protein',  val: Math.round((selectedFood.protein  * Number(grams)) / 100) + 'g' },
                      { label: 'Carbs',    val: Math.round((selectedFood.carbs    * Number(grams)) / 100) + 'g' },
                      { label: 'Fat',      val: Math.round((selectedFood.fat      * Number(grams)) / 100) + 'g' },
                    ].map((m) => (
                      <View key={m.label} style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>{m.val}</Text>
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Shifa Index preview for selected food */}
                {selectedFood.shifaIndex != null && selectedFood.shifaIndex > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <ShifaBadge value={selectedFood.shifaIndex} size="normal" />
                  </View>
                )}

                <TouchableOpacity
                  onPress={addFoodToLog}
                  style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>
                    {'Add to ' + MEAL_LABELS[activeMeal]}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
              {searching && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}
              {searchResults.map((food: any) => (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => setSelectedFood(food)}
                  style={{
                    backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8, borderWidth: 1, borderColor: theme.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.text, fontSize: 15 }}>{food.name}</Text>
                    {food.brandName ? (
                      <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12 }}>{food.brandName}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', color: Colors.primary, fontSize: 14, marginRight: 6 }}>{Math.round(food.calories)}</Text>
                      <Text style={{ fontFamily: 'Inter_500Medium', color: theme.textTertiary, fontSize: 10 }}>kcal/100g</Text>
                    </View>
                    {food.shifaIndex != null && food.shifaIndex > 0 && (
                      <ShifaBadge value={food.shifaIndex} size="small" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              {!searching && searchQ.length > 0 && searchResults.length === 0 && (
                <Text style={{ color: theme.textTertiary, textAlign: 'center', marginTop: 40, fontFamily: 'Inter_400Regular' }}>
                  {'No results for "' + searchQ + '"'}
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
