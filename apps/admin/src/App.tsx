import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Schedules from './pages/Schedules';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated, setSession } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/services"
          element={isAuthenticated ? <Services /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/schedules"
          element={isAuthenticated ? <Schedules /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/bookings"
          element={isAuthenticated ? <Bookings /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
