import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Rect, G, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Line } from 'react-native-svg';
import { progressAPI, exerciseAPI, waterAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const CHART_W = width - 48;

export default function StatsScreen() {
  const { user, waterToday } = useStore();
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [exerciseCals, setExerciseCals] = useState(0);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statsRes, weightRes, calRes, exRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getWeight(30),
        progressAPI.getCalories(period),
        exerciseAPI.getDay((() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setWeightData(weightRes.data || []);
      setCaloriesData(calRes.data?.data || []);
      const exData = Array.isArray(exRes.data) ? exRes.data : [];
      setExerciseCals(exData.reduce((s: number, e: any) => s + (e.caloriesBurned || 0), 0));
    } catch (e) { console.log(e); }
  }, [period]);

  useEffect(() => { load(); }, [period]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const streak = stats?.streak || 0;
  const currentWeight = stats?.currentWeight || user?.currentWeight || 0;
  const totalLost = stats?.totalLost || 0;
  const avgCals = stats?.avgCalories || 0;

  // Weight chart
  const wPts = (() => {
    if (weightData.length < 2) return null;
    const wArr = weightData.map(d => d.weightKg);
    const mn = Math.min(...wArr) - 1;
    const mx = Math.max(...wArr) + 1;
    const rng = mx - mn || 1;
    const H = 70;
    return weightData.map((d, i) => `${(i / (weightData.length - 1)) * CHART_W},${H - ((d.weightKg - mn) / rng) * H}`).join(' ');
  })();

  // Bar chart
  const bars = caloriesData.slice(-7);
  const maxCal = Math.max(...bars.map(d => d.calories), user?.dailyCalGoal || 2000, 100);
  const barSlot = CHART_W / Math.max(bars.length, 7);
  const barW = barSlot * 0.55;

  const hydrationL = ((waterToday || 0) / 1000).toFixed(1);
  const hydrationGoalL = ((user?.dailyWaterGoalMl || 2500) / 1000).toFixed(1);
  const hydrationPct = Math.round(((waterToday || 0) / (user?.dailyWaterGoalMl || 2500)) * 100);

  const bioMarkers = [
    { label: 'Streak', value: String(streak), unit: 'd', sub: streak >= 7 ? 'On fire!' : 'Keep going', color: theme.orange },
    { label: 'Active Cal', value: exerciseCals > 0 ? String(Math.round(exerciseCals)) : '--', unit: '', sub: exerciseCals > 0 ? 'Burned today' : 'Log exercise', color: Colors.primary },
    { label: 'Avg Intake', value: avgCals > 0 ? String(avgCals) : '--', unit: '', sub: avgCals > 0 ? 'kcal/day' : 'No data', color: theme.green },
    { label: 'Hydration', value: `${hydrationL}L`, unit: '', sub: `${hydrationPct}% of ${hydrationGoalL}L`, color: '#60a5fa' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme.primaryBg, borderWidth: 1, borderColor: theme.primaryBorder, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: Colors.primary, letterSpacing: -0.3 }}>Kinetic Sanctuary</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={3} stroke={theme.textSecondary} strokeWidth={1.8} />
              <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={theme.textSecondary} strokeWidth={1.5} />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Performance Hub */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16, marginTop: 8 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Performance Hub</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: theme.text, letterSpacing: -0.5 }}>Deep Analytics</Text>
            <View style={{ flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 20, padding: 3, borderWidth: 1, borderColor: theme.border }}>
              {([7, 30] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: period === p ? Colors.primary : 'transparent' }}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: period === p ? '#fff' : theme.textSecondary }}>
                    {p} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Active Streak */}
        <View style={{ marginHorizontal: 20, backgroundColor: theme.primaryBg, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.primaryBorder }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#fff', letterSpacing: 1 }}>ACTIVE STREAK</Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 52, color: theme.text, letterSpacing: -2, lineHeight: 56 }}>{streak}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>Days of consistency</Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2c.5 4-2 6-2 10a4 4 0 008 0c0-4-2-6-2-10" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textSecondary }}>Next Milestone</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary }}>30 Days</Text>
            </View>
            <View style={{ height: 5, backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 3 }}>
              <View style={{ height: 5, backgroundColor: Colors.primary, borderRadius: 3, width: `${Math.min(100, (streak / 30) * 100)}%` }} />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: theme.textSecondary, marginTop: 5 }}>
              {Math.max(0, 30 - streak)} days until 'Consistency Pro' badge
            </Text>
          </View>
        </View>

        {/* Weight Progression */}
        <View style={{ marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>Weight Progression</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                Average loss: {totalLost > 0 ? (totalLost / 4).toFixed(1) : '0.0'} kg/week
              </Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color: theme.text, textAlign: 'right' }}>
                {currentWeight} kg
              </Text>
              {totalLost !== 0 && (
                <View style={{ backgroundColor: totalLost > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-end', marginTop: 4 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: totalLost > 0 ? theme.green : theme.red }}>
                    {totalLost > 0 ? '−' : '+'}{Math.abs(totalLost)} kg total
                  </Text>
                </View>
              )}
            </View>
          </View>
          {wPts ? (
            <Svg width={CHART_W} height={80}>
              <Defs>
                <SvgLinearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#38bdf8" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Polyline points={wPts} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : (
            <View style={{ height: 70, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textSecondary, fontSize: 13 }}>Log weight to see progression</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            {['WK 1', 'WK 2', 'WK 3', 'WK 4'].map(w => (
              <Text key={w} style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: theme.textTertiary }}>{w}</Text>
            ))}
          </View>
        </View>

        {/* Weekly Intake Chart */}
        <View style={{ marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>Weekly Intake</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: 4 }} />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textSecondary }}>IN TAKE</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.green, marginRight: 4 }} />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textSecondary }}>TARGET</Text>
              </View>
            </View>
          </View>
          {bars.length > 0 ? (
            <Svg width={CHART_W} height={110}>
              {bars.map((d, i) => {
                const x = i * barSlot + barSlot * 0.225;
                const bH = Math.max(4, (d.calories / maxCal) * 90);
                return (
                  <G key={i}>
                    <Rect x={x} y={90 - bH} width={barW} height={bH} rx={4} fill={Colors.primary} opacity={0.85} />
                  </G>
                );
              })}
              {/* Target line */}
              <Line
                x1={0} y1={90 - ((user?.dailyCalGoal || 2000) / maxCal) * 90}
                x2={CHART_W} y2={90 - ((user?.dailyCalGoal || 2000) / maxCal) * 90}
                stroke={theme.green} strokeWidth={1.5} strokeDasharray="4,4" opacity={0.6}
              />
            </Svg>
          ) : (
            <View style={{ height: 110, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textSecondary, fontSize: 13 }}>No data yet</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 }}>
            {(bars.length > 0 ? bars : Array(7).fill(null)).map((d, i) => {
              const label = d ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1) : ['M','T','W','T','F','S','S'][i];
              return <Text key={i} style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: theme.textTertiary }}>{label}</Text>;
            })}
          </View>
        </View>

        {/* Weekly Average Macros */}
        <View style={{ marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>Weekly Average Macros</Text>
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary, marginBottom: 16 }}>
            {avgCals > 0 ? `${Math.round(avgCals).toLocaleString()} kcal avg/day` : 'Log meals to see averages'}
          </Text>
          {(() => {
            const days = caloriesData.length || 1;
            const avgP = Math.round(caloriesData.reduce((s, d) => s + (d.protein || 0), 0) / days);
            const avgC = Math.round(caloriesData.reduce((s, d) => s + (d.carbs || 0), 0) / days);
            const avgF = Math.round(caloriesData.reduce((s, d) => s + (d.fat || 0), 0) / days);
            return [
              { label: 'Protein', value: avgP || 0, goal: user?.dailyProteinGoal || 150, color: Colors.primary },
              { label: 'Carbs', value: avgC || 0, goal: user?.dailyCarbGoal || 250, color: theme.green },
              { label: 'Fats', value: avgF || 0, goal: user?.dailyFatGoal || 65, color: theme.orange },
            ];
          })().map((m) => (
            <View key={m.label} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', color: theme.textSecondary, fontSize: 13 }}>{m.label}</Text>
                <Text style={{ fontFamily: 'Inter_700Bold', color: theme.text, fontSize: 14 }}>{m.value}g</Text>
              </View>
              <View style={{ height: 6, backgroundColor: theme.surface2, borderRadius: 3 }}>
                <View style={{ height: 6, backgroundColor: m.color, borderRadius: 3, width: `${Math.min(100, (m.value / (m.goal || 1)) * 100)}%` }} />
              </View>
            </View>
          ))}
        </View>

        {/* Insight Cards */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <TouchableOpacity style={{ backgroundColor: theme.primaryBg, borderRadius: 14, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: theme.primaryBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 3 }}>Protein Efficiency</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary }}>
                {caloriesData.length > 0 ? `Averaging ${Math.round(caloriesData.reduce((s, d) => s + (d.protein || 0), 0) / caloriesData.length)}g/day` : 'Start logging to see trends'}
              </Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59,130,246,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ backgroundColor: theme.surface, borderRadius: 14, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 3 }}>Sleep & Recovery</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary }}>Correlation with lower intake</Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(129,140,248,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#818cf8" strokeWidth={1.8} />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ backgroundColor: theme.surface, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text, marginBottom: 3 }}>Export PDF Report</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textSecondary }}>Detailed monthly analysis</Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={theme.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bio-Markers */}
        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: theme.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Bio-Markers</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {bioMarkers.map((b, i) => (
              <View key={b.label} style={{ width: '48%', backgroundColor: theme.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: theme.border, marginRight: i % 2 === 0 ? '4%' : 0, marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textSecondary, marginBottom: 6 }}>{b.label}</Text>
                <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: theme.text, letterSpacing: -0.5 }}>
                  {b.value}<Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: theme.textSecondary }}>{b.unit}</Text>
                </Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: b.color, marginTop: 4 }}>{b.sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
