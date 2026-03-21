import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Rect, G, Text as SvgText, Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { progressAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

// SVG Icons
function FireIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c.5 4-2 6-2 10a4 4 0 008 0c0-4-2-6-2-10" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SettingsIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke="#666" strokeWidth={1.8} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#666" strokeWidth={1.5} />
    </Svg>
  );
}

function WaterIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke="#60a5fa" strokeWidth={1.8} />
    </Svg>
  );
}

function MoonSmallIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#818cf8" strokeWidth={1.8} />
    </Svg>
  );
}

function ActivityIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#f87171" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function StatsScreen() {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [refreshing, setRefreshing] = useState(false);

  const periodDays = period === 'Day' ? 1 : period === 'Week' ? 7 : 30;

  const load = useCallback(async () => {
    try {
      const [statsRes, weightRes, calRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getWeight(30),
        progressAPI.getCalories(periodDays),
      ]);
      setStats(statsRes.data);
      setWeightData(weightRes.data);
      setCaloriesData(calRes.data.data || []);
    } catch (err: any) {
      console.error(err.message);
    }
  }, [periodDays]);

  useEffect(() => { load(); }, [periodDays]);

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
  const barW = CHART_WIDTH / Math.max(barData.length, 1) - 8;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Avg macros
  const avgCals = stats?.avgCalories || 0;
  const weeklyChange = stats?.totalLost ? ((stats.totalLost / (stats.currentWeight || 80)) * 100).toFixed(0) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: Colors.primary, letterSpacing: -0.3 }}>
              Kinetic Sanctuary
            </Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <SettingsIcon />
          </TouchableOpacity>
        </View>

        {/* Consistency Peak Card */}
        {stats && (
          <View style={{
            marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 14,
          }}>
            <View style={{
              backgroundColor: '#0a1a5a', padding: 24, borderRadius: 20,
              borderWidth: 1, borderColor: '#1a2a6a',
            }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#60a5fa', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Consistency Peak
              </Text>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 44, color: '#fff', letterSpacing: -2, marginBottom: 4 }}>
                {stats.streak} Days
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 20 }}>
                You're in the top 2% of the{'\n'}sanctuary members this month.
              </Text>
              <View style={{
                position: 'absolute', bottom: 20, right: 20,
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <FireIcon />
              </View>
            </View>
          </View>
        )}

        {/* Weight Dynamics Card */}
        {weightData.length > 0 && stats && (
          <View style={{
            marginHorizontal: 20, backgroundColor: '#111', borderRadius: 18, padding: 20, marginBottom: 14,
            borderWidth: 1, borderColor: '#1a1a1a',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>Weight Dynamics</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginTop: 2 }}>
                  Last 30 Days Trend
                </Text>
              </View>
              {stats.totalLost !== 0 && (
                <View style={{
                  backgroundColor: stats.totalLost > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
                  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: stats.totalLost > 0 ? Colors.tertiary : '#f87171' }}>
                    {stats.totalLost > 0 ? '-' : '+'}{Math.abs(stats.totalLost)}kg
                  </Text>
                </View>
              )}
            </View>
            {buildWeightLine() ? (
              <Svg width={CHART_WIDTH} height={80}>
                <Polyline
                  points={buildWeightLine()!}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={2}
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
                  if (i === weightData.length - 1) {
                    return <Circle key={i} cx={x} cy={y} r={4} fill="#38bdf8" stroke="#000" strokeWidth={2} />;
                  }
                  return null;
                })}
              </Svg>
            ) : (
              <Text style={{ color: '#555', fontFamily: 'Inter_400Regular', fontSize: 13 }}>Not enough data yet</Text>
            )}
          </View>
        )}

        {/* Vitality Split (Macros) */}
        <View style={{
          marginHorizontal: 20, backgroundColor: '#111', borderRadius: 18, padding: 20, marginBottom: 14,
          borderWidth: 1, borderColor: '#1a1a1a',
        }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', marginBottom: 4 }}>Vitality Split</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#555', marginBottom: 20 }}>Average macros</Text>

          {[
            { label: 'Protein', value: user?.dailyProteinGoal || 150, color: Colors.primary, pct: 0.65 },
            { label: 'Carbs',   value: user?.dailyCarbGoal || 250,   color: Colors.tertiary, pct: 0.80 },
            { label: 'Fats',    value: user?.dailyFatGoal || 65,     color: '#888',          pct: 0.40 },
          ].map((m) => (
            <View key={m.label} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#888', fontSize: 13 }}>{m.label}</Text>
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 14 }}>{m.value}g</Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <View style={{ height: 4, backgroundColor: m.color, borderRadius: 2, width: `${m.pct * 100}%` }} />
              </View>
            </View>
          ))}

          <TouchableOpacity style={{
            backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            borderWidth: 1, borderColor: '#2a2a2a',
          }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 13 }}>Full Micronutrients</Text>
          </TouchableOpacity>
        </View>

        {/* Fuel Consumption (weekly bars) */}
        {barData.length > 0 && (
          <View style={{
            marginHorizontal: 20, backgroundColor: '#111', borderRadius: 18, padding: 20, marginBottom: 14,
            borderWidth: 1, borderColor: '#1a1a1a',
          }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', marginBottom: 2 }}>Fuel Consumption</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginBottom: 16 }}>
              Weekly Average: {avgCals.toLocaleString()} kcal
            </Text>

            {/* Period tabs */}
            <View style={{ flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 10, padding: 3, marginBottom: 20, alignSelf: 'flex-start' }}>
              {(['Day', 'Week'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p as any)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8,
                    backgroundColor: period === p ? '#2a2a2a' : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: period === p ? '#fff' : '#555' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Svg width={CHART_WIDTH} height={120}>
              {barData.map((d, i) => {
                const x = i * ((CHART_WIDTH) / barData.length) + 4;
                const barHeight = (d.calories / maxCal) * 100;
                const overGoal = d.calories > (user?.dailyCalGoal || 2000);
                return (
                  <G key={i}>
                    <Rect
                      x={x + barW * 0.15}
                      y={120 - barHeight}
                      width={barW * 0.7}
                      height={barHeight}
                      rx={4}
                      fill={overGoal ? '#f87171' : Colors.primary}
                      opacity={0.85}
                    />
                  </G>
                );
              })}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
              {barData.map((d, i) => {
                const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);
                return (
                  <Text key={i} style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: '#555' }}>{day}</Text>
                );
              })}
            </View>
          </View>
        )}

        {/* Health tracker cards */}
        <View style={{ marginHorizontal: 20, gap: 10, marginBottom: 14 }}>
          {[
            { icon: <WaterIcon />, label: 'Hydration', desc: '+15% vs last week', bg: '#0c1a3d', border: '#1a2a5a' },
            { icon: <MoonSmallIcon />, label: 'Sleep Quality', desc: '8.2h avg duration', bg: '#111', border: '#1a1a1a' },
            { icon: <ActivityIcon />, label: 'Activity Level', desc: 'Highly Active', bg: '#111', border: '#1a1a1a' },
          ].map((item) => (
            <View key={item.label} style={{
              backgroundColor: item.bg, borderRadius: 16, padding: 18,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1, borderColor: item.border,
            }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {item.icon}
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' }}>{item.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#555', marginTop: 2 }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
