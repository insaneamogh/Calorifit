import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import { progressAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

export default function StatsScreen() {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statsRes, weightRes, calRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getWeight(30),
        progressAPI.getCalories(period),
      ]);
      setStats(statsRes.data);
      setWeightData(weightRes.data);
      setCaloriesData(calRes.data.data || []);
    } catch (err: any) {
      console.error(err.message);
    }
  }, [period]);

  useEffect(() => { load(); }, [period]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Build weight sparkline
  const buildWeightLine = () => {
    if (weightData.length < 2) return null;
    const weights = weightData.map((d) => d.weightKg);
    const min = Math.min(...weights) - 0.5;
    const max = Math.max(...weights) + 0.5;
    const range = max - min || 1;
    const H = 80;
    const W = CHART_WIDTH;
    const pts = weightData.map((d, i) => {
      const x = (i / (weightData.length - 1)) * W;
      const y = H - ((d.weightKg - min) / range) * H;
      return `${x},${y}`;
    });
    return pts.join(' ');
  };

  // Build calories bars
  const barData = caloriesData.slice(-7);
  const maxCal = Math.max(...barData.map((d) => d.calories), user?.dailyCalGoal || 2000);
  const barW = CHART_WIDTH / Math.max(barData.length, 1) - 6;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Performance Hub</Text>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.8 }}>Deep Analytics</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([7, 30] as const).map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setPeriod(d)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: period === d ? Colors.primary : '#171717' }}
              >
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: period === d ? '#fff' : '#a3a3a3' }}>
                  {d} Days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Streak + Milestone */}
        {stats && (
          <View style={{ marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: Colors.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Active Streak
              </Text>
            </View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 52, color: '#fff', letterSpacing: -2 }}>
              {stats.streak}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 13 }}>Days of consistency</Text>

            {stats.streak < 30 && (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 12 }}>Next Milestone</Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 12 }}>30 Days</Text>
                </View>
                <View style={{ height: 6, backgroundColor: '#262626', borderRadius: 4 }}>
                  <View style={{ height: 6, backgroundColor: Colors.primary, borderRadius: 4, width: `${Math.min(100, (stats.streak / 30) * 100)}%` }} />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Weight progression */}
        {weightData.length > 0 && stats && (
          <View style={{ marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>Weight Progression</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 12, marginTop: 2 }}>
                  Avg loss: {Math.abs((stats.totalLost / 30) || 0).toFixed(1)} kg / week
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color: '#fff' }}>{stats.currentWeight} kg</Text>
                {stats.totalLost !== 0 && (
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: stats.totalLost > 0 ? Colors.tertiary : '#f87171' }}>
                    {stats.totalLost > 0 ? '-' : '+'}{Math.abs(stats.totalLost)} kg total
                  </Text>
                )}
              </View>
            </View>
            {buildWeightLine() ? (
              <Svg width={CHART_WIDTH} height={80}>
                <Polyline
                  points={buildWeightLine()!}
                  fill="none"
                  stroke={Colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {weightData.map((d, i) => {
                  const weights = weightData.map((dd) => dd.weightKg);
                  const min = Math.min(...weights) - 0.5;
                  const max = Math.max(...weights) + 0.5;
                  const range = max - min || 1;
                  const x = (i / (weightData.length - 1)) * CHART_WIDTH;
                  const y = 80 - ((d.weightKg - min) / range) * 80;
                  return <Circle key={i} cx={x} cy={y} r={3} fill={Colors.primary} />;
                })}
              </Svg>
            ) : (
              <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_400Regular', fontSize: 13 }}>Not enough data yet</Text>
            )}
          </View>
        )}

        {/* Weekly Intake bar chart */}
        {barData.length > 0 && (
          <View style={{ marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>Weekly Intake</Text>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                {[{ label: 'In-Take', color: Colors.primary }, { label: 'Target', color: Colors.tertiary }].map((l) => (
                  <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color }} />
                    <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 11 }}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Svg width={CHART_WIDTH} height={100}>
              {barData.map((d, i) => {
                const x = i * ((CHART_WIDTH) / barData.length) + 4;
                const barHeight = (d.calories / maxCal) * 90;
                const targetHeight = ((user?.dailyCalGoal || 2000) / maxCal) * 90;
                const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' });
                return (
                  <G key={i}>
                    <Rect x={x} y={100 - barHeight} width={barW * 0.55} height={barHeight} rx={4} fill={Colors.primary} opacity={0.85} />
                    <Rect x={x + barW * 0.6} y={100 - targetHeight} width={barW * 0.4} height={targetHeight} rx={4} fill={Colors.tertiary} opacity={0.6} />
                  </G>
                );
              })}
            </Svg>
          </View>
        )}

        {/* Bio markers */}
        {stats && (
          <View style={{ marginHorizontal: 20 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fff', marginBottom: 14 }}>Bio-Markers</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Start Weight', value: `${stats.startWeight || '-'} kg`, icon: '⚖️' },
                { label: 'Current Weight', value: `${stats.currentWeight || '-'} kg`, icon: '📊' },
                { label: 'Goal Weight', value: `${stats.goalWeight || '-'} kg`, icon: '🎯' },
                { label: 'Avg Calories', value: `${stats.avgCalories || 0} kcal`, icon: '🔥' },
              ].map((m) => (
                <View key={m.label} style={{ width: (CHART_WIDTH - 10) / 2, backgroundColor: '#171717', borderRadius: 16, padding: 16 }}>
                  <Text style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</Text>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#fff' }}>{m.value}</Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#a3a3a3', marginTop: 4 }}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
