import { useEffect } from 'react';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/context/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  return <AppRoutes />;
}
