'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchAdminRecommendations, { SlotRecommendation } from '@/app/utils/api/Admin/adminRecommendations';

const AdminRecommendations: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [recommendations, setRecommendations] = useState<SlotRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [hasRequested, setHasRequested] = useState(false);

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    const loadRecommendations = async () => {
        try {
            setHasRequested(true);
            setLoading(true);
            setError(null);
            setInfoMessage(null);
            const response = await fetchAdminRecommendations();
            if (response.success && response.data) {
                setRecommendations(response.data);
                if (response.fallback || response.limitReached) {
                    setInfoMessage(response.message ? t(response.message) : t('Showing fallback recommendations.'));
                }
            } else if (response.success && response.data?.length === 0) {
                setRecommendations([]);
            } else {
                setError(response.error || t('An error occurred'));
            }
        } catch {
            setError(t('An error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    // Group recommendations by date
    const groupedByDate = recommendations.reduce<Record<string, SlotRecommendation[]>>((acc, rec) => {
        if (!acc[rec.date]) {
            acc[rec.date] = [];
        }
        acc[rec.date].push(rec);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg mt-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-gray-700 rounded w-64"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="h-4 bg-gray-700 rounded w-48"></div>
                            <div className="h-3 bg-gray-700 rounded w-32"></div>
                            <div className="space-y-2 mt-3">
                                <div className="h-3 bg-gray-700 rounded w-full"></div>
                                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg mt-4">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={loadRecommendations}
                    className="mt-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 px-4 rounded text-sm"
                >
                    {t('Retry')}
                </button>
            </div>
        );
    }

    if (!hasRequested) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg mt-4">
                <h2 className="text-xl font-bold text-white mb-2">{t('Smart Scheduling')}</h2>
                <p className="text-gray-400 mb-4">
                    {t('AI-powered recommendations for filling open slots')}
                </p>
                <button
                    onClick={loadRecommendations}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 px-4 rounded text-sm"
                >
                    {t('Get Recommendations')}
                </button>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-gray-900 p-6 rounded-lg mt-4">
                <h2 className="text-xl font-bold text-white mb-2">{t('Smart Scheduling')}</h2>
                <p className="text-gray-400">{t('No coverage gaps found. All slots are covered!')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 p-6 rounded-lg mt-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{t('Smart Scheduling')}</h2>
                <button
                    onClick={loadRecommendations}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-1.5 px-4 rounded text-sm"
                >
                    {t('Refresh')}
                </button>
            </div>

            {infoMessage && (
                <div className="bg-blue-600/70 text-white p-3 rounded mb-4 text-sm font-medium">
                    {infoMessage}
                </div>
            )}

            <div className="space-y-6">
                {Object.entries(groupedByDate).map(([date, slots]) => (
                    <div key={date}>
                        <h3 className="text-lg font-semibold text-indigo-300 mb-3 border-b border-gray-700 pb-2">
                            {formatDate(date)}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {slots.map((slot) => (
                                <div
                                    key={`${slot.date}-${slot.slot}`}
                                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                                >
                                    <div className="text-white font-medium text-base mb-3">
                                        {slot.slotDisplay}
                                    </div>
                                    <div className="space-y-3">
                                        {slot.volunteers.map((vol, idx) => (
                                            <div
                                                key={vol.email}
                                                className="flex items-start gap-3 bg-gray-700/50 rounded p-3"
                                            >
                                                <span className="bg-indigo-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="text-white font-medium text-sm">
                                                        {vol.name}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        {vol.email}
                                                    </div>
                                                    <div className="text-gray-300 text-xs mt-1">
                                                        {vol.reason}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminRecommendations;
