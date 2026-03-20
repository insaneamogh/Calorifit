import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

export interface FoodLogItem {
  id: string;
  meal: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  aiDetected: boolean;
  food: { id: string; name: string; tags: string[] };
}

export interface DayLog {
  date: string;
  items: FoodLogItem[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

interface AppState {
  user: User | null;
  accessToken: string | null;
  todayLog: DayLog | null;
  waterToday: number;

  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  setTodayLog: (log: DayLog) => void;
  setWaterToday: (ml: number) => void;
  loadFromStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  accessToken: null,
  todayLog: null,
  waterToday: 0,

  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },

  setTokens: (access, refresh) => {
    set({ accessToken: access });
    AsyncStorage.setItem('accessToken', access);
    AsyncStorage.setItem('refreshToken', refresh);
  },

  logout: () => {
    set({ user: null, accessToken: null, todayLog: null, waterToday: 0 });
    AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  setTodayLog: (log) => set({ todayLog: log }),
  setWaterToday: (ml) => set({ waterToday: ml }),

  loadFromStorage: async () => {
    const [userJson, accessToken] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('accessToken'),
    ]);
    if (userJson && accessToken) {
      set({ user: JSON.parse(userJson), accessToken });
    }
  },
}));
