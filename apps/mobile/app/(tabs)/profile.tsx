import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { supabase } from '@/src/services/supabase';
import { Button } from '@/src/components/ui/Button';

export default function ProfileScreen() {
    const router = useRouter();
    const { session, logout } = useAuthStore();
    const userEmail = session?.user?.email ?? 'user@example.com';

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            logout();
            // Router will be handled by auth listener in root layout ideally
            // But we can force it here
            router.replace('/(auth)/login');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userEmail.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.email}>{userEmail}</Text>
                <Text style={styles.role}>Customer</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Notifications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Privacy & Security</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.spacer} />

                <Button
                    title="Sign Out"
                    variant="danger"
                    onPress={handleLogout}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0284C7',
    },
    email: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: '#64748B',
    },
    content: {
        padding: 24,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    menuItemText: {
        fontSize: 16,
        color: '#334155',
    },
    spacer: {
        flex: 1,
    },
});
