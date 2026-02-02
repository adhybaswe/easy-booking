# EasyBooking 🚀

EasyBooking is a comprehensive, modern service booking platform built as a monorepo. It includes a mobile application for customers and a web-based dashboard for administrators.

## 🌟 Features

### Mobile App (Customer)
- **Seamless Booking**: Browse services and book available time slots in real-time.
- **Real-time Status**: View booking status (Pending, Confirmed, Cancelled, Completed) with instant updates.
- **Smart Notifications**: Built-in inbox for system messages and Push Notifications for real-time alerts.
- **Profile Management**: Manage personal information including full name and phone number.
- **Premium UI**: Clean, modern, and responsive design with smooth transitions.

### Admin Dashboard (Provider)
- **Booking Management**: View and manage all user bookings from a central dashboard.
- **Status Control**: Confirm or cancel bookings with automatic passenger notification.
- **Data Insights**: (Upcoming) Visual statistics for service performance and booking trends.
- **Premium Aesthetics**: Built with Tailwind CSS v4 for a cutting-edge visual experience.

### Backend (Supabase)
- **Automated Workflows**: Database triggers handle schedule availability automatically.
- **Real-time Engine**: Powered by PostgreSQL replication for instant data synchronization.
- **Secure Auth**: Row Level Security (RLS) ensures user data privacy.

## 🛠️ Tech Stack

- **Monorepo Management**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)
- **Mobile**: [Expo](https://expo.dev/) (React Native) + [Expo Router](https://docs.expo.dev/router/introduction/) + [Zustand](https://github.com/pmndrs/zustand)
- **Admin Web**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Auth)
- **Icons**: [Lucide React](https://lucide.dev/) / [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)

## 📁 Project Structure

```text
.
├── apps/
│   ├── admin/       # Management Dashboard (Vite + React)
│   └── mobile/      # Customer Mobile App (Expo)
├── packages/        # (Optional) Shared configurations/components
└── package.json     # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- pnpm (`npm install -g pnpm`)
- Expo Go app (for mobile testing)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Environment Setup
Create `.env` files in `apps/admin` and `apps/mobile`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
Run the SQL scripts provided in the documentation or Supabase SQL Editor to:
1. Create `services`, `schedules`, `bookings`, `users`, and `notifications` tables.
2. Enable RLS and set up appropriate policies.
3. Apply Database Triggers for automatic status updates.

### Running the Project

**Start Admin Dashboard:**
```bash
pnpm start:admin
```

**Start Mobile App:**
```bash
pnpm start:android
# or
pnpm start:ios
```

## 📱 Notification System
The project uses a dual-layer notification system:
1. **In-App**: Stored in the database and accessible via the notifications screen.
2. **Push Notifications**: Integrated with Expo Push Service for real-time mobile alerts.

## ⚖️ License
MIT License. Created with ❤️ by Antigravity.
