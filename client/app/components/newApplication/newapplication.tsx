'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PendingtimeSlotApp } from '@/app/utils/api/Admin/pendingTimeslotApps';
import updateTimeSlot from "@/app/utils/api/Admin/updateTimeSlotStatus";


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

interface PendingApplicationsListProps {
    onApprove?: () => void;
    onCountChange?: (count: number) => void;
}

const PendingApplicationsList = ({ onApprove, onCountChange }: PendingApplicationsListProps) => {
    const { t, i18n } = useTranslation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState<string>('');
    const [NoteInput, setNoteInput] = useState<string>('');

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const PendingApplications = await PendingtimeSlotApp();
                setApplications(PendingApplications.data);
            } catch (error) {
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(applications.length);
        }
    }, [applications.length, onCountChange]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: i18n.language !== 'de'
        });
    };

    const handleApprove = async (id: string) => {
        try {
            const data = await updateTimeSlot(id, "Approved", null);
            if (data.success) {
                const applicationToUpdate = document.getElementById(id);
                applicationToUpdate ? applicationToUpdate.classList.add("fade-out") : "";
                setTimeout(() => {
                    setApplications(prevState =>
                        prevState.filter(application => application.applicationId !== id)
                    );
                }, 700);
                setNoteInput('');
                if (onApprove) {
                    onApprove();
                }
            } else {
                setError(data.error || t('An error occurred'));
            }
        } catch (error) {
            setError(t('An error occurred'));
        }
    };

    const handleReject = async (id: string, note: string) => {
        try {
            const data = await updateTimeSlot(id, "Rejected", note);
            if (data.success) {
                const applicationToUpdate = document.getElementById(id);
                applicationToUpdate ? applicationToUpdate.classList.add("fade-out") : "";
                setTimeout(() => {
                    setApplications(prevState =>
                        prevState.filter(application => application.applicationId !== id)
                    );
                }, 700);
                setNoteInput('');
            } else {
                setError(data.error || t('An error occurred'));
            }
        } catch (error) {
            setError(t('An error occurred'));
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-semibold mb-4">{t('Pending Applications')}</h1>
            {applications.length === 0 ? (
                <p className="text-gray-500">{t('No pending applications')}</p>
            ) : (
                <ul>
                    {applications.map((application, index) => (
                        <li id={application.applicationId} key={application.applicationId} className="border-b py-4">
                            <p><span className="font-semibold">{t('Number')}:</span> {index + 1}</p>
                            <p><span className="font-semibold">{t('Date')}:</span> {formatDate(application.date)}</p>
                            <p><span className="font-semibold">{t('Start Time')}:</span> {formatDate(application.startTime)}</p>
                            <p><span className="font-semibold">{t('End Time')}:</span> {formatDate(application.endTime)}</p>
                            <p><span className="font-semibold">{t('Volunteer Name')}:</span> {application.volunteerName}</p>
                            <p><span className="font-semibold">{t('Status')}:</span> {t(application.status)}</p>
                            {application.note && <p><span className="font-semibold">{t('Note')}:</span> {application.note}</p>}
                            <div className="mt-4">
                                <button onClick={() => handleApprove(application.applicationId)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mr-2 rounded">
                                    {t('Approve')}
                                </button>
                                <button onClick={() => setNoteInput('true')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                    {t('Reject')}
                                </button>
                                {NoteInput && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={rejectNote}
                                            onChange={e => setRejectNote(e.target.value)}
                                            placeholder={t('Enter reject note')}
                                            className="border p-2 rounded"
                                        />
                                        <button onClick={() => handleReject(application.applicationId, rejectNote)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 ml-2 rounded">
                                            {t('Confirm Reject')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingApplicationsList;
