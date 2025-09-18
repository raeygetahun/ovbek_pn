'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'de' ? 'en' : 'de';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={i18n.language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
        >
            <span className="text-lg">
                {i18n.language === 'de' ? '🇬🇧' : '🇩🇪'}
            </span>
            <span className="hidden sm:inline">
                {i18n.language === 'de' ? 'EN' : 'DE'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
