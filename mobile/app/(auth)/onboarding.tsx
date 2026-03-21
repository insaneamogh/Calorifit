import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Dimensions,
} from 'react-native';

type UnitSystem = 'metric' | 'imperial';

function cmToFtIn(cm: number): { ft: string; inch: string } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft: String(ft), inch: String(inch) };
}
function ftInToCm(ft: string, inch: string): number {
  return Math.round((Number(ft || 0) * 12 + Number(inch || 0)) * 2.54);
}
function kgToLbs(kg: number): string { return kg ? String(Math.round(kg * 2.20462)) : ''; }
function lbsToKg(lbs: string): number { return lbs ? Math.round(Number(lbs) / 2.20462 * 10) / 10 : 0; }
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { authAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import { Colors } from '../../constants/colors';

const TOTAL_STEPS = 5;
const { width } = Dimensions.get('window');

// SVG Icons for activity levels
function SedentaryIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={14} rx={2} stroke={color} strokeWidth={1.8} />
      <Line x1={9} y1={9} x2={15} y2={9} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={9} y1={13} x2={12} y2={13} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function WalkIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={2} stroke={color} strokeWidth={1.8} />
      <Path d="M10 22l1-7M14 22l-1-7M10 15l-2-5 4-1 4 2-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RunIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BoltIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Goal icons
function TrendDownIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M23 18l-9.5-9.5-5 5L1 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 18h6v-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BalanceIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={12} r={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function TrendUpIcon({ color = '#888' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 6h6v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Typical office job, little to no exercise.', icon: SedentaryIcon },
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Active daily life or light exercise 1-2 times/week.', icon: WalkIcon },
  { value: 'moderately_active', label: 'Moderately Active', desc: 'Intense exercise or sports 3-5 times/week.', icon: RunIcon },
  { value: 'very_active', label: 'Very Active', desc: 'Heavy physical labor or daily intense training.', icon: BoltIcon },
];

const GOAL_OPTIONS = [
  { value: 'lose', label: 'Lose Weight', icon: TrendDownIcon },
  { value: 'maintain', label: 'Maintain', icon: BalanceIcon },
  { value: 'gain', label: 'Gain Muscle', icon: TrendUpIcon },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setTokens } = useStore();

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
  const [customCalories, setCustomCalories] = useState('');

  // Unit system state (all internal values stored in metric)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightDisplay, setWeightDisplay] = useState('');
  const [goalWeightDisplay, setGoalWeightDisplay] = useState('');

  const switchUnits = (system: UnitSystem) => {
    if (system === unitSystem) return;
    if (system === 'imperial') {
      // Convert metric → imperial for display
      if (heightCm) { const { ft, inch } = cmToFtIn(Number(heightCm)); setHeightFt(ft); setHeightIn(inch); }
      if (currentWeight) setWeightDisplay(kgToLbs(Number(currentWeight)));
      if (goalWeight) setGoalWeightDisplay(kgToLbs(Number(goalWeight)));
    } else {
      // Convert imperial → metric and store
      if (heightFt || heightIn) { const cm = ftInToCm(heightFt, heightIn); setHeightCm(String(cm)); }
      if (weightDisplay) { const kg = lbsToKg(weightDisplay); setCurrentWeight(String(kg)); setWeightDisplay(''); }
      if (goalWeightDisplay) { const kg = lbsToKg(goalWeightDisplay); setGoalWeight(String(kg)); setGoalWeightDisplay(''); }
    }
    setUnitSystem(system);
  };

  // Sync imperial display → internal metric on change
  const onWeightChange = (val: string) => {
    if (unitSystem === 'imperial') { setWeightDisplay(val); setCurrentWeight(String(lbsToKg(val))); }
    else setCurrentWeight(val);
  };
  const onGoalWeightChange = (val: string) => {
    if (unitSystem === 'imperial') { setGoalWeightDisplay(val); setGoalWeight(String(lbsToKg(val))); }
    else setGoalWeight(val);
  };
  const onHeightFtChange = (val: string) => { setHeightFt(val); setHeightCm(String(ftInToCm(val, heightIn))); };
  const onHeightInChange = (val: string) => { setHeightIn(val); setHeightCm(String(ftInToCm(heightFt, val))); };

  const validate = (): string | null => {
    if (step === 1) {
      if (!name.trim()) return 'Please enter your name.';
      if (!email.trim() || !email.includes('@')) return 'Please enter a valid email.';
      if (password.length < 8) return 'Password must be at least 8 characters.';
    }
    if (step === 2) {
      if (!age || isNaN(Number(age)) || Number(age) < 10 || Number(age) > 120) return 'Please enter a valid age.';
      if (!heightCm || isNaN(Number(heightCm)) || Number(heightCm) < 50) return 'Please enter a valid height in cm.';
      if (!currentWeight || isNaN(Number(currentWeight)) || Number(currentWeight) < 20) return 'Please enter a valid current weight in kg.';
    }
    if (step === 5) {
      const cal = Number(customCalories);
      if (!customCalories || isNaN(cal) || cal < 500 || cal > 10000) return 'Please enter a valid calorie goal (500-10,000).';
    }
    return null;
  };

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

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    const nextStep = Math.min(step + 1, TOTAL_STEPS);
    if (nextStep === TOTAL_STEPS && !customCalories) {
      const est = tdeeEstimate();
      if (est) setCustomCalories(String(est));
    }
    setStep(nextStep);
  };

  const back = () => {
    setError('');
    if (step === 1) {
      if (router.canGoBack()) router.back();
      else router.replace('/(auth)/welcome');
    } else {
      setStep((s) => s - 1);
    }
  };

  const register = async () => {
    const cal = Number(customCalories);
    if (customCalories && (isNaN(cal) || cal < 500 || cal > 10000)) {
      setError('Please enter a valid calorie goal (500-10,000).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const dailyCalGoal = Number(customCalories) || tdeeEstimate() || 2000;
      const res = await authAPI.register({
        email, password, name,
        age: Number(age),
        gender,
        heightCm: Number(heightCm) || 170,
        currentWeight: Number(currentWeight),
        goalWeight: Number(goalWeight) || Number(currentWeight),
        activityLevel,
        goal,
        dailyCalGoal,
      });
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Is the server running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = (step / TOTAL_STEPS) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Top bar */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: Colors.primary, fontFamily: 'Inter_800ExtraBold', fontSize: 16, letterSpacing: -0.3 }}>
            Kinetic Sanctuary
          </Text>
          <TouchableOpacity onPress={back}>
            <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', fontSize: 14 }}>Exit</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: Colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.5 }}>
            STEP {String(step).padStart(2, '0')} OF {String(TOTAL_STEPS).padStart(2, '0')}
          </Text>
          {step > 1 && (
            <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', fontSize: 13 }}>
              {['', 'Account', 'Body', 'Goal', 'Activity', 'Review'][step]}
            </Text>
          )}
        </View>
        <View style={{ height: 3, backgroundColor: '#1a1a1a', borderRadius: 4 }}>
          <View style={{
            height: 3, backgroundColor: Colors.primary,
            borderRadius: 4, width: `${progressWidth}%`,
          }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 36, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: Account */}
        {step === 1 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Create your{'\n'}<Text style={{ color: Colors.primary }}>Sanctuary</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 15, marginBottom: 36, lineHeight: 22 }}>
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
                  placeholderTextColor="#333"
                  keyboardType={field.keyboardType}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                  style={{
                    backgroundColor: '#111', borderRadius: 14,
                    padding: 18, color: '#fff',
                    fontFamily: 'Inter_400Regular', fontSize: 16,
                    borderWidth: 1, borderColor: '#1a1a1a',
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: Body metrics */}
        {step === 2 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Personalize Your{'\n'}<Text style={{ color: Colors.primary }}>Journey</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 15, marginBottom: 20 }}>
              Enter your details to calculate your daily energy requirements.
            </Text>

            {/* Unit system toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a', padding: 3, marginBottom: 20 }}>
              {(['metric', 'imperial'] as const).map((sys) => (
                <TouchableOpacity
                  key={sys}
                  onPress={() => switchUnits(sys)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 9,
                    backgroundColor: unitSystem === sys ? Colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: unitSystem === sys ? '#fff' : '#555', fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
                    {sys === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 14 }}>
              {/* Gender selector */}
              <View>
                <Text style={{ color: '#555', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 8, letterSpacing: 1.2 }}>GENDER</Text>
                <View style={{
                  flexDirection: 'row', backgroundColor: '#111', borderRadius: 14,
                  borderWidth: 1, borderColor: '#1a1a1a', padding: 4,
                }}>
                  {(['male', 'female'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 10,
                        backgroundColor: gender === g ? '#1a1a1a' : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: gender === g ? '#fff' : '#555', fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'capitalize' }}>
                        {g === 'male' ? '\u2642 Male' : '\u2640 Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age & Weight side by side */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#555', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 6, letterSpacing: 1.2 }}>AGE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                    <TextInput value={age} onChangeText={setAge} keyboardType="decimal-pad" placeholderTextColor="#333" placeholder="0"
                      style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }} />
                    <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>yrs</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#555', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 6, letterSpacing: 1.2 }}>WEIGHT</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                    <TextInput
                      value={unitSystem === 'imperial' ? weightDisplay : currentWeight}
                      onChangeText={onWeightChange}
                      keyboardType="decimal-pad" placeholderTextColor="#333" placeholder="0"
                      style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }}
                    />
                    <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>{unitSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
                  </View>
                </View>
              </View>

              {/* Height */}
              <View>
                <Text style={{ color: '#555', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 6, letterSpacing: 1.2 }}>HEIGHT</Text>
                {unitSystem === 'metric' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                    <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholderTextColor="#333" placeholder="170"
                      style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }} />
                    <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>cm</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                      <TextInput value={heightFt} onChangeText={onHeightFtChange} keyboardType="decimal-pad" placeholderTextColor="#333" placeholder="5"
                        style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }} />
                      <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>ft</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                      <TextInput value={heightIn} onChangeText={onHeightInChange} keyboardType="decimal-pad" placeholderTextColor="#333" placeholder="10"
                        style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }} />
                      <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>in</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Goal Weight */}
              <View>
                <Text style={{ color: '#555', fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 6, letterSpacing: 1.2 }}>GOAL WEIGHT</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a' }}>
                  <TextInput
                    value={unitSystem === 'imperial' ? goalWeightDisplay : goalWeight}
                    onChangeText={onGoalWeightChange}
                    keyboardType="decimal-pad" placeholderTextColor="#333"
                    placeholder={unitSystem === 'imperial' ? kgToLbs(Number(currentWeight)) || '154' : currentWeight || '70'}
                    style={{ flex: 1, padding: 18, color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 20 }}
                  />
                  <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', paddingRight: 16 }}>{unitSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: Goal */}
        {step === 3 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Define your{'\n'}<Text style={{ color: Colors.primary }}>kinetic target</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 15, marginBottom: 36 }}>
              What's your primary fitness goal?
            </Text>
            <View style={{ gap: 12 }}>
              {GOAL_OPTIONS.map((g) => {
                const isSelected = goal === g.value;
                const IconComp = g.icon;
                return (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() => setGoal(g.value)}
                    style={{
                      backgroundColor: isSelected ? '#0c1a3d' : '#111',
                      borderRadius: 16, padding: 20,
                      flexDirection: 'row', alignItems: 'center', gap: 16,
                      borderWidth: 1.5,
                      borderColor: isSelected ? Colors.primary : '#1a1a1a',
                    }}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : '#1a1a1a',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp color={isSelected ? Colors.primary : '#555'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>{g.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <CheckIcon />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 4: Activity level */}
        {step === 4 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              What is your{'\n'}<Text style={{ color: Colors.primary }}>Activity Level?</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 15, marginBottom: 36, lineHeight: 22 }}>
              This helps us calculate your baseline metabolic rate with professional precision.
            </Text>
            <View style={{ gap: 12 }}>
              {ACTIVITY_OPTIONS.map((opt) => {
                const isSelected = activityLevel === opt.value;
                const IconComp = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setActivityLevel(opt.value)}
                    style={{
                      backgroundColor: isSelected ? '#0c1a3d' : '#111',
                      borderRadius: 16, padding: 20,
                      borderWidth: 1.5,
                      borderColor: isSelected ? Colors.primary : '#1a1a1a',
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : '#1a1a1a',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                    }}>
                      <IconComp color={isSelected ? Colors.primary : '#555'} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 }}>
                          {opt.label}
                        </Text>
                        <Text style={{ color: '#555', fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                          {opt.desc}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                          <CheckIcon />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 5: Review & Calorie Goal */}
        {step === 5 && (
          <View>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 30, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
              Your plan is{'\n'}<Text style={{ color: Colors.tertiary }}>ready</Text>
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 15, marginBottom: 28, lineHeight: 22 }}>
              Based on your profile, here's your personalized nutrition target.
            </Text>

            {/* Editable calorie goal */}
            <View style={{
              backgroundColor: '#0c1a3d', borderRadius: 18, padding: 24, marginBottom: 24,
              borderWidth: 1, borderColor: '#1a2a5a',
            }}>
              <Text style={{ color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>
                Estimated TDEE
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <TextInput
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  keyboardType="number-pad"
                  style={{
                    fontFamily: 'Inter_900Black', fontSize: 48, color: '#fff',
                    letterSpacing: -2, minWidth: 140,
                  }}
                />
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#555', fontSize: 16 }}>kcal/day</Text>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { label: 'Goal', value: GOAL_OPTIONS.find(g => g.value === goal)?.label },
                { label: 'Activity', value: ACTIVITY_OPTIONS.find(a => a.value === activityLevel)?.label },
                { label: 'Current Weight', value: `${currentWeight} kg` },
                { label: 'Target Weight', value: `${goalWeight || currentWeight} kg` },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' }}>
                  <Text style={{ color: '#555', fontFamily: 'Inter_500Medium', fontSize: 15 }}>{row.label}</Text>
                  <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{row.value}</Text>
                </View>
              ))}
            </View>

            <Text style={{
              fontFamily: 'Inter_400Regular', color: '#333', fontSize: 11, textAlign: 'center',
              marginTop: 24, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              Calculated using the Mifflin-St Jeor Equation
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48 }}>
        {error ? (
          <View style={{ backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.15)' }}>
            <Text style={{ color: '#fca5a5', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={back}
            style={{
              flex: 1, paddingVertical: 18, borderRadius: 14,
              backgroundColor: '#111', alignItems: 'center',
              borderWidth: 1, borderColor: '#1a1a1a',
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#555', fontSize: 16 }}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={step === TOTAL_STEPS ? register : next}
            disabled={loading}
            style={{ flex: 2, paddingVertical: 18, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' }}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>
                {step === TOTAL_STEPS ? 'Launch My Sanctuary' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
