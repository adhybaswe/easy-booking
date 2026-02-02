import { LayoutDashboard, Calendar, Scissors, Users, Plus } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { name: 'Total Bookings', value: '128', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Active Services', value: '12', icon: Scissors, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Pending Approvals', value: '5', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
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
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-primary-600 bg-primary-50 rounded-xl font-medium">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                        <Scissors size={20} />
                        Services
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                        <Calendar size={20} />
                        Schedules
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                        <Users size={20} />
                        Bookings
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-500">admin@bookeasy.com</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Overview</h2>
                        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary-200">
                        <Plus size={20} />
                        New Service
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-slate-500 font-medium mb-1">{stat.name}</p>
                            <h3 className="text-4xl font-bold text-slate-800">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Recent Bookings</h3>
                        <button className="text-primary-600 font-semibold text-sm">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-8 py-4">Customer</th>
                                    <th className="px-8 py-4">Service</th>
                                    <th className="px-8 py-4">Date & Time</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 font-medium text-slate-700">John Doe</td>
                                        <td className="px-8 py-6 text-slate-600">Premium Haircut</td>
                                        <td className="px-8 py-6 text-slate-600">Oct 24, 2023 • 10:00 AM</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">Confirmed</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
