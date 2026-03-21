import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
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

function BellIcon({ color = '#666' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} />
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

function PlusIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#10b981' }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CartIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type TabType = 'pantry' | 'shopping';

const PROTEIN_ITEMS = [
  { name: 'Greek Salmon', checked: true },
  { name: 'Greek Yogurt', checked: false },
  { name: 'Chicken Breast', checked: false },
  { name: 'Eggs', checked: false },
];

const VEGGIE_ITEMS = [
  { name: 'Baby Spinach', checked: false },
  { name: 'Broccoli', checked: false },
];

const PRODUCE_ITEMS = [
  { name: 'Golden Pineapple', expiry: 'Expires in 1d', qty: '1 unit', urgency: '#f59e0b' },
  { name: 'Valencia Oranges', expiry: 'Fresh', qty: '6 units', urgency: '#10b981' },
];

const SHOPPING_ITEMS = [
  { name: 'Organic Chicken Breast', detail: '500g' },
  { name: 'Almond Milk', detail: 'unsweetened' },
];

export default function PantryScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('pantry');

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
            Inventory
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <BellIcon color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
          Manage your nourishment
        </Text>

        {/* Tab Pills */}
        <View style={{
          flexDirection: 'row', backgroundColor: theme.surface2, borderRadius: 14,
          padding: 4, marginBottom: 20, borderWidth: 1, borderColor: theme.border,
        }}>
          {(['pantry', 'shopping'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                backgroundColor: activeTab === tab ? Colors.primary : 'transparent',
              }}
            >
              <Text style={{
                fontFamily: 'Inter_700Bold', fontSize: 13,
                color: activeTab === tab ? '#fff' : theme.textTertiary,
                textTransform: 'capitalize',
              }}>
                {tab === 'pantry' ? 'Pantry' : 'Shopping'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'pantry' ? (
          <>
            {/* AI Suggestion Card */}
            <View style={{
              backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 20, padding: 20, marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
            }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                AI Suggestion
              </Text>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: theme.text, marginBottom: 4, letterSpacing: -0.5 }}>
                Lemon Garlic Wild Salmon
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.textSecondary, marginBottom: 14 }}>
                Based on items expiring in 48h
              </Text>

              {/* Tags */}
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {['16 min', '620 kcal', 'High Protein'].map((tag, idx) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.15)', paddingHorizontal: 10, paddingVertical: 5,
                      borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
                      marginRight: idx < 2 ? 8 : 0,
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={{
                backgroundColor: '#fff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.primary }}>
                  Cook Now
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categories Row */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              {/* Proteins */}
              <View style={{
                flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: theme.border, marginRight: 10,
              }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text, marginBottom: 12 }}>
                  Proteins
                </Text>
                {PROTEIN_ITEMS.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < PROTEIN_ITEMS.length - 1 ? 10 : 0 }}>
                    <View style={{
                      width: 18, height: 18, borderRadius: 9,
                      backgroundColor: item.checked ? '#10b981' : theme.surface2,
                      borderWidth: 1, borderColor: item.checked ? '#10b981' : theme.border,
                      alignItems: 'center', justifyContent: 'center', marginRight: 8,
                    }}>
                      {item.checked && <CheckIcon />}
                    </View>
                    <Text style={{
                      fontFamily: 'Inter_500Medium', fontSize: 12,
                      color: item.checked ? theme.textTertiary : theme.text,
                      textDecorationLine: item.checked ? 'line-through' : 'none',
                    }}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Veggies */}
              <View style={{
                flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: theme.border,
              }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text, marginBottom: 12 }}>
                  Veggies
                </Text>
                {VEGGIE_ITEMS.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < VEGGIE_ITEMS.length - 1 ? 10 : 0 }}>
                    <View style={{
                      width: 18, height: 18, borderRadius: 9,
                      backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
                      alignItems: 'center', justifyContent: 'center', marginRight: 8,
                    }} />
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.text }}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Fresh Produce */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{
                  fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
                  letterSpacing: 1.8, textTransform: 'uppercase',
                }}>
                  Fresh Produce & Fruits
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textTertiary }}>
                  {PRODUCE_ITEMS.length} items
                </Text>
              </View>

              {PRODUCE_ITEMS.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                    borderWidth: 1, borderColor: theme.border,
                    flexDirection: 'row', alignItems: 'center',
                    marginBottom: idx < PRODUCE_ITEMS.length - 1 ? 10 : 0,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    backgroundColor: item.urgency,
                  }} />
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text, marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: item.urgency }}>
                      {item.expiry}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary }}>
                    {item.qty}
                  </Text>
                </View>
              ))}
            </View>

            {/* Auto-Shopping List */}
            <View style={{
              backgroundColor: theme.surface, borderRadius: 16, padding: 18,
              borderWidth: 1, borderColor: theme.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: theme.text }}>
                  Auto-Shopping List
                </Text>
                <TouchableOpacity style={{
                  backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6,
                  borderRadius: 10, borderWidth: 1, borderColor: `${Colors.primary}30`,
                }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary }}>
                    VIEW/FILL LIST
                  </Text>
                </TouchableOpacity>
              </View>
              {SHOPPING_ITEMS.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < SHOPPING_ITEMS.length - 1 ? 12 : 0 }}>
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: Colors.primary, marginRight: 12,
                  }} />
                  <View>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: theme.text }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>
                      {item.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* Shopping Tab */
          <View style={{
            backgroundColor: theme.surface, borderRadius: 16, padding: 18,
            borderWidth: 1, borderColor: theme.border,
          }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text, marginBottom: 16 }}>
              Shopping List
            </Text>
            {SHOPPING_ITEMS.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < SHOPPING_ITEMS.length - 1 ? 14 : 0 }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }} />
                <View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: theme.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.textTertiary, marginTop: 2 }}>
                    {item.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <View style={{ position: 'absolute', bottom: 100, right: 24 }}>
        <TouchableOpacity style={{
          width: 54, height: 54, borderRadius: 27,
          backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
          shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
        }}>
          <PlusIcon />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
