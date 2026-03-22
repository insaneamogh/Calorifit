import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { pantryAPI } from '../../services/api';

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

function CloseIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ color = '#f87171' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  expiryDate: string | null;
  food?: any;
  createdAt: string;
}

const CATEGORIES = ['protein', 'dairy', 'grains', 'vegetables', 'fruits', 'snacks', 'condiments'];
const UNITS = ['piece', 'g', 'kg', 'ml', 'L', 'cup'];

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Proteins',
  dairy: 'Dairy',
  grains: 'Grains & Cereals',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  snacks: 'Snacks',
  condiments: 'Condiments & Sauces',
};

function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryColor(days: number | null): string {
  if (days === null) return '#10b981';
  if (days <= 0) return '#f87171';
  if (days <= 3) return '#f59e0b';
  return '#10b981';
}

function expiryLabel(days: number | null): string {
  if (days === null) return 'No expiry';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 3) return `Expires in ${days}d`;
  return 'Fresh';
}

export default function PantryScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formUnit, setFormUnit] = useState('piece');
  const [formCategory, setFormCategory] = useState<string>('protein');
  const [formExpiry, setFormExpiry] = useState(''); // YYYY-MM-DD string

  // Edit quantity state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await pantryAPI.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.log('Pantry fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const data: any = {
        name: formName.trim(),
        quantity: parseFloat(formQuantity) || 1,
        unit: formUnit,
        category: formCategory,
      };
      if (formExpiry.trim()) {
        data.expiryDate = formExpiry.trim();
      }
      const res = await pantryAPI.add(data);
      if (res.data) {
        setItems((prev) => [res.data, ...prev]);
      }
      setFormName('');
      setFormQuantity('1');
      setFormUnit('piece');
      setFormCategory('protein');
      setFormExpiry('');
      setShowAddModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pantryAPI.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleUpdateQty = async (id: string) => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) {
      setEditingId(null);
      return;
    }
    try {
      const res = await pantryAPI.update(id, { quantity: qty });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    } catch {
      Alert.alert('Error', 'Failed to update quantity');
    }
    setEditingId(null);
  };

  // Group items by category
  const grouped = items.reduce<Record<string, PantryItem[]>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Items expiring soon (within 3 days)
  const expiringSoon = items.filter((i) => {
    const days = daysUntilExpiry(i.expiryDate);
    return days !== null && days >= 0 && days <= 3;
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
          {items.length > 0 ? `${items.length} items in your pantry` : 'Your pantry is empty'}
        </Text>

        {/* Expiring Soon Warning */}
        {expiringSoon.length > 0 && (
          <View style={{
            backgroundColor: theme.isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
            borderRadius: 16, padding: 16, marginBottom: 20,
            borderWidth: 1, borderColor: theme.isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)',
          }}>
            <Text style={{
              fontFamily: 'Inter_700Bold', fontSize: 14, color: '#f59e0b', marginBottom: 10,
            }}>
              Expiring Soon
            </Text>
            {expiringSoon.map((item) => {
              const days = daysUntilExpiry(item.expiryDate);
              return (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: expiryColor(days), marginRight: 10,
                  }} />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: theme.text, flex: 1 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: expiryColor(days) }}>
                    {expiryLabel(days)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <View style={{
            backgroundColor: theme.surface, borderRadius: 20, padding: 40,
            borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 20,
          }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: theme.text, marginBottom: 8 }}>
              Start Building Your Pantry
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.textTertiary, textAlign: 'center', marginBottom: 20 }}>
              Add items to track what you have at home and get expiry alerts
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: Colors.primary, borderRadius: 12,
                paddingHorizontal: 24, paddingVertical: 12,
              }}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' }}>
                Add First Item
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grouped Items */}
        {Object.entries(grouped).map(([cat, catItems]) => (
          <View key={cat} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{
                fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textTertiary,
                letterSpacing: 1.8, textTransform: 'uppercase',
              }}>
                {CATEGORY_LABELS[cat] || cat}
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: theme.textTertiary }}>
                {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
              </Text>
            </View>

            {catItems.map((item, idx) => {
              const days = daysUntilExpiry(item.expiryDate);
              const urgency = expiryColor(days);
              const isEditing = editingId === item.id;

              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: theme.surface, borderRadius: 14, padding: 16,
                    borderWidth: 1, borderColor: theme.border,
                    flexDirection: 'row', alignItems: 'center',
                    marginBottom: idx < catItems.length - 1 ? 10 : 0,
                    overflow: 'hidden',
                  }}
                >
                  {/* Left accent bar */}
                  <View style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    backgroundColor: urgency,
                  }} />

                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: theme.text, marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: urgency }}>
                      {expiryLabel(days)}
                    </Text>
                  </View>

                  {isEditing ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        style={{
                          backgroundColor: theme.surface2, borderRadius: 8, paddingHorizontal: 10,
                          paddingVertical: 4, width: 50, fontSize: 13, color: theme.text,
                          fontFamily: 'Inter_600SemiBold', textAlign: 'center',
                          borderWidth: 1, borderColor: Colors.primary,
                        }}
                        keyboardType="numeric"
                        value={editQty}
                        onChangeText={setEditQty}
                        autoFocus
                        onBlur={() => handleUpdateQty(item.id)}
                        onSubmitEditing={() => handleUpdateQty(item.id)}
                      />
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: theme.textTertiary, marginLeft: 4 }}>
                        {item.unit}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(item.id);
                        setEditQty(String(item.quantity));
                      }}
                      style={{ marginRight: 8 }}
                    >
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary }}>
                        {item.quantity} {item.unit}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{ padding: 6, marginLeft: 6 }}
                    onPress={() => {
                      Alert.alert('Delete Item', `Remove "${item.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
                      ]);
                    }}
                  >
                    <TrashIcon color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <View style={{ position: 'absolute', bottom: 100, right: 24 }}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            width: 54, height: 54, borderRadius: 27,
            backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
            shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
          }}
        >
          <PlusIcon />
        </TouchableOpacity>
      </View>

      {/* Add Item Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, paddingBottom: 40,
          }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: theme.text }}>
                Add to Pantry
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ padding: 4 }}>
                <CloseIcon color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Item Name */}
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
              ITEM NAME
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                marginBottom: 16,
              }}
              placeholder="e.g. Chicken Breast"
              placeholderTextColor={theme.textTertiary}
              value={formName}
              onChangeText={setFormName}
            />

            {/* Quantity & Unit Row */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                  QUANTITY
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                    color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                  }}
                  placeholder="1"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="numeric"
                  value={formQuantity}
                  onChangeText={setFormQuantity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
                  UNIT
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingTop: 4 }}>
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setFormUnit(u)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 6,
                        backgroundColor: formUnit === u ? Colors.primary : theme.surface,
                        borderWidth: 1, borderColor: formUnit === u ? Colors.primary : theme.border,
                      }}
                    >
                      <Text style={{
                        fontFamily: 'Inter_600SemiBold', fontSize: 12,
                        color: formUnit === u ? '#fff' : theme.textSecondary,
                      }}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Category */}
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 8, letterSpacing: 0.5 }}>
              CATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFormCategory(cat)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8,
                    backgroundColor: formCategory === cat ? Colors.primary : theme.surface,
                    borderWidth: 1, borderColor: formCategory === cat ? Colors.primary : theme.border,
                  }}
                >
                  <Text style={{
                    fontFamily: 'Inter_600SemiBold', fontSize: 12,
                    color: formCategory === cat ? '#fff' : theme.textSecondary,
                    textTransform: 'capitalize',
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Expiry Date */}
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: theme.textTertiary, marginBottom: 6, letterSpacing: 0.5 }}>
              EXPIRY DATE (OPTIONAL)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15,
                color: theme.text, fontFamily: 'Inter_500Medium', borderWidth: 1, borderColor: theme.border,
                marginBottom: 20,
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textTertiary}
              value={formExpiry}
              onChangeText={setFormExpiry}
            />

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving || !formName.trim()}
              style={{
                backgroundColor: !formName.trim() ? theme.surface2 : Colors.primary,
                borderRadius: 14, paddingVertical: 16, alignItems: 'center',
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: !formName.trim() ? theme.textTertiary : '#fff' }}>
                  Add to Pantry
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
