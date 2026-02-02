import { useEffect, useState } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface Service {
    id: string;
    name: string;
}

interface Schedule {
    id: string;
    service_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    services: {
        name: string;
    };
}

export default function Schedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Form state
    const [formServiceId, setFormServiceId] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [selectedServiceId, selectedDate]);

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from('services')
            .select('id, name')
            .eq('is_active', true)
            .order('name');

        if (!error && data) {
            setServices(data);
            if (data.length > 0) setFormServiceId(data[0].id);
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        let query = supabase
            .from('schedules')
            .select('*, services(name)')
            .eq('date', selectedDate)
            .order('start_time');

        if (selectedServiceId !== 'all') {
            query = query.eq('service_id', selectedServiceId);
        }

        const { data, error } = await query;

        if (!error) {
            setSchedules(data || []);
        }
        setLoading(false);
    };

    const handleCreateSchedules = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase.from('schedules').insert({
                service_id: formServiceId,
                date: formDate,
                start_time: startTime,
                end_time: endTime,
                is_available: true,
            });

            if (error) throw error;

            if (formDate === selectedDate) {
                fetchSchedules();
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this time slot?')) return;

        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Cannot delete slot. It might have an active booking.');
        } else {
            fetchSchedules();
        }
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <Layout title="Schedule Management">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-3 hover:bg-slate-50 transition-colors text-slate-500 border-r border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-5 py-2 flex items-center gap-3">
                            <CalendarIcon size={18} className="text-primary-600" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="font-semibold text-slate-700 focus:outline-none bg-transparent"
                            />
                        </div>
                        <button
                            onClick={() => changeDate(1)}
                            className="p-3 hover:bg-slate-50 transition-colors text-slate-500 border-l border-slate-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="bg-transparent font-medium text-slate-600 focus:outline-none"
                        >
                            <option value="all">All Services</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary-200 whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add Time Slot
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {schedules.length === 0 ? (
                        <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-500 font-medium text-lg">No schedules found for this date.</p>
                            <p className="text-slate-400 text-sm">Start by adding available time slots for your services.</p>
                        </div>
                    ) : (
                        schedules.map((slot) => (
                            <div key={slot.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-2xl ${slot.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <Clock size={20} />
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSchedule(slot.id)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h4 className="font-bold text-slate-800 mb-1 max-w-[80%] truncate">
                                    {slot.services.name}
                                </h4>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl font-black text-slate-900">{slot.start_time}</span>
                                    <span className="text-slate-300 font-medium">to</span>
                                    <span className="text-lg font-bold text-slate-500">{slot.end_time}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${slot.is_available ? 'text-emerald-500' : 'text-rose-400'}`}>
                                        {slot.is_available ? 'Available' : 'Booked'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Slot Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Plus size={20} className="text-primary-600" />
                                Add New Slot
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl shadow-sm transition-colors"
                            >
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSchedules} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Service</label>
                                <select
                                    value={formServiceId}
                                    onChange={(e) => setFormServiceId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white bg-slate-50/50 transition-all"
                                    required
                                >
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white bg-slate-50/50 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white bg-slate-50/50 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white bg-slate-50/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-100 disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Time Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
