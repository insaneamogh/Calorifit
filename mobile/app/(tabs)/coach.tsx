import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

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

function CheckCircleIcon({ color = '#10b981' }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const AI_PLAN = [
  { color: '#10b981', text: 'Increase fibre intake by adding 1 cup of spinach to lunch' },
  { color: Colors.primary, text: 'Switch to complex carbs to support sustained energy levels' },
  { color: '#f97316', text: 'Add magnesium-rich foods (almonds, seeds) pre-workout' },
  { color: '#a855f7', text: 'Maintain current protein levels, showing great results' },
];

const WEEKLY_TARGETS = [
  { label: 'Calories', current: 2100, goal: 2400, unit: 'kcal', color: Colors.primary },
  { label: 'Protein', current: 148, goal: 160, unit: 'g', color: '#f97316' },
  { label: 'Water', current: 2.1, goal: 3, unit: 'L', color: '#60a5fa' },
];

const MEAL_SUGGESTIONS = [
  { name: 'Greek Quinoa Bowl', tag: 'High Fiber', tagColor: '#10b981', kcal: 420 },
  { name: 'Wild Atlantic Salmon', tag: 'Omega-3', tagColor: Colors.primary, kcal: 380 },
];

export default function CoachScreen() {
  const { theme } = useTheme();

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
      >
        {/* Subtitle */}
        <Text style={{
          fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textSecondary,
          marginBottom: 20, lineHeight: 22,
        }}>
          Max, your nutrition stands above 85% of your age group
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
            Mind Quality Score
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 72, color: Colors.primary, letterSpacing: -3 }}>
              8.4
            </Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 22, color: theme.textTertiary, marginBottom: 10, marginLeft: 4 }}>
              /10
            </Text>
          </View>

          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 18 }}>
            Your nutrition is in the top 8% for your demographic
          </Text>

          {/* Dot indicator */}
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{
                  width: i < 4 ? 10 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i < 4 ? Colors.primary : theme.surface2,
                  marginRight: i < 4 ? 6 : 0,
                }}
              />
            ))}
          </View>
        </View>

        {/* AI Action Plan */}
        <View style={{
          backgroundColor: 'rgba(59,130,246,0.06)', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)', marginBottom: 20,
        }}>
          <Text style={{
            fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text, marginBottom: 16,
          }}>
            AI Action Plan
          </Text>

          {AI_PLAN.map((item, idx) => (
            <View
              key={idx}
              style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < AI_PLAN.length - 1 ? 14 : 0 }}
            >
              <View style={{
                width: 10, height: 10, borderRadius: 5, backgroundColor: item.color,
                marginTop: 4, marginRight: 12,
              }} />
              <Text style={{
                flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13,
                color: theme.textSecondary, lineHeight: 20,
              }}>
                {item.text}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={{
            backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
            alignItems: 'center', marginTop: 20,
          }}>
            <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 15 }}>
              Execute Plan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Targets */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Weekly Targets
          </Text>

          {WEEKLY_TARGETS.map((target, idx) => {
            const pct = Math.min(1, target.current / target.goal);
            return (
              <View
                key={idx}
                style={{
                  backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                  borderWidth: 1, borderColor: theme.border,
                  marginBottom: idx < WEEKLY_TARGETS.length - 1 ? 10 : 0,
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
                  <View style={{ height: 6, backgroundColor: target.color, borderRadius: 3, width: `${pct * 100}%` }} />
                </View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: target.color }}>
                  {target.current}{target.unit}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Meal Suggestions */}
        <View>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
            letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Meal Suggestions
          </Text>

          <View style={{ flexDirection: 'row' }}>
            {MEAL_SUGGESTIONS.map((meal, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: theme.border,
                  marginRight: idx === 0 ? 10 : 0,
                }}
              >
                <View style={{
                  backgroundColor: `${meal.tagColor}15`, paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
                }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: meal.tagColor }}>
                    {meal.tag}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: theme.text, marginBottom: 6, lineHeight: 18 }}>
                  {meal.name}
                </Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary }}>
                  {meal.kcal} kcal
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
