'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    fetchAdminCancellationRequests,
    approveCancellation,
    rejectCancellation,
    CancellationRequest
} from '@/app/utils/api/Admin/cancellationRequests';

interface AdminCancellationsProps {
    onCountChange?: (count: number) => void;
}

const AdminCancellations: React.FC<AdminCancellationsProps> = ({ onCountChange }) => {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState<CancellationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await fetchAdminCancellationRequests();
            if (response.success && response.data) {
                setRequests(response.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(requests.length);
        }
    }, [requests.length, onCountChange]);

    const formatDate = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
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

    const handleApprove = async (applicationId: string) => {
        setProcessingId(applicationId);
        setSuccessMessage('');
        setErrorMessage('');

        const response = await approveCancellation(applicationId);

        if (response.success) {
            setSuccessMessage(t('Cancellation approved. Volunteer has been notified.'));
            setRequests(prev => prev.filter(r => r.applicationId !== applicationId));
        } else {
            setErrorMessage(response.error || t('An unexpected error occurred. Please try again later.'));
        }

        setProcessingId(null);
    };

    const handleReject = async (applicationId: string) => {
        setProcessingId(applicationId);
        setSuccessMessage('');
        setErrorMessage('');

        const response = await rejectCancellation(applicationId);

        if (response.success) {
            setSuccessMessage(t('Cancellation rejected. Volunteer remains scheduled and has been notified.'));
            setRequests(prev => prev.filter(r => r.applicationId !== applicationId));
        } else {
            setErrorMessage(response.error || t('An unexpected error occurred. Please try again later.'));
        }

        setProcessingId(null);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-gray-100 rounded-lg p-6 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Cancellation Requests')}</h2>

            {successMessage && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="font-medium text-green-800">
                        {successMessage}
                    </p>
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="font-medium text-red-800">
                        {errorMessage}
                    </p>
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">{t('No pending cancellation requests')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.applicationId}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                            {t('Cancellation Request')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-semibold text-gray-800">{request.volunteerName}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{formatDate(request.startTime)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatTime(request.startTime)} - {formatTime(request.endTime)}</span>
                                    </div>

                                    {request.cancellationReason && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-500 mb-1 font-medium">{t('Reason')}:</p>
                                            <p className="text-gray-700">{request.cancellationReason}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                                    <button
                                        onClick={() => handleApprove(request.applicationId)}
                                        disabled={processingId === request.applicationId}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        {processingId === request.applicationId ? t('Processing...') : t('Approve')}
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.applicationId)}
                                        disabled={processingId === request.applicationId}
                                        className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        {processingId === request.applicationId ? t('Processing...') : t('Reject')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCancellations;
