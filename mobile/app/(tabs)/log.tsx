import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../store/useStore';
import { logsAPI, foodsAPI } from '../../services/api';
import { Colors } from '../../constants/colors';

const today = () => new Date().toISOString().split('T')[0];

const MEAL_META: Record<string, { icon: string; color: string; label: string }> = {
  breakfast: { icon: '☀️', color: '#f59e0b', label: 'Breakfast' },
  lunch:     { icon: '🍽', color: '#10b981', label: 'Lunch'     },
  dinner:    { icon: '🌙', color: '#a855f7', label: 'Dinner'    },
  snack:     { icon: '🍪', color: '#f97316', label: 'Snacks'    },
};

export default function LogScreen() {
  const params = useLocalSearchParams();
  const { todayLog, setTodayLog, user } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeMeal, setActiveMeal] = useState<string>((params.meal as string) || 'breakfast');
  const [searchModal, setSearchModal] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState('100');

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
      setSearchQ('');
      setSearchResults([]);
      await loadLog();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add food');
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
  const items = todayLog?.items?.filter((i) => i.meal.toLowerCase() === activeMeal) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff', letterSpacing: -0.5 }}>Food Log</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/scan')}
          style={{ backgroundColor: `${Colors.primary}20`, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ fontSize: 14 }}>⊙</Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.primary, fontSize: 13 }}>AI Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Daily summary bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 16, marginBottom: 16 }}>
        {[
          { label: 'Calories', value: `${Math.round(totals.calories)}`, unit: 'kcal', color: Colors.primary },
          { label: 'Protein',  value: `${Math.round(totals.protein)}g`,  unit: '',     color: '#f97316' },
          { label: 'Carbs',    value: `${Math.round(totals.carbs)}g`,    unit: '',     color: Colors.primary },
          { label: 'Fats',     value: `${Math.round(totals.fat)}g`,      unit: '',     color: Colors.tertiary },
        ].map((m) => (
          <View key={m.label} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: m.color }}>{m.value}</Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: '#a3a3a3', marginTop: 2, letterSpacing: 0.5 }}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Meal tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
        {Object.entries(MEAL_META).map(([key, meta]) => {
          const mealItems = todayLog?.items?.filter((i) => i.meal.toLowerCase() === key) || [];
          const mealCals = mealItems.reduce((s, i) => s + i.calories, 0);
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveMeal(key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
                backgroundColor: activeMeal === key ? meta.color : '#171717',
                borderWidth: 1, borderColor: activeMeal === key ? meta.color : '#262626',
                flexDirection: 'row', alignItems: 'center', gap: 6,
              }}
            >
              <Text style={{ fontSize: 14 }}>{meta.icon}</Text>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' }}>{meta.label}</Text>
                {mealCals > 0 && <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: activeMeal === key ? 'rgba(255,255,255,0.8)' : '#a3a3a3' }}>{Math.round(mealCals)} kcal</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>{MEAL_META[activeMeal]?.icon}</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fff', marginBottom: 8 }}>
              No {MEAL_META[activeMeal]?.label} yet
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 14, textAlign: 'center' }}>
              Add food manually or use AI Scan to{'\n'}detect and log your meal instantly.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {items.map((item) => (
              <View
                key={item.id}
                style={{ backgroundColor: '#171717', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}
              >
                {item.aiDetected && (
                  <View style={{ position: 'absolute', top: 10, right: 12, backgroundColor: Colors.tertiaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: Colors.tertiaryFixed, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1 }}>AI</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', marginBottom: 4 }}>
                    {item.food.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 12 }}>
                    {item.grams}g · P: {Math.round(item.protein)}g · C: {Math.round(item.carbs)}g · F: {Math.round(item.fat)}g
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>{Math.round(item.calories)}</Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#a3a3a3', letterSpacing: 1 }}>KCAL</Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ padding: 6 }}>
                  <Text style={{ color: '#555', fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => setSearchModal(true)}
          style={{ marginTop: 20, backgroundColor: '#171717', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#262626', borderStyle: 'dashed' }}
        >
          <Text style={{ color: Colors.primary, fontSize: 20 }}>+</Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.primary, fontSize: 15 }}>
            Add to {MEAL_META[activeMeal]?.label}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Food Search Modal */}
      <Modal visible={searchModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color: '#fff' }}>Search Food</Text>
            <TouchableOpacity onPress={() => { setSearchModal(false); setSelectedFood(null); }}>
              <Text style={{ color: '#a3a3a3', fontSize: 15, fontFamily: 'Inter_500Medium' }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TextInput
              value={searchQ}
              onChangeText={(t) => { setSearchQ(t); searchFood(t); }}
              placeholder="Search foods..."
              placeholderTextColor="#404040"
              autoFocus
              style={{
                backgroundColor: '#171717', borderRadius: 14, padding: 16,
                color: '#fff', fontFamily: 'Inter_400Regular', fontSize: 16,
                borderWidth: 1, borderColor: '#262626',
              }}
            />
          </View>

          {selectedFood ? (
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ backgroundColor: '#171717', borderRadius: 16, padding: 20, gap: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fff', flex: 1 }}>{selectedFood.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedFood(null)}>
                    <Text style={{ color: '#a3a3a3', fontSize: 13 }}>Change</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>SERVING SIZE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#262626', borderRadius: 12 }}>
                    <TextInput
                      value={grams}
                      onChangeText={setGrams}
                      keyboardType="decimal-pad"
                      style={{ flex: 1, padding: 16, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }}
                    />
                    <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>grams</Text>
                  </View>
                </View>
                {grams && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#262626', borderRadius: 12, padding: 14 }}>
                    {[
                      { label: 'Calories', val: Math.round((selectedFood.calories * Number(grams)) / 100) },
                      { label: 'Protein',  val: `${Math.round((selectedFood.protein  * Number(grams)) / 100)}g` },
                      { label: 'Carbs',    val: `${Math.round((selectedFood.carbs    * Number(grams)) / 100)}g` },
                      { label: 'Fat',      val: `${Math.round((selectedFood.fat      * Number(grams)) / 100)}g` },
                    ].map((m) => (
                      <View key={m.label} style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff' }}>{m.val}</Text>
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: '#a3a3a3', marginTop: 2 }}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  onPress={addFoodToLog}
                  style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>
                    Add to {MEAL_META[activeMeal]?.label}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {searching && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}
              {searchResults.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => setSelectedFood(food)}
                  style={{ backgroundColor: '#171717', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 15 }}>{food.name}</Text>
                    {food.brandName && <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 12 }}>{food.brandName}</Text>}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', color: Colors.primary, fontSize: 14 }}>{Math.round(food.calories)}</Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 10 }}>kcal/100g</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {!searching && searchQ && searchResults.length === 0 && (
                <Text style={{ color: '#a3a3a3', textAlign: 'center', marginTop: 40, fontFamily: 'Inter_400Regular' }}>
                  No results for "{searchQ}"
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
