import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, Modal, TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { router } from 'expo-router';
import { aiAPI, logsAPI } from '../../services/api';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { computeShifaFromScan, computeMealShifa, getShifaRating, getShifaColor, getShifaLabel, getShifaBgColor } from '../../utils/shifa';

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

type ScanMode = 'camera' | 'barcode' | 'describe';

// SVG Icons
function CloseIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function FlashIcon({ active }: { active: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill={active ? '#fff' : 'none'} />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#333" strokeWidth={1.8} />
      <Circle cx={12} cy={13} r={4} stroke="#333" strokeWidth={1.8} />
    </Svg>
  );
}

function GalleryIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={2} stroke="#fff" strokeWidth={1.8} />
      <Circle cx={8.5} cy={8.5} r={1.5} stroke="#fff" strokeWidth={1.5} />
      <Path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BarcodeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={2} height={16} fill="#fff" />
      <Rect x={7} y={4} width={1} height={16} fill="#fff" />
      <Rect x={10} y={4} width={2} height={16} fill="#fff" />
      <Rect x={14} y={4} width={1} height={16} fill="#fff" />
      <Rect x={17} y={4} width={3} height={16} fill="#fff" />
    </Svg>
  );
}

export default function ScanScreen() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('camera');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<FoodResult[] | null>(null);
  const [description, setDescription] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [logging, setLogging] = useState(false);
  const [flash, setFlash] = useState(false);
  const [barcodeScanned, setBarcodeScanned] = useState(false);
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

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (barcodeScanned || scanning) return;
    setBarcodeScanned(true);
    setScanning(true);
    try {
      const res = await aiAPI.describeFood(`Food with barcode/UPC: ${data}. Identify this product and provide nutritional info per serving.`);
      setResults(res.data.foods || []);
    } catch (err: any) {
      Alert.alert('Barcode not found', `Barcode: ${data}\n\nCould not identify this product.`, [
        { text: 'Try Again', onPress: () => setBarcodeScanned(false) },
      ]);
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
      Alert.alert('Logged', `${results.length} item${results.length > 1 ? 's' : ''} added to your ${selectedMeal}`, [
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32, backgroundColor: theme.surface,
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          borderWidth: 1, borderColor: theme.border,
        }}>
          <CameraIcon />
        </View>
        <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: theme.text, textAlign: 'center', marginBottom: 10 }}>
          Camera Access Needed
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          Allow camera access to use AI food scanning.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 }}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Top controls */}
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, paddingHorizontal: 20, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <CloseIcon />
          </TouchableOpacity>

          <View style={{
            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, flexDirection: 'row',
            padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          }}>
            {(['camera', 'barcode', 'describe'] as ScanMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMode(m); setBarcodeScanned(false); setResults(null); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 17,
                  backgroundColor: mode === m ? Colors.primary : 'transparent',
                }}
              >
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>
                  {m === 'camera' ? 'Camera' : m === 'barcode' ? 'Barcode' : 'Describe'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setFlash((f) => !f)}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: flash ? Colors.primary : 'rgba(0,0,0,0.5)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: flash ? Colors.primary : 'rgba(255,255,255,0.08)',
            }}
          >
            <FlashIcon active={flash} />
          </TouchableOpacity>
        </View>

        {/* Status pill */}
        <View style={{
          alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
          paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, marginTop: 12,
        }}>
          <Text style={{ color: scanning ? Colors.primary : '#888', fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.5 }}>
            {scanning ? 'AI SCANNING...' : 'AI VISION ACTIVE'}
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
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' }}>
            {scanning && (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator color={Colors.primary} size="large" />
                  <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 12 }}>Analyzing with AI...</Text>
                </View>
              </View>
            )}
          </View>
        </CameraView>
      ) : mode === 'barcode' ? (
        <CameraView
          style={{ flex: 1 }}
          enableTorch={flash}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' }}>
            {scanning ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator color={Colors.primary} size="large" />
                  <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 12 }}>Identifying product...</Text>
                </View>
              </View>
            ) : !barcodeScanned ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {/* 4 corner brackets */}
                <View style={{ width: 260, height: 160, position: 'relative' }}>
                  {/* Top-left */}
                  <View style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderRadius: 3 }} />
                  {/* Top-right */}
                  <View style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderRadius: 3 }} />
                  {/* Bottom-left */}
                  <View style={{ position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderRadius: 3 }} />
                  {/* Bottom-right */}
                  <View style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderRadius: 3 }} />
                </View>
                <Text style={{ color: '#aaa', fontFamily: 'Inter_500Medium', marginTop: 20, fontSize: 14 }}>
                  Align the barcode within the frame.
                </Text>
              </View>
            ) : null}
          </View>
        </CameraView>
      ) : (
        <View style={{ flex: 1, paddingTop: 130, paddingHorizontal: 24, backgroundColor: theme.bg }}>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: theme.text, marginBottom: 8 }}>
            Describe your meal
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', color: theme.textTertiary, fontSize: 14, marginBottom: 24, lineHeight: 22 }}>
            Tell me what you ate and I'll calculate the nutrition.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. A bowl of oats with banana, honey and almond milk"
            placeholderTextColor="#333"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: theme.surface, borderRadius: 14,
              padding: 18, color: theme.text,
              fontFamily: 'Inter_400Regular', fontSize: 15,
              textAlignVertical: 'top', minHeight: 120,
              borderWidth: 1, borderColor: theme.border,
            }}
          />
        </View>
      )}

      {/* Bottom controls */}
      {!results && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 48, paddingHorizontal: 24 }}>
          {mode === 'barcode' ? (
            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  'Enter Barcode',
                  'Type the barcode number manually',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Search',
                      onPress: (value) => {
                        if (value && value.trim()) {
                          handleBarcodeScanned({ type: 'manual', data: value.trim() });
                        }
                      },
                    },
                  ],
                  'plain-text',
                  '',
                  'number-pad'
                );
              }}
              style={{
                backgroundColor: theme.surface, borderRadius: 14, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: theme.border,
              }}
            >
              <View style={{ marginRight: 8 }}>
                <BarcodeIcon />
              </View>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 14 }}>Enter Barcode Manually</Text>
            </TouchableOpacity>
          ) : mode === 'camera' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                  marginRight: 32,
                }}
              >
                <GalleryIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCapture}
                disabled={scanning}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <View style={{
                  width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {scanning ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <Circle cx={12} cy={12} r={4} fill="#333" />
                    </Svg>
                  )}
                </View>
              </TouchableOpacity>
              <View style={{ width: 48, height: 48 }} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleDescribe}
              disabled={scanning || !description.trim()}
              style={{
                backgroundColor: description.trim() ? Colors.primary : '#1a1a1a',
                borderRadius: 14, paddingVertical: 18, alignItems: 'center',
              }}
            >
              {scanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 16 }}>Analyze with AI</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results sheet */}
      {results && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(8,8,8,0.97)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          maxHeight: '75%',
        }}>
          <View style={{ width: 36, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

          {/* Meal selector */}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMeal(m)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: selectedMeal === m ? Colors.primary : '#111',
                  alignItems: 'center',
                  borderWidth: 1, borderColor: selectedMeal === m ? Colors.primary : '#1a1a1a',
                  marginRight: m !== 'snack' ? 6 : 0,
                }}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: selectedMeal === m ? '#fff' : '#666', textTransform: 'capitalize' }}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meal-level Shifa Index */}
          {results.length > 0 && (() => {
            const mealData = computeMealShifa(results.map((f) => ({
              calories: f.calories, protein: f.protein, carbs: f.carbs,
              fiber: f.fiber || 0, gi: f.glycemicIndex || 50,
            })));
            if (mealData.shifaIndex > 0) {
              const rating = getShifaRating(mealData.shifaIndex);
              const color = getShifaColor(rating);
              const bgColor = getShifaBgColor(rating);
              return (
                <View style={{
                  backgroundColor: bgColor, borderRadius: 12, padding: 12,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12, borderWidth: 1, borderColor: `${color}25`,
                }}>
                  <View>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                      Meal Shifa Index
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color, letterSpacing: -1, marginRight: 4 }}>{mealData.shifaIndex}</Text>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color }}>{getShifaLabel(rating)}</Text>
                    </View>
                  </View>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              );
            }
            return null;
          })()}

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 240 }}>
            {results.map((food, i) => {
              const shifa = computeShifaFromScan(food);
              const sColor = getShifaColor(shifa.rating);
              const sBg = getShifaBgColor(shifa.rating);
              return (
                <View key={i} style={{ backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#1a1a1a' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                        {i === 0 && (
                          <View style={{ backgroundColor: '#064e3b', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 6 }}>
                            <Text style={{ color: '#34d399', fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2 }}>
                              IDENTIFIED
                            </Text>
                          </View>
                        )}
                        {shifa.shifaIndex > 0 && (
                          <View style={{ backgroundColor: sBg, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                            <Text style={{ color: sColor, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.5 }}>
                              {'SI ' + shifa.shifaIndex}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: '#fff', letterSpacing: -0.3 }}>
                        {food.name}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', color: '#555', fontSize: 12, marginTop: 2 }}>
                        {'~' + food.estimatedGrams + 'g serving'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: 'Inter_900Black', fontSize: 26, color: '#fff', letterSpacing: -1 }}>
                        {Math.round(food.calories)}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#555', letterSpacing: 1.2 }}>KCAL</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {[
                      { label: 'Protein', value: food.protein, color: '#f97316' },
                      { label: 'Carbs',   value: food.carbs,   color: Colors.tertiary },
                      { label: 'Fats',    value: food.fat,     color: '#ccc' },
                    ].map((m, mIdx) => (
                      <View key={m.label} style={{
                        flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 10, alignItems: 'center',
                        marginRight: mIdx < 2 ? 8 : 0,
                      }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                          {m.label}
                        </Text>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: m.color }}>{Math.round(m.value) + 'g'}</Text>
                      </View>
                    ))}
                  </View>
                  {food.tags && food.tags.length > 0 && (
                    <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' }}>
                      {food.tags.map((tag: string) => (
                        <View key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, marginRight: 6, marginBottom: 6 }}>
                          <Text style={{ color: '#888', fontFamily: 'Inter_500Medium', fontSize: 11 }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => setResults(null)}
              style={{
                flex: 1, paddingVertical: 16, borderRadius: 14,
                backgroundColor: '#111', alignItems: 'center',
                borderWidth: 1, borderColor: '#1a1a1a',
                marginRight: 10,
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#666', fontSize: 15 }}>Rescan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={logMeal}
              disabled={logging}
              style={{
                flex: 2, paddingVertical: 16, borderRadius: 14,
                backgroundColor: Colors.primary, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center',
              }}
            >
              {logging ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <View style={{ marginRight: 8 }}>
                    <CheckIcon />
                  </View>
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
