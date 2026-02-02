export type Role = 'guest' | 'user' | 'admin' | 'super_admin';

export interface User {
    id: string;
    email: string;
    role: Role;
    full_name?: string;
    phone_number?: string;
    created_at: string;
}

export interface Service {
    id: string;
    name: string;
    duration: number; // in minutes
    price: number;
    is_active: boolean;
}

export interface Schedule {
    id: string;
    service_id: string;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:mm
    end_time: string; // HH:mm
    is_available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    user_id: string;
    service_id: string;
    schedule_id: string;
    status: BookingStatus;
    created_at: string;
}
