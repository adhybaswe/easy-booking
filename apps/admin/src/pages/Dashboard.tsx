import { Calendar, Scissors, Plus, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { name: 'Total Bookings', value: '0', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Active Services', value: '0', icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Pending Bookings', value: '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch stats
            const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
            const { count: servicesCount } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true);
            const { count: pendingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            setStats([
                { name: 'Total Bookings', value: bookingsCount?.toString() || '0', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Active Services', value: servicesCount?.toString() || '0', icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { name: 'Pending Bookings', value: pendingCount?.toString() || '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            ]);

            // Fetch recent bookings
            const { data: recent } = await supabase
                .from('bookings')
                .select(`
          id,
          status,
          created_at,
          users ( email ),
          services ( name ),
          schedules ( date, start_time )
        `)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentBookings(recent || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Dashboard Overview">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <p className="text-slate-500 font-medium">Monitoring your business performance in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/services')}
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Manage Services
                    </button>
                    <button
                        onClick={() => navigate('/schedules')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-200"
                    >
                        <Plus size={20} />
                        Add Schedule
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.name}</p>
                                <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Recent Activity Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                            <Clock size={22} className="text-primary-500" />
                            Recent Booking Activities
                        </h3>
                        <button
                            onClick={() => navigate('/bookings')}
                            className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1"
                        >
                            View all bookings <TrendingUp size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-5 border-b border-slate-50">Customer</th>
                                    <th className="px-8 py-5 border-b border-slate-50">Service</th>
                                    <th className="px-8 py-5 border-b border-slate-50">Date & Time</th>
                                    <th className="px-8 py-5 border-b border-slate-50">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-8 py-10 text-center animate-pulse">Loading data...</td></tr>
                                ) : recentBookings.length === 0 ? (
                                    <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400">No recent bookings found.</td></tr>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors uppercase text-sm tracking-tight">{booking.users.email.split('@')[0]}</p>
                                            </td>
                                            <td className="px-8 py-6 text-slate-600 font-medium">{booking.services.name}</td>
                                            <td className="px-8 py-6 text-slate-500 text-sm font-semibold">
                                                {booking.schedules.date} <span className="text-slate-300 mx-1">•</span> {booking.schedules.start_time}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        booking.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
