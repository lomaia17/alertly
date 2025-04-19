'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import AuthLoadingScreen from './AuthLoadingScreen';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user detected, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}