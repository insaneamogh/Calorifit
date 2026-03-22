import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, Pressable, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { useStore } from '../../store/useStore';
import { userAPI, progressAPI, bodyCompAPI } from '../../services/api';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1-2 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Daily intense training' },
];

const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose Weight', desc: '-0.5 kg/week' },
  { value: 'maintain', label: 'Maintain', desc: 'Keep current weight' },
  { value: 'gain', label: 'Gain Muscle', desc: '+0.5 kg/week' },
];

// SVG Icons
function FireIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c.5 4-2 6-2 10a4 4 0 008 0c0-4-2-6-2-10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProteinIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarbIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth={1.8} />
      <Line x1={4} y1={22} x2={4} y2={15} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function FatIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function PencilIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={theme.textTertiary} strokeWidth={1.8} />
    </Svg>
  );
}

function ActivityLevelIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GoalIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={theme.textTertiary} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={6} stroke={theme.textTertiary} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={2} fill={theme.textTertiary} />
    </Svg>
  );
}

function BellIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={theme.textTertiary} strokeWidth={1.8} />
    </Svg>
  );
}

function ShieldIcon() {
  const { theme } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={theme.textTertiary} strokeWidth={1.8} />
    </Svg>
  );
}

function ChevronRight() {
  const { theme } = useTheme();
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const { user, setUser, logout } = useStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [calModal, setCalModal] = useState(false);
  const [proteinModal, setProteinModal] = useState(false);
  const [carbModal, setCarbModal] = useState(false);
  const [fatModal, setFatModal] = useState(false);
  const [goalWeightModal, setGoalWeightModal] = useState(false);
  const [tempCal, setTempCal] = useState('');
  const [tempProtein, setTempProtein] = useState('');
  const [tempCarb, setTempCarb] = useState('');
  const [tempFat, setTempFat] = useState('');
  const [tempGoalWeight, setTempGoalWeight] = useState('');
  const [bodyComp, setBodyComp] = useState<any>(null);
  const [bodyCompModal, setBodyCompModal] = useState(false);
  const [bcFields, setBcFields] = useState({
    weightKg: '', bmi: '', bodyFatPct: '', fatFreeBodyKg: '', subcutaneousFat: '',
    visceralFat: '', bodyWaterPct: '', skeletalMusclePct: '', muscleMassKg: '',
    boneMassKg: '', proteinPct: '', bmr: '', metabolicAge: '',
  });
  const [savingBc, setSavingBc] = useState(false);

  useFocusEffect(useCallback(() => {
    bodyCompAPI.getLatest().then(res => setBodyComp(res.data)).catch(() => {});
  }, []));

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ fontFamily: 'Inter_500Medium', color: theme.textSecondary, marginTop: 16, fontSize: 14 }}>
          Loading profile...
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/welcome')}
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 }}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 14 }}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const updateSetting = async (data: any) => {
    setSaving(true);
    try {
      await userAPI.updateMe(data);
      const res = await userAPI.getMe();
      setUser(res.data);
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const logCurrentWeight = async () => {
    if (!newWeight) return;
    setLoggingWeight(true);
    try {
      await progressAPI.logWeight(Number(newWeight));
      const res = await userAPI.getMe();
      setUser(res.data);
      setNewWeight('');
      Alert.alert('Weight logged', `${newWeight} kg recorded.`);
    } catch {
      Alert.alert('Error', 'Failed to log weight');
    } finally {
      setLoggingWeight(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const weightToGoal = Math.abs(user.currentWeight - user.goalWeight).toFixed(1);
  const activityLabel = ACTIVITY_OPTIONS.find(a => a.value === user.activityLevel)?.label || user.activityLevel;
  const activityDesc = ACTIVITY_OPTIONS.find(a => a.value === user.activityLevel)?.desc || '';
  const goalLabel = GOAL_OPTIONS.find(g => g.value === user.goal)?.label || user.goal;
  const goalDesc = GOAL_OPTIONS.find(g => g.value === user.goal)?.desc || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border2, marginRight: 10 }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={8} r={4} stroke={theme.textTertiary} strokeWidth={1.8} />
                  <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={theme.textTertiary} strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text }}>Sanctuary</Text>
            </View>
            <TouchableOpacity style={{ padding: 4 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={11} cy={11} r={8} stroke={theme.textSecondary} strokeWidth={1.8} />
                <Path d="M21 21l-4.35-4.35" stroke={theme.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: theme.text, letterSpacing: -0.5 }}>
            {user.name}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View style={{ backgroundColor: theme.surface2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.border2, marginRight: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.textSecondary, fontSize: 12 }}>{user.currentWeight} kg</Text>
            </View>
            <View style={{ backgroundColor: theme.surface2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.border2 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.textSecondary, fontSize: 12 }}>{user.heightCm} cm</Text>
            </View>
          </View>
        </View>

        {/* Daily Goals Section */}
        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Daily Goals
            </Text>
            <TouchableOpacity onPress={() => { setTempCal(String(user.dailyCalGoal)); setCalModal(true); }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.tertiary, fontSize: 12 }}>Adjust Targets</Text>
            </TouchableOpacity>
          </View>

          {/* Calories card */}
          <TouchableOpacity
            onPress={() => { setTempCal(String(user.dailyCalGoal)); setCalModal(true); }}
            style={{
              backgroundColor: theme.surface, borderRadius: 16, padding: 20, marginBottom: 10,
              borderWidth: 1, borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <FireIcon color={Colors.primary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Calories</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: theme.text, letterSpacing: -1, marginRight: 4 }}>
                    {user.dailyCalGoal.toLocaleString()}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textTertiary }}>kcal</Text>
                </View>
              </View>
              <PencilIcon />
            </View>
          </TouchableOpacity>

          {/* Protein card */}
          <TouchableOpacity
            onPress={() => { setTempProtein(String(user.dailyProteinGoal)); setProteinModal(true); }}
            style={{
              backgroundColor: theme.surface, borderRadius: 16, padding: 20, marginBottom: 10,
              borderWidth: 1, borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <ProteinIcon color={Colors.tertiary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Protein</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: theme.text, letterSpacing: -1, marginRight: 2 }}>
                    {user.dailyProteinGoal}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textTertiary }}>g</Text>
                </View>
              </View>
              <PencilIcon />
            </View>
          </TouchableOpacity>

          {/* Carbs & Fats compact */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => { setTempCarb(String(user.dailyCarbGoal)); setCarbModal(true); }}
              style={{
                flex: 1, backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                borderWidth: 1, borderColor: theme.border, marginRight: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ marginRight: 6 }}>
                  <CarbIcon color={theme.textTertiary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Carbs</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: theme.text }}>{user.dailyCarbGoal}g</Text>
                <PencilIcon />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setTempFat(String(user.dailyFatGoal)); setFatModal(true); }}
              style={{
                flex: 1, backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                borderWidth: 1, borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ marginRight: 6 }}>
                  <FatIcon color={theme.textTertiary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Fats</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: theme.text }}>{user.dailyFatGoal}g</Text>
                <PencilIcon />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={{ marginHorizontal: 20, marginBottom: 12, marginTop: 8 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Health Metrics
          </Text>

          {/* Starting Weight */}
          <View style={{
            backgroundColor: theme.surface, borderRadius: 14, padding: 18, marginBottom: 8,
            borderWidth: 1, borderColor: theme.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Starting Weight</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: theme.text, marginRight: 4 }}>{user.currentWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textTertiary }}>kg</Text>
            </View>
          </View>

          {/* Current Weight - highlighted */}
          <View style={{
            backgroundColor: theme.primaryBg, borderRadius: 14, padding: 18, marginBottom: 8,
            borderWidth: 1, borderColor: theme.primaryBorder,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Current Weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59,130,246,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 4 }} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary }}>Active</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: theme.text, marginRight: 4 }}>{user.currentWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textTertiary }}>kg</Text>
            </View>
          </View>

          {/* Goal Weight */}
          <TouchableOpacity
            onPress={() => { setTempGoalWeight(String(user.goalWeight)); setGoalWeightModal(true); }}
            style={{
              backgroundColor: theme.surface, borderRadius: 14, padding: 18, marginBottom: 8,
              borderWidth: 1, borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Goal Weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.tertiary, marginRight: 4 }} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.tertiary }}>Target</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: theme.text, marginRight: 4 }}>{user.goalWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textTertiary }}>kg</Text>
            </View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.tertiary }}>
              {weightToGoal}kg to go
            </Text>
            <View style={{ height: 4, backgroundColor: theme.surface3, borderRadius: 2, marginTop: 8 }}>
              <View style={{ height: 4, backgroundColor: Colors.tertiary, borderRadius: 2, width: '70%' }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Explore Section */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Explore
          </Text>
          <View style={{ backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            {[
              {
                label: 'Milestones & Rewards',
                desc: 'Track XP, streaks and trophies',
                onPress: () => router.push('/(tabs)/milestones'),
              },
              {
                label: 'Vitality AI Coach',
                desc: 'Personalized nutrition guidance',
                onPress: () => router.push('/(tabs)/coach'),
              },
              {
                label: 'Shopping & Pantry',
                desc: 'Manage your food inventory',
                onPress: () => router.push('/(tabs)/pantry'),
              },
              {
                label: 'Workout Logger',
                desc: 'Log exercises and track performance',
                onPress: () => router.push('/(tabs)/workout'),
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: theme.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.text, fontSize: 14 }}>{item.label}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
                </View>
                <ChevronRight />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Account Settings
          </Text>
          <View style={{ backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            {/* Appearance toggle row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.text, fontSize: 14 }}>Appearance</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {[
              { icon: <ActivityLevelIcon />, label: 'Activity Level', value: `${activityLabel} (${activityDesc})`, onPress: () => setActivityModal(true) },
              { icon: <GoalIcon />, label: 'Weekly Goal', value: `${goalLabel} ${goalDesc}`, onPress: () => setGoalModal(true) },
              { icon: <BellIcon />, label: 'Reminders', value: 'Breakfast, Lunch, Dinner, Hydration', onPress: () => Alert.alert('Coming Soon', 'Reminder settings will be available in the next update.') },
              { icon: <ShieldIcon />, label: 'Privacy & Sync', value: 'Data stored securely on cloud', onPress: () => Alert.alert('Privacy & Sync', 'Your data is encrypted and stored securely. Health integrations coming soon.') },
            ].map((s, i) => (
              <TouchableOpacity
                key={s.label}
                onPress={s.onPress}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: theme.border,
                }}
              >
                <View style={{ marginRight: 14 }}>{s.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.text, fontSize: 14 }}>{s.label}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{s.value}</Text>
                </View>
                <ChevronRight />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Body Composition */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Body Composition
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (bodyComp) {
                  setBcFields({
                    weightKg: String(bodyComp.weightKg || ''), bmi: String(bodyComp.bmi || ''),
                    bodyFatPct: String(bodyComp.bodyFatPct || ''), fatFreeBodyKg: String(bodyComp.fatFreeBodyKg || ''),
                    subcutaneousFat: String(bodyComp.subcutaneousFat || ''), visceralFat: String(bodyComp.visceralFat || ''),
                    bodyWaterPct: String(bodyComp.bodyWaterPct || ''), skeletalMusclePct: String(bodyComp.skeletalMusclePct || ''),
                    muscleMassKg: String(bodyComp.muscleMassKg || ''), boneMassKg: String(bodyComp.boneMassKg || ''),
                    proteinPct: String(bodyComp.proteinPct || ''), bmr: String(bodyComp.bmr || ''),
                    metabolicAge: String(bodyComp.metabolicAge || ''),
                  });
                } else {
                  setBcFields({ weightKg: String(user.currentWeight), bmi: '', bodyFatPct: '', fatFreeBodyKg: '', subcutaneousFat: '', visceralFat: '', bodyWaterPct: '', skeletalMusclePct: '', muscleMassKg: '', boneMassKg: '', proteinPct: '', bmr: '', metabolicAge: '' });
                }
                setBodyCompModal(true);
              }}
              style={{ backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.border }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary }}>{bodyComp ? 'Update' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>
          {bodyComp ? (
            <View style={{ backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, padding: 16 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: theme.textTertiary, marginBottom: 12 }}>
                {new Date(bodyComp.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {bodyComp.source !== 'manual' ? ` via ${bodyComp.source}` : ''}
              </Text>
              {/* Row 1 */}
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {[
                  { label: 'Weight', value: bodyComp.weightKg, unit: 'kg', color: Colors.primary },
                  { label: 'BMI', value: bodyComp.bmi, unit: '', color: '#f59e0b' },
                  { label: 'Body Fat', value: bodyComp.bodyFatPct, unit: '%', color: '#f97316' },
                ].map((m) => (
                  <View key={m.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: m.color, letterSpacing: -0.5 }}>
                      {m.value != null ? `${m.value}` : '--'}<Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium' }}>{m.unit}</Text>
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              {/* Row 2 */}
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {[
                  { label: 'Fat-Free', value: bodyComp.fatFreeBodyKg, unit: 'kg', color: Colors.tertiary },
                  { label: 'Subcut. Fat', value: bodyComp.subcutaneousFat, unit: '%', color: '#f97316' },
                  { label: 'Visceral Fat', value: bodyComp.visceralFat, unit: '', color: '#ef4444' },
                ].map((m) => (
                  <View key={m.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: m.color, letterSpacing: -0.5 }}>
                      {m.value != null ? `${m.value}` : '--'}<Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium' }}>{m.unit}</Text>
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              {/* Row 3 */}
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {[
                  { label: 'Body Water', value: bodyComp.bodyWaterPct, unit: '%', color: '#3b82f6' },
                  { label: 'Skel. Muscle', value: bodyComp.skeletalMusclePct, unit: '%', color: '#f59e0b' },
                  { label: 'Muscle Mass', value: bodyComp.muscleMassKg, unit: 'kg', color: Colors.tertiary },
                ].map((m) => (
                  <View key={m.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: m.color, letterSpacing: -0.5 }}>
                      {m.value != null ? `${m.value}` : '--'}<Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium' }}>{m.unit}</Text>
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              {/* Row 4 */}
              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'Bone Mass', value: bodyComp.boneMassKg, unit: 'kg', color: '#a855f7' },
                  { label: 'Protein', value: bodyComp.proteinPct, unit: '%', color: '#f97316' },
                  { label: 'BMR', value: bodyComp.bmr, unit: 'kcal', color: Colors.primary },
                ].map((m) => (
                  <View key={m.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: m.color, letterSpacing: -0.5 }}>
                      {m.value != null ? `${m.value}` : '--'}<Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium' }}>{m.unit}</Text>
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              {bodyComp.metabolicAge != null && (
                <View style={{ marginTop: 12, alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
                  <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: Colors.tertiary }}>{bodyComp.metabolicAge}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>Metabolic Age</Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setBcFields({ weightKg: String(user.currentWeight), bmi: '', bodyFatPct: '', fatFreeBodyKg: '', subcutaneousFat: '', visceralFat: '', bodyWaterPct: '', skeletalMusclePct: '', muscleMassKg: '', boneMassKg: '', proteinPct: '', bmr: '', metabolicAge: '' });
                setBodyCompModal(true);
              }}
              style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.textTertiary }}>No body composition data</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textTertiary, marginTop: 4 }}>Tap to add from your smart scale</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Health Sync */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Health Integrations
          </Text>
          <View style={{ backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            {[
              { label: 'Apple Health', desc: 'Sync weight, workouts & body metrics', icon: 'heart', color: '#ff3b30' },
              { label: 'Google Fit', desc: 'Sync activity & body composition', icon: 'activity', color: '#4285f4' },
              { label: 'FitIndex', desc: 'Import smart scale measurements', icon: 'scale', color: '#00c853' },
              { label: 'Fitbit', desc: 'Sync steps, heart rate & weight', icon: 'watch', color: '#00b0b9' },
            ].map((s, i) => (
              <TouchableOpacity
                key={s.label}
                onPress={() => Alert.alert('Coming Soon', `${s.label} integration requires a development build. This feature will be available when the app is published to the App Store / Play Store.\n\nFor now, you can manually enter your body composition data above.`)}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: theme.border,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  {s.icon === 'heart' && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={s.color} strokeWidth={1.8} />
                    </Svg>
                  )}
                  {s.icon === 'activity' && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={s.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                  {s.icon === 'scale' && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={s.color} strokeWidth={1.8} />
                      <Circle cx={12} cy={12} r={4} stroke={s.color} strokeWidth={1.8} />
                    </Svg>
                  )}
                  {s.icon === 'watch' && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Circle cx={12} cy={12} r={7} stroke={s.color} strokeWidth={1.8} />
                      <Path d="M12 9v3l1.5 1.5" stroke={s.color} strokeWidth={1.8} strokeLinecap="round" />
                      <Path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83M7.49 6.65l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83" stroke={s.color} strokeWidth={1.8} />
                    </Svg>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: theme.text, fontSize: 14 }}>{s.label}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{s.desc}</Text>
                </View>
                <View style={{ backgroundColor: theme.surface2, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: theme.textTertiary }}>SOON</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginHorizontal: 20, backgroundColor: 'rgba(248,113,113,0.08)',
            borderRadius: 14, paddingVertical: 16, alignItems: 'center',
            borderWidth: 1, borderColor: 'rgba(248,113,113,0.15)',
          }}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', color: '#f87171', fontSize: 15 }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Activity Level Modal */}
      <Modal visible={activityModal} transparent animationType="slide">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setActivityModal(false)} />
        <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 20 }}>Activity Level</Text>
          {ACTIVITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={async () => { setActivityModal(false); await updateSetting({ activityLevel: opt.value }); }}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
              }}
            >
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', color: theme.text, fontSize: 15 }}>{opt.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{opt.desc}</Text>
              </View>
              {user.activityLevel === opt.value && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Weekly Goal Modal */}
      <Modal visible={goalModal} transparent animationType="slide">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setGoalModal(false)} />
        <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 20 }}>Weekly Goal</Text>
          {GOAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={async () => { setGoalModal(false); await updateSetting({ goal: opt.value }); }}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
              }}
            >
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', color: theme.text, fontSize: 15 }}>{opt.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{opt.desc}</Text>
              </View>
              {user.goal === opt.value && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Calorie Goal Modal */}
      <Modal visible={calModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setCalModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Daily Calorie Goal</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>Set a custom calorie target</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
              <TextInput
                value={tempCal}
                onChangeText={setTempCal}
                keyboardType="number-pad"
                autoFocus
                style={{ flex: 1, padding: 18, color: Colors.primary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
              />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>kcal / day</Text>
            <TouchableOpacity
              onPress={async () => {
                const cal = Number(tempCal);
                if (!tempCal || isNaN(cal) || cal < 500 || cal > 10000) {
                  Alert.alert('Invalid', 'Enter a value between 500 and 10,000 kcal');
                  return;
                }
                setCalModal(false);
                await updateSetting({ dailyCalGoal: cal });
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Protein Goal Modal */}
      <Modal visible={proteinModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setProteinModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Daily Protein Goal</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>Set your daily protein target</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
              <TextInput
                value={tempProtein}
                onChangeText={setTempProtein}
                keyboardType="number-pad"
                autoFocus
                style={{ flex: 1, padding: 18, color: Colors.tertiary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
              />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>grams / day</Text>
            <TouchableOpacity
              onPress={async () => {
                const val = Number(tempProtein);
                if (!tempProtein || isNaN(val) || val < 10 || val > 500) {
                  Alert.alert('Invalid', 'Enter a value between 10 and 500g');
                  return;
                }
                setProteinModal(false);
                await updateSetting({ dailyProteinGoal: val });
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Carb Goal Modal */}
      <Modal visible={carbModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setCarbModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Daily Carb Goal</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>Set your daily carbohydrate target</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
              <TextInput
                value={tempCarb}
                onChangeText={setTempCarb}
                keyboardType="number-pad"
                autoFocus
                style={{ flex: 1, padding: 18, color: Colors.primary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
              />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>grams / day</Text>
            <TouchableOpacity
              onPress={async () => {
                const val = Number(tempCarb);
                if (!tempCarb || isNaN(val) || val < 10 || val > 1000) {
                  Alert.alert('Invalid', 'Enter a value between 10 and 1000g');
                  return;
                }
                setCarbModal(false);
                await updateSetting({ dailyCarbGoal: val });
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Fat Goal Modal */}
      <Modal visible={fatModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setFatModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Daily Fat Goal</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>Set your daily fat target</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 20 }}>
              <TextInput
                value={tempFat}
                onChangeText={setTempFat}
                keyboardType="number-pad"
                autoFocus
                style={{ flex: 1, padding: 18, color: '#f97316', fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
              />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>grams / day</Text>
            <TouchableOpacity
              onPress={async () => {
                const val = Number(tempFat);
                if (!tempFat || isNaN(val) || val < 10 || val > 500) {
                  Alert.alert('Invalid', 'Enter a value between 10 and 500g');
                  return;
                }
                setFatModal(false);
                await updateSetting({ dailyFatGoal: val });
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Goal Weight Modal */}
      <Modal visible={goalWeightModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setGoalWeightModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Goal Weight</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>What is your target weight?</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface2, borderRadius: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 24 }}>
              <TextInput
                value={tempGoalWeight}
                onChangeText={setTempGoalWeight}
                keyboardType="decimal-pad"
                autoFocus
                style={{ flex: 1, padding: 18, color: Colors.tertiary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
              />
              <Text style={{ color: theme.textTertiary, paddingRight: 18, fontFamily: 'Inter_500Medium' }}>kg</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const gw = Number(tempGoalWeight);
                if (!tempGoalWeight || isNaN(gw) || gw < 20 || gw > 300) {
                  Alert.alert('Invalid', 'Enter a valid goal weight');
                  return;
                }
                setGoalWeightModal(false);
                await updateSetting({ goalWeight: gw });
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Body Composition Modal */}
      <Modal visible={bodyCompModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setBodyCompModal(false)} />
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: '80%' }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text, marginBottom: 6 }}>Body Composition</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 13, marginBottom: 16 }}>Enter values from your smart scale (FitIndex, etc.)</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                { key: 'weightKg', label: 'Weight (kg)', required: true },
                { key: 'bmi', label: 'BMI' },
                { key: 'bodyFatPct', label: 'Body Fat (%)' },
                { key: 'fatFreeBodyKg', label: 'Fat-Free Body (kg)' },
                { key: 'subcutaneousFat', label: 'Subcutaneous Fat (%)' },
                { key: 'visceralFat', label: 'Visceral Fat' },
                { key: 'bodyWaterPct', label: 'Body Water (%)' },
                { key: 'skeletalMusclePct', label: 'Skeletal Muscle (%)' },
                { key: 'muscleMassKg', label: 'Muscle Mass (kg)' },
                { key: 'boneMassKg', label: 'Bone Mass (kg)' },
                { key: 'proteinPct', label: 'Protein (%)' },
                { key: 'bmr', label: 'BMR (kcal)' },
                { key: 'metabolicAge', label: 'Metabolic Age' },
              ].map((field) => (
                <View key={field.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: theme.textSecondary }}>
                    {field.label}{field.required ? ' *' : ''}
                  </Text>
                  <TextInput
                    value={(bcFields as any)[field.key]}
                    onChangeText={(v) => setBcFields(prev => ({ ...prev, [field.key]: v }))}
                    keyboardType="decimal-pad"
                    placeholder="--"
                    placeholderTextColor={theme.textTertiary}
                    style={{
                      width: 90, padding: 10, borderRadius: 10, textAlign: 'center',
                      backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
                      color: Colors.primary, fontFamily: 'Inter_700Bold', fontSize: 15,
                    }}
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={async () => {
                const w = Number(bcFields.weightKg);
                if (!bcFields.weightKg || isNaN(w) || w < 20 || w > 300) {
                  Alert.alert('Invalid', 'Weight is required');
                  return;
                }
                setSavingBc(true);
                try {
                  const d = new Date();
                  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  const payload: any = { date: dateStr, weightKg: w, source: 'manual' };
                  for (const [k, v] of Object.entries(bcFields)) {
                    if (k === 'weightKg') continue;
                    const num = Number(v);
                    if (v && !isNaN(num)) payload[k] = num;
                  }
                  const res = await bodyCompAPI.add(payload);
                  setBodyComp(res.data);
                  setBodyCompModal(false);
                  // Refresh user data since weight was updated
                  const userRes = await userAPI.getMe();
                  setUser(userRes.data);
                  Alert.alert('Saved', 'Body composition data recorded.');
                } catch (err: any) {
                  Alert.alert('Error', err.response?.data?.error || 'Failed to save');
                } finally {
                  setSavingBc(false);
                }
              }}
              style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 }}
            >
              {savingBc ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
