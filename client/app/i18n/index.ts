'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';

const resources = {
    de: { translation: de }
};

// Get saved language from localStorage or default to German
const getSavedLanguage = (): string => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('language') || 'de';
    }
    return 'de';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getSavedLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        // Return the key itself when no translation found (for English)
        returnEmptyString: false,
        parseMissingKeyHandler: (key) => key
    });

export default i18n;
