import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { userAPI, progressAPI } from '../../services/api';
import { Colors } from '../../constants/colors';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active (3-5 days/week)',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
};

const GOAL_LABELS: Record<string, string> = {
  lose: 'Lose 0.5 kg per week',
  maintain: 'Maintain weight',
  gain: 'Gain 0.5 kg per week',
};

export default function ProfileScreen() {
  const { user, setUser, logout } = useStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const logCurrentWeight = async () => {
    if (!newWeight) return;
    setLoggingWeight(true);
    try {
      await progressAPI.logWeight(Number(newWeight));
      const res = await userAPI.getMe();
      setUser(res.data);
      setNewWeight('');
      Alert.alert('Weight logged!', `${newWeight} kg recorded.`);
    } catch {
      Alert.alert('Error', 'Failed to log weight');
    } finally {
      setLoggingWeight(false);
    }
  };

  const weightToGoal = Math.abs(user.currentWeight - user.goalWeight).toFixed(1);
  const weightProgress = user.goalWeight < user.currentWeight
    ? Math.max(0, Math.min(100, ((user.currentWeight - user.goalWeight) / (user.currentWeight - user.goalWeight + 5)) * 100))
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${Colors.primary}20`, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: `${Colors.primary}40` }}>
                <Text style={{ fontSize: 24 }}>⚡</Text>
              </View>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: '#fff', letterSpacing: -0.5 }}>
                {user.name}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 14, marginTop: 2 }}>
                {user.currentWeight} kg · {user.heightCm} cm
              </Text>
            </View>
          </View>
        </View>

        {/* Log weight */}
        <View style={{ marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', marginBottom: 12 }}>Log Today's Weight</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#262626', borderRadius: 12 }}>
              <TextInput
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder={`${user.currentWeight}`}
                placeholderTextColor="#555"
                style={{ flex: 1, padding: 14, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 }}
              />
              <Text style={{ color: '#a3a3a3', paddingRight: 14, fontFamily: 'Inter_500Medium' }}>kg</Text>
            </View>
            <TouchableOpacity
              onPress={logCurrentWeight}
              disabled={loggingWeight || !newWeight}
              style={{ backgroundColor: newWeight ? Colors.primary : '#262626', borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}
            >
              {loggingWeight ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>Log</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Goals */}
        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Daily Goals
          </Text>
          <View style={{ gap: 10 }}>
            {[
              { label: 'Calories', value: `${user.dailyCalGoal.toLocaleString()} kcal`, icon: '🔥', color: Colors.primary },
              { label: 'Protein',  value: `${user.dailyProteinGoal} g`,                icon: '💪', color: '#f97316' },
              { label: 'Carbs',    value: `${user.dailyCarbGoal} g`,                   icon: '🌾', color: Colors.primary },
              { label: 'Fats',     value: `${user.dailyFatGoal} g`,                    icon: '🥑', color: Colors.tertiary },
            ].map((g) => (
              <View key={g.label} style={{ backgroundColor: '#171717', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${g.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>{g.icon}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' }}>{g.label}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: g.color }}>{g.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health Metrics */}
        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Health Metrics
          </Text>
          <View style={{ backgroundColor: '#171717', borderRadius: 20, padding: 20, gap: 14 }}>
            {[
              { label: 'Current Weight', value: `${user.currentWeight} kg`, badge: 'ACTIVE', badgeColor: Colors.primary },
              { label: 'Goal Weight',    value: `${user.goalWeight} kg`,    badge: 'TARGET', badgeColor: Colors.tertiary },
              { label: 'Height',         value: `${user.heightCm} cm`,      badge: null },
              { label: 'Age',            value: `${user.age} yrs`,          badge: null },
            ].map((m) => (
              <View key={m.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#262626' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 14 }}>{m.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {m.badge && (
                    <View style={{ backgroundColor: `${m.badgeColor}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: m.badgeColor, letterSpacing: 1 }}>{m.badge}</Text>
                    </View>
                  )}
                  <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 15 }}>{m.value}</Text>
                </View>
              </View>
            ))}

            {/* Goal progress */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 13 }}>
                  {weightToGoal} kg to goal
                </Text>
                <Text style={{ fontFamily: 'Inter_700Bold', color: Colors.tertiary, fontSize: 13 }}>
                  {user.goal === 'lose' ? 'Losing' : user.goal === 'gain' ? 'Gaining' : 'Maintaining'}
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#262626', borderRadius: 4 }}>
                <View style={{ height: 6, backgroundColor: Colors.tertiary, borderRadius: 4, width: `${Math.min(100, weightProgress)}%` }} />
              </View>
            </View>
          </View>
        </View>

        {/* Account settings */}
        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Account Settings
          </Text>
          <View style={{ backgroundColor: '#171717', borderRadius: 20, overflow: 'hidden' }}>
            {[
              { icon: '🏃', label: 'Activity Level', value: ACTIVITY_LABELS[user.activityLevel] || user.activityLevel },
              { icon: '🎯', label: 'Weekly Goal', value: GOAL_LABELS[user.goal] || user.goal },
              { icon: '🔔', label: 'Reminders', value: 'Breakfast, Lunch, Dinner, Hydration' },
              { icon: '🔒', label: 'Privacy & Sync', value: 'Google Fit connected' },
            ].map((s, i) => (
              <TouchableOpacity
                key={s.label}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: '#262626',
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 14 }}>{s.label}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 12, marginTop: 1 }} numberOfLines={1}>{s.value}</Text>
                </View>
                <Text style={{ color: '#555', fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginHorizontal: 20, backgroundColor: '#171717', borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#2a0000' }}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', color: '#f87171', fontSize: 16 }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
