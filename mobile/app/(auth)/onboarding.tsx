import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';

const TOTAL_STEPS = 5;
const { width } = Dimensions.get('window');

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Typical office job; little to no exercise.' },
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Active daily life or light exercise 1-2 times/week.' },
  { value: 'moderately_active', label: 'Moderately Active', desc: 'Intense exercise or sports 3-5 times/week.' },
  { value: 'very_active', label: 'Very Active', desc: 'Heavy physical labor or daily intense training.' },
];

const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose Weight', icon: '📉' },
  { value: 'maintain', label: 'Maintain', icon: '⚖️' },
  { value: 'gain', label: 'Gain Muscle', icon: '📈' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useStore();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('other');
  const [heightCm, setHeightCm] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [goal, setGoal] = useState('maintain');

  const tdeeEstimate = () => {
    if (!age || !currentWeight || !activityLevel) return null;
    const multipliers: Record<string, number> = {
      sedentary: 1.2, lightly_active: 1.375,
      moderately_active: 1.55, very_active: 1.725,
    };
    const bmr = 10 * Number(currentWeight) + 6.25 * Number(heightCm || 170) - 5 * Number(age) + 5;
    const tdee = bmr * (multipliers[activityLevel] || 1.55);
    const adj = goal === 'lose' ? -500 : goal === 'gain' ? 300 : 0;
    return Math.round(tdee + adj);
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const register = async () => {
    setLoading(true);
    try {
      const res = await authAPI.register({
        email, password, name,
        age: Number(age),
        gender,
        heightCm: Number(heightCm) || 170,
        currentWeight: Number(currentWeight),
        goalWeight: Number(goalWeight) || Number(currentWeight),
        activityLevel,
        goal,
      });
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = (step / TOTAL_STEPS) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Progress bar */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: Colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 2 }}>
            STEP {String(step).padStart(2, '0')} OF {String(TOTAL_STEPS).padStart(2, '0')}
          </Text>
          {step > 1 && (
            <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
              {['', 'Account', 'Body', 'Goal', 'Activity', 'Review'][step]}
            </Text>
          )}
        </View>
        <View style={{ height: 3, backgroundColor: '#262626', borderRadius: 4 }}>
          <View style={{
            height: 3, backgroundColor: Colors.primary,
            borderRadius: 4, width: `${progressWidth}%`,
          }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: Account */}
        {step === 1 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Create your{'\n'}<Text style={{ color: Colors.primary }}>Sanctuary</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 40, lineHeight: 22 }}>
              Let's set up your account to get started.
            </Text>
            <View style={{ gap: 14 }}>
              {[
                { value: name, setter: setName, placeholder: 'Your name', keyboardType: 'default' as const },
                { value: email, setter: setEmail, placeholder: 'Email address', keyboardType: 'email-address' as const },
                { value: password, setter: setPassword, placeholder: 'Password (min 8 chars)', keyboardType: 'default' as const, secure: true },
              ].map((field, i) => (
                <TextInput
                  key={i}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor="#404040"
                  keyboardType={field.keyboardType}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                  style={{
                    backgroundColor: '#171717', borderRadius: 14,
                    padding: 18, color: '#fff',
                    fontFamily: 'Inter_400Regular', fontSize: 16,
                    borderWidth: 1, borderColor: '#262626',
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: Body metrics */}
        {step === 2 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Your{'\n'}<Text style={{ color: Colors.primary }}>body metrics</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 40 }}>
              We use this to calculate your precise daily calorie target.
            </Text>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: 14,
                      backgroundColor: gender === g ? Colors.primary : '#171717',
                      borderWidth: 1, borderColor: gender === g ? Colors.primary : '#262626',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: gender === g ? '#fff' : '#a3a3a3', fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'capitalize' }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {[
                { label: 'Age', value: age, setter: setAge, unit: 'yrs' },
                { label: 'Height', value: heightCm, setter: setHeightCm, unit: 'cm' },
                { label: 'Current Weight', value: currentWeight, setter: setCurrentWeight, unit: 'kg' },
              ].map((f) => (
                <View key={f.label}>
                  <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>
                    {f.label.toUpperCase()}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717', borderRadius: 14, borderWidth: 1, borderColor: '#262626' }}>
                    <TextInput
                      value={f.value}
                      onChangeText={f.setter}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#404040"
                      placeholder="0"
                      style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_500Medium', fontSize: 16 }}
                    />
                    <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', paddingRight: 18 }}>{f.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: Goal */}
        {step === 3 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Define your{'\n'}<Text style={{ color: Colors.primary }}>kinetic target</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 40 }}>
              What's your primary fitness goal?
            </Text>
            <View style={{ gap: 14 }}>
              {GOAL_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  onPress={() => setGoal(g.value)}
                  style={{
                    backgroundColor: goal === g.value ? '#001a4d' : '#171717',
                    borderRadius: 16, padding: 20,
                    flexDirection: 'row', alignItems: 'center', gap: 16,
                    borderWidth: 1.5,
                    borderColor: goal === g.value ? Colors.primary : '#262626',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>{g.label}</Text>
                  </View>
                  {goal === g.value && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>
                  GOAL WEIGHT
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717', borderRadius: 14, borderWidth: 1, borderColor: '#262626' }}>
                  <TextInput
                    value={goalWeight}
                    onChangeText={setGoalWeight}
                    keyboardType="decimal-pad"
                    placeholder={currentWeight || '72'}
                    placeholderTextColor="#404040"
                    style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_500Medium', fontSize: 16 }}
                  />
                  <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', paddingRight: 18 }}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: Activity level */}
        {step === 4 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              What is your{'\n'}<Text style={{ color: Colors.primary }}>Activity Level?</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 40, lineHeight: 22 }}>
              This helps us calculate your baseline metabolic rate with professional precision.
            </Text>
            <View style={{ gap: 12 }}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setActivityLevel(opt.value)}
                  style={{
                    backgroundColor: activityLevel === opt.value ? '#001a4d' : '#171717',
                    borderRadius: 16, padding: 20,
                    borderWidth: 1.5,
                    borderColor: activityLevel === opt.value ? Colors.primary : '#262626',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 }}>
                      {opt.label}
                    </Text>
                    <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                      {opt.desc}
                    </Text>
                  </View>
                  {activityLevel === opt.value && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 5: Review & estimated TDEE */}
        {step === 5 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Your plan is{'\n'}<Text style={{ color: Colors.tertiary }}>ready</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 32, lineHeight: 22 }}>
              Based on your profile, here's your personalized nutrition target.
            </Text>

            {tdeeEstimate() && (
              <View style={{ backgroundColor: '#171717', borderRadius: 20, padding: 28, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#262626' }}>
                <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 2, marginBottom: 8 }}>
                  ESTIMATED DAILY INTAKE
                </Text>
                <Text style={{ fontFamily: 'Inter_900Black', fontSize: 52, color: Colors.primary, letterSpacing: -2 }}>
                  {tdeeEstimate()?.toLocaleString()}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#a3a3a3', fontSize: 14 }}>kcal / day</Text>
              </View>
            )}

            <View style={{ gap: 12 }}>
              {[
                { label: 'Goal', value: GOAL_OPTIONS.find(g => g.value === goal)?.label },
                { label: 'Activity', value: ACTIVITY_OPTIONS.find(a => a.value === activityLevel)?.label },
                { label: 'Current Weight', value: `${currentWeight} kg` },
                { label: 'Target Weight', value: `${goalWeight || currentWeight} kg` },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#171717' }}>
                  <Text style={{ color: '#a3a3a3', fontFamily: 'Inter_500Medium', fontSize: 15 }}>{row.label}</Text>
                  <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom nav buttons */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 48, backgroundColor: '#000', flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={back}
          style={{ flex: 1, paddingVertical: 18, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', borderWidth: 1, borderColor: '#262626' }}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#a3a3a3', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={step === TOTAL_STEPS ? register : next}
          disabled={loading}
          style={{ flex: 2, paddingVertical: 18, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center' }}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>
              {step === TOTAL_STEPS ? 'Launch My Sanctuary' : 'Continue →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
