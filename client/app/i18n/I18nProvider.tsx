'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from './index';
import { ReactNode, useState, useEffect } from 'react';

interface I18nProviderProps {
    children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Sync i18n with localStorage on client mount
        const savedLang = localStorage.getItem('language');
        if (savedLang && savedLang !== i18n.language) {
            i18n.changeLanguage(savedLang);
        }
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by showing loading state until mounted
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
}
