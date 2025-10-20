'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPendingTimeslots } from '@/app/utils/api/calander/appointments';
import updateTimeSlot from "@/app/utils/api/Admin/updateTimeSlotStatus";
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';


interface Application {
    applicationId: string;
    date: string;
    startTime: string;
    endTime: string;
    volunteerId: string;
    status: string;
    note: string;
    volunteerName: string;
}

const AppliedTimeSlots = () => {
    const { t, i18n } = useTranslation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { user } = useFirebaseAuth();
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const email = user?.email;
                if (!email) return;
                const PendingApplications = await fetchPendingTimeslots(email);
                setApplications(PendingApplications.data);
            } catch (error) {
            }
        };

        if (user?.email) {
            fetchData();
        }
    }, [user?.email]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: i18n.language !== 'de'
        });
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-semibold mb-4">{t('Pending Applications')}</h1>
            {applications.length === 0 ? (
                <p className="text-gray-500">{t('No pending applications')}</p>
            ) : (
                <ul>
                    {applications.map((application, index) => (
                        <li key={application.applicationId} className="border-b py-4">
                            <p><span className="font-semibold">{t('Number')}:</span> {index + 1}</p>
                            <p><span className="font-semibold">{t('Date')}:</span> {formatDate(application.date)}</p>
                            <p><span className="font-semibold">{t('Start Time')}:</span> {formatDate(application.startTime)}</p>
                            <p><span className="font-semibold">{t('End Time')}:</span> {formatDate(application.endTime)}</p>
                            <p><span className="font-semibold">{t('Status')}:</span> {t(application.status)}</p>
                            {application.note && <p><span className="font-semibold">{t('Note')}:</span> {application.note}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AppliedTimeSlots;
