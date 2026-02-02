import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    CheckCheck,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface Booking {
    id: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
    users: {
        email: string;
        full_name?: string;
        phone_number?: string;
    };
    services: {
        name: string;
        price: number;
    };
    schedules: {
        date: string;
        start_time: string;
    };
}

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        let query = supabase
            .from('bookings')
            .select(`
                id,
                status,
                created_at,
                users ( email, full_name, phone_number ),
                services ( name, price ),
                schedules ( date, start_time )
            `)
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching bookings:', error);
        } else {
            setBookings(data as any || []);
        }
        setLoading(false);
    };

    const confirmDelete = (id: string) => {
        setBookingToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!bookingToDelete) return;

        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingToDelete);

        if (error) {
            alert('Failed to delete booking: ' + error.message);
        } else {
            fetchBookings();
        }
        setIsDeleteDialogOpen(false);
        setBookingToDelete(null);
    };

    const updateBookingStatus = async (id: string, newStatus: string) => {
        try {
            // 1. Get Booking details first to get user_id and service name
            const { data: booking, error: fetchError } = await supabase
                .from('bookings')
                .select('user_id, services(name)')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Update the status
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Fetch User's Push Token
            const { data: userProfile, error: userError } = await supabase
                .from('users')
                .select('push_token')
                .eq('id', booking.user_id)
                .single();

            if (!userError && userProfile?.push_token) {
                const serviceName = (booking.services as any)?.name || 'Service';
                let title = '';
                let body = '';

                if (newStatus === 'confirmed') {
                    title = 'Booking Confirmed! ✅';
                    body = `Your booking for ${serviceName} has been confirmed. See you there!`;
                } else if (newStatus === 'cancelled') {
                    title = 'Booking Cancelled ❌';
                    body = `Sorry, your booking for ${serviceName} has been cancelled.`;
                }

                if (title && body) {
                    await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            to: userProfile.push_token,
                            title,
                            body,
                            data: { bookingId: id },
                        }),
                    });
                }
            }

            fetchBookings();
        } catch (error: any) {
            console.error('Update Status Error:', error);
            alert('Failed to update status: ' + error.message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={14} /> Confirmed</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight bg-rose-50 text-rose-600 border border-rose-100"><XCircle size={14} /> Cancelled</span>;
            case 'completed':
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight bg-blue-50 text-blue-600 border border-blue-100"><CheckCheck size={14} /> Completed</span>;
            default:
                return <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight bg-amber-50 text-amber-600 border border-amber-100"><Clock size={14} /> Pending</span>;
        }
    };

    const filteredBookings = bookings.filter(b => {
        const userEmail = b.users?.email || '';
        const serviceName = b.services?.name || '';
        return userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <Layout title="Bookings Management">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 max-w-md relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by customer email or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent font-semibold text-slate-600 focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                                    <th className="px-8 py-5 border-b border-slate-100">Customer Details</th>
                                    <th className="px-8 py-5 border-b border-slate-100">Service Info</th>
                                    <th className="px-8 py-5 border-b border-slate-100">Schedule</th>
                                    <th className="px-8 py-5 border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium">
                                            No bookings found for the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                        {booking.users?.email?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{booking.users?.email ? booking.users.email.split('@')[0] : 'Unknown'}</p>
                                                        <p className="text-xs text-slate-400">{booking.users?.email || 'No email available'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-700">{booking.services?.name || 'Deleted Service'}</p>
                                                <p className="text-xs font-semibold text-primary-600">${booking.services?.price || '0'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{booking.schedules?.date || 'No Date'}</span>
                                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                                                        <Clock size={12} /> {booking.schedules?.start_time || 'No Time'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                            className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors shadow-sm bg-white border border-emerald-50"
                                                            title="Confirm Booking"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    )}
                                                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors shadow-sm bg-white border border-blue-50"
                                                            title="Mark as Completed"
                                                        >
                                                            <CheckCheck size={18} />
                                                        </button>
                                                    )}
                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <button
                                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shadow-sm bg-white border border-rose-50"
                                                            title="Cancel Booking"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}

                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === booking.id ? null : booking.id);
                                                            }}
                                                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {openMenuId === booking.id && (
                                                            <div
                                                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {booking.users?.phone_number && (
                                                                    <a
                                                                        href={`https://wa.me/${booking.users.phone_number.replace(/\D/g, '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                                                        onClick={() => setOpenMenuId(null)}
                                                                    >
                                                                        <MessageSquare size={16} className="text-emerald-500" />
                                                                        <span>WhatsApp</span>
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(null);
                                                                        confirmDelete(booking.id);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Delete Booking</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100">
                        <span>Showing {filteredBookings.length} of {bookings.length} total bookings</span>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-100 p-8 animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                                <AlertCircle size={40} className="text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Booking?</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Are you sure you want to permanently delete this booking? This action cannot be undone.
                            </p>
                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200"
                                >
                                    Yes, Delete Booking
                                </button>
                                <button
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
