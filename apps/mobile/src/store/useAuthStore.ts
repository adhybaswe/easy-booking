import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { Role } from '../types';

interface AuthState {
    session: Session | null;
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setRole: (role: Role | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    role: null,
    isAuthenticated: false,
    setSession: (session) => set((state) => ({
        session,
        isAuthenticated: !!session,
        user: session ? session.user : null
    })),
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    logout: () => set({ session: null, user: null, role: null, isAuthenticated: false }),
}));
