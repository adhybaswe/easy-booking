import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    isAuthenticated: boolean;
    setSession: (session: Session | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    isAuthenticated: false,
    setSession: (session) => set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session
    }),
    logout: () => set({ session: null, user: null, isAuthenticated: false }),
}));
