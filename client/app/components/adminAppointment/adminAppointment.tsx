'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import  assignAppointment from '@/app/utils/api/Admin/assignAppointment';
import { allApprovedVolunteers } from '@/app/utils/api/Admin/allApprovedVolunteers';
import { fetchSlots, Slot } from '@/app/utils/api/Admin/slots';
import { fetchHolidays } from '@/app/utils/api/holidays';
import DatePicker from '@/app/components/datePicker/DatePicker';

const AdminAppointment: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [holidays, setHolidays] = useState<string[]>([]);

    const today = useMemo(() => new Date(), []);
    const currentYear = today.getFullYear();
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const volunteersData = await allApprovedVolunteers();
                setVolunteers(volunteersData.data);
            } catch (error) {
            }
        };
        const loadSlots = async () => {
            const response = await fetchSlots();
            if (response.success) {
                setSlots(response.data);
            }
        };
        const loadHolidays = async () => {
            const [currentYearHolidays, nextYearHolidays] = await Promise.all([
                fetchHolidays(currentYear),
                fetchHolidays(currentYear + 1)
            ]);

            const allHolidays = [
                ...(currentYearHolidays.success ? currentYearHolidays.data : []),
                ...(nextYearHolidays.success ? nextYearHolidays.data : [])
            ];
            setHolidays(allHolidays);
        };

        fetchData();
        loadSlots();
        loadHolidays();
    }, [currentYear]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setSuccessMessage('');
            setErrorMessage('');
            const selectedDateObj = new Date(selectedDate);
            const response = await assignAppointment(selectedVolunteer, selectedDateObj, selectedSlotId);
            if (response.success) {
                setSuccessMessage(t('Assigned successfully!'));
                setSelectedDate('');
                setSelectedSlotId('');
                setSelectedVolunteer('');
            } else {
                const errorData = JSON.parse(response.error ?? "{}");
                setErrorMessage(
                    errorData.error || t('Timeslot application failed. Please try again.'));
            }

        } catch (error) {
            setErrorMessage(t('An unexpected error occurred. Please try again later.'));
        }
    };

    const formatSelectedDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className='bg-gray-900'>
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8 bg-gray-900">
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            className="mx-auto h-10 w-auto"
                            src="https://overbeck-museum.de/wp-content/uploads/2019/09/cropped-Overbeck-Museum-favicon-192x192.png"
                            alt="Overbeck"
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                            {t('Assign Timeslot')}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400">
                            {t('Select a weekend or public holiday')}
                        </p>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-white mb-2">
                                    {t('Select Date')}
                                </label>
                                <DatePicker
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    holidays={holidays}
                                    minDate={today}
                                />
                                {selectedDate && (
                                    <p className="mt-2 text-sm text-indigo-400">
                                        {formatSelectedDate(selectedDate)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="slot" className="block text-sm font-medium leading-6 text-white">
                                    {t('Select Slot')}
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="slot"
                                        name="slot"
                                        value={selectedSlotId}
                                        onChange={(e) => setSelectedSlotId(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-grey shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">{t('Select Slot')}</option>
                                        {slots.map((slot) => (
                                            <option key={slot.slotId} value={slot.slotId}>
                                                {slot.name} ({slot.displayText})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="volunteer" className="block text-sm font-medium leading-6 text-white">
                                    {t('Select Volunteer')}
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="volunteer"
                                        name="volunteer"
                                        value={selectedVolunteer}
                                        onChange={(e) => setSelectedVolunteer(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-grey shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">{t('Select Volunteer')}</option>
                                        {volunteers.map((volunteer: any, index: number) => (
                                            <option key={index} value={volunteer.email}>{volunteer.firstName + " " + volunteer.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <button
                                    disabled={(!selectedDate || !selectedSlotId || !selectedVolunteer)}
                                    className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    {t('Assign')}
                                </button>
                            </div>
                            {successMessage && (
                                <p className="text-center font-bold text-xl text-green-500">
                                    {successMessage}
                                </p>
                            )}
                            {errorMessage && (
                                <p className="text-center font-bold text-xl text-red-500">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminAppointment;
