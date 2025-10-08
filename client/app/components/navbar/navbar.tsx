'use client';

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/components/languageSwitcher/LanguageSwitcher';
import { deleteUser } from '@/app/utils/api/deleteUser';
import { useState } from 'react';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';
import { auth } from '@/app/utils/Firebase/config';

const Navbar = () => {
  const { user } = useFirebaseAuth();
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.displayName || user?.email || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : '';

  const handleDeleteAccount = async () => {
    if (!confirm(t('Are you sure you want to delete your account?'))) return;
    const email = user?.email;
    if (!email) {
      setDeleteError(t('Unable to find your email.'));
      return;
    }

    setDeleteError('');
    setIsDeleting(true);
    const response = await deleteUser(email);
    setIsDeleting(false);

    if (response.success) {
      await signOut(auth);
      return;
    }

    setDeleteError(response.error || t('An error occurred'));
  };

  return (
    <nav className="bg-black p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-500 text-white mr-2"
          aria-label={t('Open account menu')}
        >
          {initials}
        </button>
        <a className="text-white font-semibold">{displayName}</a>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="bg-white rounded-lg">
          <LanguageSwitcher />
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center text-white focus:outline-none"
        >
          <span>{t('Sign Out')}</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <button
              onClick={handleDeleteAccount}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              disabled={isDeleting}
            >
              {isDeleting ? t('Deleting...') : t('Delete Account')}
            </button>
            {deleteError && (
              <div className="px-4 py-2 text-sm text-red-500">{deleteError}</div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
