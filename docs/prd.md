# Product Requirements Document (PRD)

## Booking Application (Mobile-First)

---

## 1. Product Overview

### 1.1 Product Name
**BookEasy** (working title)

### 1.2 Product Description
BookEasy is a mobile-first booking application that allows users to schedule services based on availability (e.g., barber shops, clinics, gyms, salons). The app provides a seamless booking experience for customers and an efficient schedule management system for service providers.

This product is designed as a portfolio-grade full-stack mobile application to demonstrate real-world business logic, authentication, role-based access control, and scheduling workflows.

### 1.3 Goals & Objectives
- Enable users to book services quickly and reliably
- Prevent schedule conflicts and double bookings
- Provide admins with tools to manage services and availability
- Showcase full-stack mobile development capabilities

### 1.4 Success Metrics
- Successful booking completion rate
- Zero double-booking incidents
- Admin ability to manage schedules without errors
- Stable performance on both iOS and Android

---

## 2. Target Users

### 2.1 End Users (Customers)
- Individuals booking personal services
- Mobile-first users
- Prefer self-service booking over manual communication

### 2.2 Admin Users (Service Providers)
- Business owners or staff
- Manage services, schedules, and bookings
- Need clear daily and weekly schedule visibility

---

## 3. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Guest | View available services |
| User | Register, login, book services, view booking history |
| Admin | Manage services, schedules, and bookings |
| Super Admin (optional) | System-wide management |

---

## 4. Core Features

### 4.1 Authentication
- Email and password authentication
- Role-based access control
- Secure session management

---

### 4.2 Service Management (Admin)
- Create, update, and delete services
- Define service duration
- Set pricing (optional)
- Enable or disable services

---

### 4.3 Availability & Scheduling
- Define working hours per service or provider
- Automatically generate available time slots
- Prevent overlapping bookings
- Timezone-aware scheduling

---

### 4.4 Booking Flow (User)
1. Select a service
2. Choose a date
3. View available time slots
4. Confirm booking
5. Receive booking confirmation

---

### 4.5 Booking Management
- Booking statuses:
  - Pending
  - Confirmed
  - Cancelled
  - Completed
- Users can cancel bookings within defined rules
- Admins can approve, reject, or update booking status

---

### 4.6 Notifications
- Booking confirmation notification
- Booking cancellation notification
- Booking reminder (optional)

---

### 4.7 Booking History & Logs
- Users can view booking history
- Admins can view bookings by date and status
- Basic activity logging

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Initial app load under 3 seconds
- Smooth interactions on mid-range devices

### 5.2 Security
- Role-based access control (RBAC)
- Secure API and database access
- Data isolation between users

### 5.3 Reliability
- No double bookings
- Graceful error handling
- Read-only access when offline

### 5.4 Scalability
- Support multiple service providers
- Ready for future multi-location expansion

---

## 6. Technical Stack

### 6.1 Architecture
- Monorepo using **Turborepo**
- Package manager: **pnpm** (Workspaces)

### 6.2 Frontend (Mobile App)
- **Directory**: `apps/mobile`
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router (File-based)
- **State management**: Zustand
- **Styling**: Native StyleSheet
- **Icons**: Lucide React Native & Expo Icons

### 6.3 Frontend (Admin Dashboard - Web)
- **Directory**: `apps/admin`
- **Framework**: React 19 (Vite)
- **Styling**: **Tailwind CSS v4** (CSS-first approach)
- **State management**: Zustand
- **Icons**: Lucide React

### 6.3 Backend
- Supabase
  - Authentication
  - PostgreSQL database
  - Storage
  - Realtime subscriptions
  - Row Level Security (RLS)

### 6.4 Optional Services
- Supabase Edge Functions
- Push notifications
- Scheduled background jobs

---

## 7. Database Schema (High-Level)

### Users
- `id`
- `email`
- `role`
- `created_at`

### Services
- `id`
- `name`
- `duration`
- `price`
- `is_active`

### Schedules
- `id`
- `service_id`
- `date`
- `start_time`
- `end_time`
- `is_available`

### Bookings
- `id`
- `user_id`
- `service_id`
- `schedule_id`
- `status`
- `created_at`

---

## 8. User Flow Summary

### User Flow
```
Login → Select Service → Select Date → Select Time → Confirm Booking → View History
```

### Admin Flow
```
Login → Manage Services → Set Schedule → View Bookings → Update Status
```

---

## 9. Out of Scope (Phase 1)
- Online payment integration
- Multi-language support
- Ratings and reviews
- In-app chat system

---

## 10. Future Enhancements
- Payment gateway integration
- Multi-branch or multi-location support
- Analytics and reporting dashboard
- AI-powered scheduling optimization

---

## 11. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Double booking | Transaction locking and validation |
| Timezone issues | Server-side time normalization |
| User confusion | Clear UX and confirmation steps |

---

## 12. Deliverables
- Mobile application (iOS & Android) for Customers
- Admin Dashboard (Web) for Service Providers
- Backend configuration (Supabase)
- Technical documentation and README
---

## 13. Project Implementation Status (v1.0)

### 13.1 Completed Features
- [x] **Monorepo Setup**: Turborepo with `apps/mobile` and `apps/admin`.
- [x] **Mobile Auth**: Login & Register with Supabase.
- [x] **Mobile Booking**: Service selection, Calendar date picker, and time slot booking.
- [x] **Mobile History**: Real-time booking history view.
- [x] **Admin Foundation**: Web dashboard setup with Tailwind v4 and basic layout.
- [x] **Database Schema**: All tables (Users, Services, Schedules, Bookings) & RLS policies configured.

### 13.2 Pending Features
- [ ] Admin Service Management (CRUD)
- [ ] Admin Schedule Management
- [ ] Admin Booking Approval Workflow
- [ ] Push Notifications

