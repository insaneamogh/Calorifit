import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_MOCK } from '../services/mockApi';
import { MOCK_USER, MOCK_DAY_LOG, MOCK_WATER } from '../services/mockData';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: string;
  goal: string;
  dailyCalGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  dailyWaterGoalMl: number;
  streak: number;
  createdAt?: string;
}

export interface FoodLogItem {
  id: string;
  meal: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  gi?: number;
  shifaIndex?: number;
  aiDetected: boolean;
  food: { id: string; name: string; tags: string[] };
}

export interface DayLog {
  date: string;
  items: FoodLogItem[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  mealShifa?: Record<string, any>;
}

interface AppState {
  user: User | null;
  accessToken: string | null;
  todayLog: DayLog | null;
  waterToday: number;
  isHydrated: boolean;

  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  setTodayLog: (log: DayLog) => void;
  setWaterToday: (ml: number) => void;
  loadFromStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  // If mock mode, pre-populate state so the app skips auth
  user: USE_MOCK ? (MOCK_USER as User) : null,
  accessToken: USE_MOCK ? 'mock-token' : null,
  todayLog: USE_MOCK ? (MOCK_DAY_LOG as unknown as DayLog) : null,
  waterToday: USE_MOCK ? MOCK_WATER.totalMl : 0,
  isHydrated: USE_MOCK,

  setUser: (user) => {
    set({ user });
    if (!USE_MOCK) AsyncStorage.setItem('user', JSON.stringify(user));
  },

  setTokens: (access, refresh) => {
    set({ accessToken: access });
    if (!USE_MOCK) {
      AsyncStorage.setItem('accessToken', access);
      AsyncStorage.setItem('refreshToken', refresh);
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, todayLog: null, waterToday: 0 });
    if (!USE_MOCK) AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  setTodayLog: (log) => set({ todayLog: log }),
  setWaterToday: (ml) => set({ waterToday: ml }),

  loadFromStorage: async () => {
    if (USE_MOCK) {
      set({ isHydrated: true });
      return;
    }
    try {
      const [userJson, accessToken] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('accessToken'),
      ]);
      if (userJson && accessToken) {
        set({ user: JSON.parse(userJson), accessToken, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },
}));
