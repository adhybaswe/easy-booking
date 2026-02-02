import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useFocusEffect } from 'expo-router';

interface BookingItem {
    id: string;
    status: string;
    created_at: string;
    services: {
        name: string;
    };
    schedules: {
        date: string;
        start_time: string;
    };
}

export default function BookingsScreen() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                  id,
                  status,
                  created_at,
                  services ( name ),
                  schedules ( date, start_time )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data as any || []);
        } catch (error: any) {
            console.error('Error fetching bookings:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 1. Initial and Focus-based fetch
    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [user])
    );

    // 2. Real-time subscription for immediate updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`user-bookings-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Real-time booking update:', payload);
                    fetchBookings(); // Refetch to get joined data
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#10B981';
            case 'completed': return '#64748B';
            case 'cancelled': return '#EF4444';
            case 'pending': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'confirmed': return '#ECFDF5';
            case 'completed': return '#F1F5F9';
            case 'cancelled': return '#FEF2F2';
            case 'pending': return '#FFFBEB';
            default: return '#EFF6FF';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>
            </View>

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You don't have any bookings yet.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.serviceName}>{item.services?.name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.dateText}>{formatDate(item.schedules?.date)}</Text>
                            <Text style={styles.timeText}>
                                {item.schedules?.start_time ? item.schedules.start_time.substring(0, 5) : ''}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
    },
    listContent: {
        padding: 24,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateText: {
        color: '#64748B',
    },
    timeText: {
        color: '#0F172A',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
    },
});
