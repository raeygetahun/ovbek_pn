'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PendingNewVolunteers } from '@/app/utils/api/Admin/pendingNewVolunteers';
import updateVolunteer from "@/app/utils/api/Admin/updateVolunteerStatus";


interface Volunteer {
    volunteerId: string;
    email: string;
    firstName: string;
    lastName: string;
    accountStatus: string;
}

interface PendingVolunteersListProps {
    onCountChange?: (count: number) => void;
}

const PendingVolunteersList = ({ onCountChange }: PendingVolunteersListProps) => {
    const { t } = useTranslation();
    const [volunteers, setvolunteers] = useState<Volunteer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState<string>('');
    const [NoteInput, setNoteInput] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const Pendingvolunteers = await PendingNewVolunteers();
                setvolunteers(Pendingvolunteers.data);
            } catch (error) {
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(volunteers.length);
        }
    }, [volunteers.length, onCountChange]);

    const handleApprove = async (id: string) => {
        try {
            const data = await updateVolunteer(id, "Approved");
            if (data.success) {
                const volunteerToUpdate = document.getElementById(id);
                volunteerToUpdate ? volunteerToUpdate.classList.add("fade-out") : "";
                setTimeout(() => {
                    setvolunteers(prevState =>
                        prevState.filter(volunteer => volunteer.volunteerId !== id)
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

    const handleReject = async (id: string, note: string) => {
        try {
            const data = await updateVolunteer(id, "Rejected");
            if (data.success) {
                const volunteerToUpdate = document.getElementById(id);
                volunteerToUpdate ? volunteerToUpdate.classList.add("fade-out") : "";
                setTimeout(() => {
                    setvolunteers(prevState =>
                        prevState.filter(volunteer => volunteer.volunteerId !== id)
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
        <div className="container mx-auto py-8 ">
            <h1 className="text-3xl font-semibold mb-4">{t('Pending Volunteers')}</h1>
            {volunteers.length === 0 ? (
                <p className="text-gray-500">{t('No pending volunteers')}</p>
            ) : (
                <div className='mx-100'>
                    <ul>
                        {volunteers.map((volunteer, index) => (
                            <li id={volunteer.volunteerId} key={volunteer.volunteerId} className="border-b py-4">
                                <p><span className="font-semibold">{t('Number')}:</span> {index + 1}</p>
                                <p><span className="font-semibold">{t('Email')}:</span> {volunteer.email}</p>
                                <p><span className="font-semibold">{t('First Name')}:</span> {volunteer.firstName}</p>
                                <p><span className="font-semibold">{t('Last Name')}:</span> {volunteer.lastName}</p>
                                <div className="mt-4">
                                    <button onClick={() => handleApprove(volunteer.volunteerId)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mr-2 rounded">
                                        {t('Approve')}
                                    </button>
                                    <button onClick={() => setNoteInput('true')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                        {t('Reject')}
                                    </button>
                                    {NoteInput && (
                                        <div className="mt-2">
                                            <button onClick={() => handleReject(volunteer.volunteerId, rejectNote)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 ml-2 rounded">
                                                {t('Confirm Reject')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PendingVolunteersList;
