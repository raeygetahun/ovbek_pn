'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCancellationRequests, CancellationRequest } from '@/app/utils/api/Volunteer/cancellationRequests';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';

interface PendingCancellationsProps {
    onCountChange?: (count: number) => void;
}

const PendingCancellations: React.FC<PendingCancellationsProps> = ({ onCountChange }) => {
    const { user } = useFirebaseAuth();
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState<CancellationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        const loadRequests = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                const response = await fetchCancellationRequests(user.email);
                if (response.success && response.data) {
                    setRequests(response.data);
                    onCountChange?.(response.data.length);
                }
            } catch (error) {
                console.error('Error fetching cancellation requests:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [user?.email, onCountChange]);

    const formatDate = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: i18n.language !== 'de'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="bg-gray-100 rounded-lg p-6 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return null;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Pending Cancellations')}</h2>

            <div className="space-y-4">
                {requests.map((request) => (
                    <div
                        key={request.applicationId}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                        {t('Awaiting Review')}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {formatDate(request.startTime)}
                                </h3>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">
                                        {formatTime(request.startTime)} - {formatTime(request.endTime)}
                                    </span>
                                </div>

                                {request.cancellationReason && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border border-amber-100">
                                        <p className="text-sm text-gray-500 mb-1">{t('Reason')}:</p>
                                        <p className="text-gray-700 text-sm">{request.cancellationReason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex-shrink-0">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">{t('Pending admin review')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingCancellations;
