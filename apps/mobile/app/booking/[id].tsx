import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Service, Schedule } from '@/src/types';
import { Button } from '@/src/components/ui/Button';

export default function BookingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        fetchService();
    }, [id]);

    useEffect(() => {
        if (selectedDate) {
            fetchSchedules(selectedDate);
        }
    }, [selectedDate]);

    const fetchService = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setService(data);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load service details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async (date: string) => {
        try {
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .eq('service_id', id)
                .eq('date', date)
                .eq('is_available', true)
                .order('start_time');

            if (error) throw error;
            setSchedules(data || []);
        } catch (error: any) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
        }
    };

    const handleBooking = async () => {
        if (!selectedSchedule || !user) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        setBookingLoading(true);

        try {
            // Create booking
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    user_id: user.id,
                    service_id: id,
                    schedule_id: selectedSchedule.id,
                    status: 'pending',
                })
                .select()
                .single();

            if (bookingError) throw bookingError;

            // Mark schedule as unavailable
            const { error: scheduleError } = await supabase
                .from('schedules')
                .update({ is_available: false })
                .eq('id', selectedSchedule.id);

            if (scheduleError) throw scheduleError;

            Alert.alert(
                'Success!',
                'Your booking has been confirmed.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)/bookings'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create booking');
            console.error(error);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    if (!service) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Service not found</Text>
            </SafeAreaView>
        );
    }

    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Service Info */}
                <View style={styles.serviceCard}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceDetails}>
                        <Text style={styles.servicePrice}>${service.price}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.serviceDuration}>{service.duration} min</Text>
                    </View>
                </View>

                {/* Calendar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <Calendar
                        minDate={today}
                        maxDate={maxDateStr}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: '#2563EB',
                            },
                        }}
                        theme={{
                            todayTextColor: '#2563EB',
                            selectedDayBackgroundColor: '#2563EB',
                            selectedDayTextColor: '#FFFFFF',
                            arrowColor: '#2563EB',
                            monthTextColor: '#0F172A',
                            textMonthFontWeight: '600',
                        }}
                    />
                </View>

                {/* Time Slots */}
                {selectedDate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Times</Text>
                        {schedules.length === 0 ? (
                            <Text style={styles.emptyText}>No available slots for this date</Text>
                        ) : (
                            <View style={styles.slotsGrid}>
                                {schedules.map((schedule) => (
                                    <TouchableOpacity
                                        key={schedule.id}
                                        style={[
                                            styles.slotButton,
                                            selectedSchedule?.id === schedule.id && styles.slotButtonSelected,
                                        ]}
                                        onPress={() => setSelectedSchedule(schedule)}
                                    >
                                        <Text
                                            style={[
                                                styles.slotText,
                                                selectedSchedule?.id === schedule.id && styles.slotTextSelected,
                                            ]}
                                        >
                                            {schedule.start_time.substring(0, 5)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Book Button */}
                {selectedSchedule && (
                    <View style={styles.footer}>
                        <Button
                            title="Confirm Booking"
                            onPress={handleBooking}
                            isLoading={bookingLoading}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    serviceName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },
    serviceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2563EB',
    },
    dot: {
        marginHorizontal: 8,
        color: '#CBD5E1',
    },
    serviceDuration: {
        fontSize: 16,
        color: '#64748B',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 12,
    },
    emptyText: {
        color: '#64748B',
        textAlign: 'center',
        marginTop: 20,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    slotButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    slotButtonSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    slotText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    slotTextSelected: {
        color: '#FFFFFF',
    },
    footer: {
        marginTop: 24,
    },
});
