import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/src/services/supabase';
import { Service } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ArrowLeft } from 'lucide-react-native';

export default function AddScheduleScreen() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [loading, setLoading] = useState(false);
    const [fetchingServices, setFetchingServices] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;
            setServices(data || []);
            if (data && data.length > 0) setSelectedServiceId(data[0].id);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to fetch services');
        } finally {
            setFetchingServices(false);
        }
    };

    const handleSave = async () => {
        if (!selectedServiceId || !date || !startTime || !endTime) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('schedules').insert({
                service_id: selectedServiceId,
                date,
                start_time: startTime,
                end_time: endTime,
                is_available: true,
            });

            if (error) throw error;

            Alert.alert('Success', 'Schedule added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Add Schedule', headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Schedule</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Select Service</Text>
                {fetchingServices ? (
                    <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 10 }} />
                ) : (
                    <View style={styles.serviceList}>
                        {services.map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                style={[
                                    styles.serviceItem,
                                    selectedServiceId === s.id && styles.serviceItemSelected
                                ]}
                                onPress={() => setSelectedServiceId(s.id)}
                            >
                                <Text style={[
                                    styles.serviceItemText,
                                    selectedServiceId === s.id && styles.serviceItemTextSelected
                                ]}>
                                    {s.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Input
                    label="Date (YYYY-MM-DD)"
                    value={date}
                    onChangeText={setDate}
                    placeholder="2023-12-31"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Input
                            label="Start Time (HH:mm)"
                            value={startTime}
                            onChangeText={setStartTime}
                            placeholder="09:00"
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Input
                            label="End Time (HH:mm)"
                            value={endTime}
                            onChangeText={setEndTime}
                            placeholder="10:00"
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Create Schedule"
                        onPress={handleSave}
                        isLoading={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    content: {
        padding: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    serviceList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    serviceItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    serviceItemSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    serviceItemText: {
        fontSize: 14,
        color: '#475569',
    },
    serviceItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        marginTop: 32,
    },
});
