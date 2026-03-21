import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { useStore } from '../../store/useStore';
import { userAPI, progressAPI } from '../../services/api';
import { Colors } from '../../constants/colors';

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
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#444" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#444" strokeWidth={1.8} />
    </Svg>
  );
}

function ActivityLevelIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#888" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GoalIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="#888" strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={6} stroke="#888" strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={2} fill="#888" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#888" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#888" strokeWidth={1.8} />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#888" strokeWidth={1.8} />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke="#444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const { user, setUser, logout } = useStore();
  const [saving, setSaving] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [calModal, setCalModal] = useState(false);
  const [goalWeightModal, setGoalWeightModal] = useState(false);
  const [tempCal, setTempCal] = useState('');
  const [tempGoalWeight, setTempGoalWeight] = useState('');

  if (!user) return null;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={8} r={4} stroke="#888" strokeWidth={1.8} />
                  <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#888" strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' }}>Sanctuary</Text>
            </View>
            <TouchableOpacity style={{ padding: 4 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={11} cy={11} r={8} stroke="#666" strokeWidth={1.8} />
                <Path d="M21 21l-4.35-4.35" stroke="#666" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff', letterSpacing: -0.5 }}>
            {user.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#888', fontSize: 12 }}>{user.currentWeight} kg</Text>
            </View>
            <View style={{ backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#888', fontSize: 12 }}>{user.heightCm} cm</Text>
            </View>
          </View>
        </View>

        {/* Daily Goals Section */}
        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase' }}>
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
              backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 10,
              borderWidth: 1, borderColor: '#1a1a1a',
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
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Calories</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -1 }}>
                    {user.dailyCalGoal.toLocaleString()}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#555' }}>kcal</Text>
                </View>
              </View>
              <PencilIcon />
            </View>
          </TouchableOpacity>

          {/* Protein card */}
          <View style={{
            backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 10,
            borderWidth: 1, borderColor: '#1a1a1a',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <ProteinIcon color={Colors.tertiary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Protein</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -1 }}>
                    {user.dailyProteinGoal}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#555' }}>g</Text>
                </View>
              </View>
              <PencilIcon />
            </View>
          </View>

          {/* Carbs & Fats compact */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{
              flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16,
              borderWidth: 1, borderColor: '#1a1a1a',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CarbIcon color="#888" />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Carbs</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#fff' }}>{user.dailyCarbGoal}g</Text>
                <PencilIcon />
              </View>
            </View>
            <View style={{
              flex: 1, backgroundColor: '#111', borderRadius: 14, padding: 16,
              borderWidth: 1, borderColor: '#1a1a1a',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <FatIcon color="#888" />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Fats</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#fff' }}>{user.dailyFatGoal}g</Text>
                <PencilIcon />
              </View>
            </View>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={{ marginHorizontal: 20, marginBottom: 12, marginTop: 8 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Health Metrics
          </Text>

          {/* Starting Weight */}
          <View style={{
            backgroundColor: '#111', borderRadius: 14, padding: 18, marginBottom: 8,
            borderWidth: 1, borderColor: '#1a1a1a',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Starting Weight</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#555' }}>Jan 12</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff' }}>{user.currentWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#555' }}>kg</Text>
            </View>
          </View>

          {/* Current Weight - highlighted */}
          <View style={{
            backgroundColor: '#0c1a3d', borderRadius: 14, padding: 18, marginBottom: 8,
            borderWidth: 1, borderColor: '#1a2a5a',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Current Weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59,130,246,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary }} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary }}>Active</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff' }}>{user.currentWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#555' }}>kg</Text>
            </View>
          </View>

          {/* Goal Weight */}
          <TouchableOpacity
            onPress={() => { setTempGoalWeight(String(user.goalWeight)); setGoalWeightModal(true); }}
            style={{
              backgroundColor: '#111', borderRadius: 14, padding: 18, marginBottom: 8,
              borderWidth: 1, borderColor: '#1a1a1a',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>Goal Weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.tertiary }} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.tertiary }}>Target</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff' }}>{user.goalWeight}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#555' }}>kg</Text>
            </View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.tertiary }}>
              {weightToGoal}kg to go
            </Text>
            <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8 }}>
              <View style={{ height: 4, backgroundColor: Colors.tertiary, borderRadius: 2, width: '70%' }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Account Settings
          </Text>
          <View style={{ backgroundColor: '#111', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1a1a1a' }}>
            {[
              { icon: <ActivityLevelIcon />, label: 'Activity Level', value: `${activityLabel} (${activityDesc})`, onPress: () => setActivityModal(true) },
              { icon: <GoalIcon />, label: 'Weekly Goal', value: `${goalLabel} ${goalDesc}`, onPress: () => setGoalModal(true) },
              { icon: <BellIcon />, label: 'Reminders', value: 'Breakfast, Lunch, Dinner, Hydration', onPress: () => Alert.alert('Coming Soon', 'Reminder settings will be available in the next update.') },
              { icon: <ShieldIcon />, label: 'Privacy & Sync', value: 'Apple Health, Google Fit connected', onPress: () => Alert.alert('Privacy & Sync', 'Your data is stored securely and never shared.') },
            ].map((s, i) => (
              <TouchableOpacity
                key={s.label}
                onPress={s.onPress}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: '#1a1a1a',
                }}
              >
                <View style={{ marginRight: 14 }}>{s.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 14 }}>{s.label}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{s.value}</Text>
                </View>
                <ChevronRight />
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
        <View style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#fff', marginBottom: 20 }}>Activity Level</Text>
          {ACTIVITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={async () => { setActivityModal(false); await updateSetting({ activityLevel: opt.value }); }}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
              }}
            >
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 15 }}>{opt.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginTop: 2 }}>{opt.desc}</Text>
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
        <View style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#fff', marginBottom: 20 }}>Weekly Goal</Text>
          {GOAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={async () => { setGoalModal(false); await updateSetting({ goal: opt.value }); }}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
              }}
            >
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 15 }}>{opt.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginTop: 2 }}>{opt.desc}</Text>
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
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setCalModal(false)} />
        <View style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#fff', marginBottom: 6 }}>Daily Calorie Goal</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 14, marginBottom: 24 }}>Set a custom calorie target</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 20 }}>
            <TextInput
              value={tempCal}
              onChangeText={setTempCal}
              keyboardType="number-pad"
              autoFocus
              style={{ flex: 1, padding: 18, color: Colors.primary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
            />
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>kcal / day</Text>
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
      </Modal>

      {/* Goal Weight Modal */}
      <Modal visible={goalWeightModal} transparent animationType="slide">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setGoalWeightModal(false)} />
        <View style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#fff', marginBottom: 6 }}>Goal Weight</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 14, marginBottom: 24 }}>What is your target weight?</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 24 }}>
            <TextInput
              value={tempGoalWeight}
              onChangeText={setTempGoalWeight}
              keyboardType="decimal-pad"
              autoFocus
              style={{ flex: 1, padding: 18, color: Colors.tertiary, fontFamily: 'Inter_900Black', fontSize: 36, textAlign: 'center', letterSpacing: -1 }}
            />
            <Text style={{ color: '#555', paddingRight: 18, fontFamily: 'Inter_500Medium' }}>kg</Text>
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
      </Modal>
    </SafeAreaView>
  );
}
