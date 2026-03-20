import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, Modal, TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { aiAPI, logsAPI } from '../../services/api';
import { Colors } from '../../constants/colors';

const today = () => new Date().toISOString().split('T')[0];

interface FoodResult {
  name: string;
  estimatedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  tags?: string[];
}

type ScanMode = 'camera' | 'describe';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('camera');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<FoodResult[] | null>(null);
  const [description, setDescription] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [logging, setLogging] = useState(false);
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) throw new Error('No image captured');
      const res = await aiAPI.scanImage(photo.base64, 'image/jpeg');
      setResults(res.data.foods || []);
    } catch (err: any) {
      Alert.alert('Scan failed', err.response?.data?.error || err.message);
    } finally {
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.base64) return;
    setScanning(true);
    try {
      const res = await aiAPI.scanImage(result.assets[0].base64, 'image/jpeg');
      setResults(res.data.foods || []);
    } catch (err: any) {
      Alert.alert('Analysis failed', err.response?.data?.error || err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleDescribe = async () => {
    if (!description.trim()) return;
    setScanning(true);
    try {
      const res = await aiAPI.describeFood(description);
      setResults(res.data.foods || []);
    } catch (err: any) {
      Alert.alert('Analysis failed', err.response?.data?.error || err.message);
    } finally {
      setScanning(false);
    }
  };

  const logMeal = async () => {
    if (!results?.length) return;
    setLogging(true);
    try {
      await logsAPI.addAIItems({
        date: today(),
        meal: selectedMeal,
        foods: results,
      });
      Alert.alert('Logged! 🎉', `${results.length} item${results.length > 1 ? 's' : ''} added to your ${selectedMeal}`, [
        { text: 'View Log', onPress: () => { setResults(null); router.push('/(tabs)/log'); } },
        { text: 'Scan Again', onPress: () => setResults(null) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to log meal');
    } finally {
      setLogging(false);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 24 }}>📷</Text>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 24, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
          Camera Access Needed
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', textAlign: 'center', marginBottom: 32 }}>
          Allow camera access to use AI food scanning.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32 }}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Mode toggle */}
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, paddingHorizontal: 20, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 22, flexDirection: 'row', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            {(['camera', 'describe'] as ScanMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18,
                  backgroundColor: mode === m ? Colors.primary : 'transparent',
                }}
              >
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
                  {m === 'camera' ? '📷 Camera' : '✏️ Describe'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setFlash((f) => !f)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: flash ? Colors.primary : 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 }}>
          <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2 }}>
            {scanning ? 'AI SCANNING...' : 'AI READY'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Camera */}
      {mode === 'camera' ? (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          enableTorch={flash}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}>
            {/* Scanning overlay */}
            {scanning && (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator color={Colors.primary} size="large" />
                  <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 }}>Analyzing with Gemini AI...</Text>
                </View>
              </View>
            )}
          </View>
        </CameraView>
      ) : (
        <View style={{ flex: 1, paddingTop: 130, paddingHorizontal: 24 }}>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff', marginBottom: 8 }}>
            Describe your meal
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 15, marginBottom: 24 }}>
            Tell me what you ate and I'll calculate the nutrition.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. A bowl of oats with banana, honey and almond milk"
            placeholderTextColor="#404040"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#171717', borderRadius: 16,
              padding: 18, color: '#fff',
              fontFamily: 'Inter_400Regular', fontSize: 15,
              textAlignVertical: 'top', minHeight: 120,
              borderWidth: 1, borderColor: '#262626',
            }}
          />
        </View>
      )}

      {/* Bottom controls */}
      {!results && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 48, paddingHorizontal: 24 }}>
          {mode === 'camera' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <TouchableOpacity onPress={handlePickImage} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>🖼</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCapture}
                disabled={scanning}
                style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  {scanning ? <ActivityIndicator color={Colors.primary} /> : <Text style={{ fontSize: 26 }}>📷</Text>}
                </View>
              </TouchableOpacity>
              <View style={{ width: 50, height: 50 }} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleDescribe}
              disabled={scanning || !description.trim()}
              style={{
                backgroundColor: description.trim() ? Colors.primary : '#262626',
                borderRadius: 16, paddingVertical: 18, alignItems: 'center',
              }}
            >
              {scanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Analyze with Gemini →</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results sheet */}
      {results && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(10,10,10,0.97)',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          maxHeight: '75%',
        }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

          {/* Meal selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMeal(m)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: selectedMeal === m ? Colors.primary : '#171717',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: selectedMeal === m ? '#fff' : '#a3a3a3', textTransform: 'capitalize' }}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
            {results.map((food, i) => (
              <View key={i} style={{ backgroundColor: '#171717', borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    {i === 0 && (
                      <View style={{ backgroundColor: Colors.tertiaryContainer, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 }}>
                        <Text style={{ color: Colors.tertiaryFixed, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5 }}>
                          PERFECT MATCH
                        </Text>
                      </View>
                    )}
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#fff', letterSpacing: -0.3 }}>
                      {food.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', color: '#a3a3a3', fontSize: 12, marginTop: 2 }}>
                      ~{food.estimatedGrams}g serving
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Inter_900Black', fontSize: 28, color: Colors.primary, letterSpacing: -1 }}>
                      {Math.round(food.calories)}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#a3a3a3', letterSpacing: 1.5 }}>CALORIES</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { label: 'Protein', value: food.protein, color: '#f97316' },
                    { label: 'Carbs',   value: food.carbs,   color: Colors.tertiary },
                    { label: 'Fats',    value: food.fat,     color: '#fff' },
                  ].map((m) => (
                    <View key={m.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 10, alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: '#a3a3a3', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                        {m.label}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: m.color }}>{Math.round(m.value)}g</Text>
                    </View>
                  ))}
                </View>
                {food.tags && food.tags.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {food.tags.map((tag) => (
                      <View key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium', fontSize: 11 }}>● {tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => setResults(null)}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#a3a3a3', fontSize: 15 }}>Rescan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={logMeal}
              disabled={logging}
              style={{ flex: 2, paddingVertical: 16, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              {logging ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={{ fontSize: 16 }}>✓</Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Log This Meal</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
