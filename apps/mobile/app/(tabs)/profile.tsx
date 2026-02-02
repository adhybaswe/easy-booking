import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { supabase } from '@/src/services/supabase';
import { Button } from '@/src/components/ui/Button';
import { User, Mail, Phone, LogOut, Edit2, Shield, Bell, Check, X } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { session, logout, user, role } = useAuthStore();

    const [profile, setProfile] = useState<{
        full_name: string;
        phone_number: string;
    } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const userEmail = session?.user?.email ?? '';

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('full_name, phone_number')
                .eq('id', user.id)
                .single();

            if (error) {
                // If 406 or Not Found, might need to create it (though trigger should handle it)
                console.warn('Profile fetch error:', error);
            } else if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
                setPhoneNumber(data.phone_number || '');
            }
        } catch (error) {
            console.error('Catch error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user?.id) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    phone_number: phoneNumber,
                })
                .eq('id', user.id);

            if (error) throw error;

            setProfile({ full_name: fullName, phone_number: phoneNumber });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Update Failed', error.message || 'An error occurred while updating profile');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            logout();
                            router.replace('/(auth)/login');
                        }
                    }
                }
            ]
        );
    };

    if (loading && !profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Profile */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(fullName || userEmail).charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editAvatarButton}
                                onPress={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? <X size={16} color="#FFF" /> : <Edit2 size={16} color="#FFF" />}
                            </TouchableOpacity>
                        </View>

                        {!isEditing ? (
                            <>
                                <Text style={styles.nameText}>{fullName || 'Set your name'}</Text>
                                <Text style={styles.emailText}>{userEmail}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{role?.toUpperCase() || 'USER'}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.editForm}>
                                <Text style={styles.editingTitle}>Editing Profile</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.content}>
                        {isEditing ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <User size={20} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholder="Enter full name"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <Text style={styles.sectionLabel}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <Phone size={20} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        placeholder="e.g. +62 812..."
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnCancel]}
                                        onPress={() => setIsEditing(false)}
                                    >
                                        <Text style={styles.btnCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnSave]}
                                        onPress={handleUpdateProfile}
                                        disabled={updating}
                                    >
                                        {updating ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <Check size={18} color="#FFF" />
                                                <Text style={styles.btnSaveText}>Save</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Account Information</Text>
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIcon}>
                                            <Mail size={18} color="#64748B" />
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Email Address</Text>
                                            <Text style={styles.infoValue}>{userEmail}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIcon}>
                                            <Phone size={18} color="#64748B" />
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Phone Number</Text>
                                            <Text style={styles.infoValue}>{phoneNumber || 'Not set'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Preferences</Text>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => router.push('/notifications')}
                                    >
                                        <Bell size={20} color="#334155" />
                                        <Text style={styles.menuItemText}>Notifications</Text>
                                        <View style={{ flex: 1 }} />
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>New</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.menuItem}>
                                        <Shield size={20} color="#334155" />
                                        <Text style={styles.menuItemText}>Privacy & Security</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.logoutButton}
                                    onPress={handleLogout}
                                >
                                    <LogOut size={20} color="#EF4444" />
                                    <Text style={styles.logoutText}>Sign Out from App</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F8FAFC',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#2563EB',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2563EB',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    nameText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    emailText: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    editForm: {
        width: '100%',
        alignItems: 'center',
    },
    editingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2563EB',
    },
    content: {
        padding: 24,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#334155',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    btn: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    btnCancel: {
        backgroundColor: '#F1F5F9',
    },
    btnCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    btnSave: {
        backgroundColor: '#2563EB',
    },
    btnSaveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#334155',
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        marginTop: 10,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
    },
    badge: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

