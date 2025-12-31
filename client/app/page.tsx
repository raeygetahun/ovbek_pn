'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';

export default function Home() {
  const { user, isAdmin, loading } = useFirebaseAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (isAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/volunteer/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('Loading...')}</p>
      </div>
    </div>
  );
}

Home.requireAuth = true
