import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/services/supabase';
import { Service } from '@/src/types';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setServices(data);
      }
    } catch (error: any) {
      console.error('Error fetching services:', error.message);
      // Optional: Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()} {user?.email ? `👋` : ''}</Text>
          <Text style={styles.title}>Book a Service</Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No services available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  router.push(`/booking/${service.id}`);
                }}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                </View>
                <View style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  loader: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
  servicesGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  dot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  bookButton: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#0284C7',
    fontWeight: '600',
    fontSize: 14,
  },
});
