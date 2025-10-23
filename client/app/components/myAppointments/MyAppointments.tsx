'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApprovedAppointments } from '@/app/utils/api/calander/appointments';
import requestCancellation from '@/app/utils/api/Volunteer/cancellationRequest';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';

interface Appointment {
    applicationId: string;
    startTime: Date | string;
    endTime: Date | string;
    volunteerName: string | null;
    slotName?: string;
    date?: string;
    status?: string;
}

const MyAppointments: React.FC = () => {
    const { user } = useFirebaseAuth();
    const { t, i18n } = useTranslation();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const loadAppointments = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                const response = await fetchApprovedAppointments(user.email);
                if (response.success) {
                    // Filter only future appointments
                    const now = new Date();
                    const futureAppointments = response.data.filter((apt: Appointment) => {
                        const aptDate = new Date(apt.startTime);
                        return aptDate > now;
                    });
                    // Sort by date ascending
                    futureAppointments.sort((a: Appointment, b: Appointment) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    );
                    setAppointments(futureAppointments);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, [user?.email]);

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

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

    const getDaysUntil = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('Today');
        if (diffDays === 1) return t('Tomorrow');
        if (diffDays < 7) return t('In {{count}} days', { count: diffDays });
        if (diffDays < 14) return t('Next week');
        return t('In {{count}} weeks', { count: Math.ceil(diffDays / 7) });
    };

    const openCancelModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setCancelReason('');
        setCancelModalOpen(true);
        setSuccessMessage('');
    };

    const closeCancelModal = () => {
        setCancelModalOpen(false);
        setSelectedAppointment(null);
        setCancelReason('');
    };

    const handleCancelRequest = async () => {
        if (!selectedAppointment || !cancelReason.trim()) return;

        setCancelSubmitting(true);

        try {
            const response = await requestCancellation(selectedAppointment.applicationId, cancelReason.trim());

            if (response.success) {
                setSuccessMessage(t('Your cancellation request has been submitted. An admin will review it shortly.'));
                // Mark the appointment as pending cancellation
                setAppointments(prev =>
                    prev.map(apt =>
                        apt.applicationId === selectedAppointment.applicationId
                            ? { ...apt, status: 'CancellationRequested' }
                            : apt
                    )
                );
            } else {
                setSuccessMessage('');
                alert(response.error || t('Timeslot application failed. Please try again.'));
            }
        } catch (error) {
            alert(t('An unexpected error occurred. Please try again later.'));
        } finally {
            setCancelSubmitting(false);
            setCancelModalOpen(false);
            setCancelReason('');
            setSelectedAppointment(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-100 rounded-lg p-6 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('My Upcoming Appointments')}</h2>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-800 font-medium">{successMessage}</p>
                    </div>
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg">{t('No upcoming appointments')}</p>
                    <p className="text-gray-400 mt-1">{t('Apply for a timeslot to get started')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <div
                            key={appointment.applicationId}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                            {getDaysUntil(appointment.startTime)}
                                        </span>
                                        {appointment.status === 'CancellationRequested' ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                {t('Cancellation request pending')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                {t('Confirmed')}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        {formatDate(appointment.startTime)}
                                    </h3>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">
                                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                                        </span>
                                    </div>

                                    {appointment.slotName && (
                                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span>{appointment.slotName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    {appointment.status === 'CancellationRequested' ? (
                                        <span className="text-amber-700 text-xs font-medium">
                                            {t('Cancellation request pending')}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => openCancelModal(appointment)}
                                            className="text-gray-400 hover:text-gray-600 text-xs underline transition-colors"
                                        >
                                            {t("Can't make it?")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancellation Request Modal */}
            {cancelModalOpen && selectedAppointment && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeCancelModal}
                        ></div>

                        {/* Modal */}
                        <div className="relative inline-block bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {t('Request Cancellation')}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {t('Please provide a reason for your cancellation request. An admin will review and process your request.')}
                                        </p>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-medium text-gray-800">
                                        {formatDate(selectedAppointment.startTime)}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                                    </p>
                                </div>

                                {/* Reason Input */}
                                <div className="mt-4">
                                    <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('Reason for cancellation')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="cancelReason"
                                        rows={4}
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder={t('Please explain why you need to cancel this appointment...')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-800"
                                    />
                                </div>

                                {/* Notice */}
                                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-amber-800">
                                        {t('Cancellation requests are reviewed by admins. You will be notified once your request is processed.')}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeCancelModal}
                                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    {t('Keep Appointment')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelRequest}
                                    disabled={!cancelReason.trim() || cancelSubmitting}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {cancelSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('Submitting...')}
                                        </span>
                                    ) : (
                                        t('Submit Cancellation Request')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
