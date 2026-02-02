import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Scissors, Users, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
    children: ReactNode;
    title: string;
}

export default function Layout({ children, title }: LayoutProps) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // AuthStore will be updated by onAuthStateChange in App.tsx
    };

    const navItems = [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        { name: 'Services', to: '/services', icon: Scissors },
        { name: 'Schedules', to: '/schedules', icon: Calendar },
        { name: 'Bookings', to: '/bookings', icon: Users },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary-600">BookEasy</h1>
                    <p className="text-xs text-slate-400 font-medium">Admin Dashboard</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-500">admin@bookeasy.com</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
                </header>
                {children}
            </main>
        </div>
    );
}
