import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types/auth';

interface AuthStore extends AuthState {
  signIn: (user: User) => void;
  signOut: () => void;
  signInAsGuest: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      signIn: (user: User) => set({ user, error: null }),
      signOut: () => set({ user: null, error: null }),
      signInAsGuest: () => 
        set({ 
          user: { 
            id: `guest-${Date.now()}`, 
            isGuest: true 
          }, 
          error: null 
        }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'mango-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);