'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchSmartRecommendations, { Recommendation } from '@/app/utils/api/Volunteer/smartRecommendations';
import timeSlotApplication from '@/app/utils/api/Volunteer/timeslotApplication';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';

const SmartRecommendations: React.FC = () => {
    const { user } = useFirebaseAuth();
    const { t, i18n } = useTranslation();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingSlot, setApplyingSlot] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [hasRequested, setHasRequested] = useState(false);

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        setLoading(false);
    }, []);

    const loadRecommendations = async () => {
        if (!user?.email) return;

        try {
            setHasRequested(true);
            setLoading(true);
            setErrorMessage(null);
            setInfoMessage(null);
            const response = await fetchSmartRecommendations(user.email);
            if (response.success && response.data) {
                setRecommendations(response.data);
                if (response.fallback) {
                        setInfoMessage(response.message ? t(response.message) : t('Showing fallback recommendations.'));
                }
            } else if (response.error) {
                setErrorMessage(response.error);
            }
        } catch {
            setErrorMessage(t('Unable to load recommendations.'));
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (rec: Recommendation) => {
        if (!user?.email) return;

        const slotKey = `${rec.date}-${rec.slotId}`;
        setApplyingSlot(slotKey);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await timeSlotApplication(
                user.email,
                new Date(`${rec.date}T00:00:00`),
                rec.slotId
            );

            if (response.success) {
                setSuccessMessage(t('Applied for {{slot}} on {{date}}!', { slot: rec.slotDisplay, date: formatDate(rec.date) }));
                setRecommendations(prev =>
                    prev.filter(r => !(r.date === rec.date && r.slotId === rec.slotId))
                );
            } else {
                const errorData = JSON.parse(response.error ?? "{}");
                setErrorMessage(errorData.error || t('Timeslot application failed. Please try again.'));
            }
        } catch {
            setErrorMessage(t('Timeslot application failed. Please try again.'));
        } finally {
            setApplyingSlot(null);
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

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6 mb-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-indigo-700 rounded w-64"></div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/10 rounded-lg p-4 space-y-3">
                                <div className="h-4 bg-indigo-700 rounded w-3/4"></div>
                                <div className="h-3 bg-indigo-700 rounded w-1/2"></div>
                                <div className="h-3 bg-indigo-700 rounded w-full"></div>
                                <div className="h-8 bg-indigo-700 rounded w-full mt-2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">
                {t('Smart Recommendations for You')}
            </h2>

            {!hasRequested && (
                <div className="bg-white/10 rounded-lg p-4 mb-4 text-white text-sm">
                    <p className="mb-3">
                        {t('Get personalized slot suggestions. This request is limited per day, so only run it when you are ready to apply.')}
                    </p>
                    <button
                        onClick={loadRecommendations}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                    >
                        {t('Get Smart Recommendations')}
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-600/80 text-white p-3 rounded mb-4 text-sm font-medium">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-600/80 text-white p-3 rounded mb-4 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {infoMessage && (
                <div className="bg-blue-600/70 text-white p-3 rounded mb-4 text-sm font-medium">
                    {infoMessage}
                </div>
            )}

            {hasRequested && recommendations.length === 0 && !errorMessage && (
                <div className="text-indigo-100 text-sm">
                    {t('No recommendations available right now.')}
                </div>
            )}

            {recommendations.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                    {recommendations.map((rec) => (
                        <div
                            key={`${rec.date}-${rec.slotId}`}
                            className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-all"
                        >
                            <div className="text-white font-semibold text-lg">
                                {formatDate(rec.date)}
                            </div>
                            <div className="text-indigo-200 font-medium mt-1">
                                {rec.slotName} ({rec.slotDisplay})
                            </div>
                            <button
                                onClick={() => handleApply(rec)}
                                disabled={applyingSlot === `${rec.date}-${rec.slotId}`}
                                className="w-full mt-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                            >
                                {applyingSlot === `${rec.date}-${rec.slotId}`
                                    ? t('Applying...')
                                    : t('Apply Now')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartRecommendations;
