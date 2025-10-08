'use client';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';
import { useTranslation } from 'react-i18next';
import ApprovedAppointmentsCalendar from '@/app/components/calendar/calander'
import PendingApplicationsList from '@/app/components/newApplication/newapplication'
import { useState } from 'react';
import PendingVolunteersList from '@/app/components/newVolunteer/newVolunteer';
import { fetchApprovedAppointments } from '@/app/utils/api/calander/appointments';
import Navbar from '@/app/components/navbar/navbar';
import AdminAppointment from "@/app/components/adminAppointment/adminAppointment"
import AddAdmin from "@/app/components/addAdmin/addAdmin"
import AdminRecommendations from "@/app/components/adminRecommendations/AdminRecommendations"
import ManageSlots from "@/app/components/manageSlots/ManageSlots"
import AdminCancellations from "@/app/components/adminCancellations/AdminCancellations"
import { fetchAdminCancellationRequests } from '@/app/utils/api/Admin/cancellationRequests'
import { PendingtimeSlotApp } from '@/app/utils/api/Admin/pendingTimeslotApps'
import { PendingNewVolunteers } from '@/app/utils/api/Admin/pendingNewVolunteers'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';




export default function Home() {
    const { t } = useTranslation();
    const { user, isAdmin, loading } = useFirebaseAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/signin');
            return;
        }
        if (!isAdmin) {
            router.push('/volunteer/dashboard');
        }
    }, [user, isAdmin, loading, router]);
    const [activeSection, setActiveSection] = useState('applications');
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
    const [cancellationCount, setCancellationCount] = useState(0);
    const [applicationCount, setApplicationCount] = useState(0);
    const [volunteerCount, setVolunteerCount] = useState(0);

    useEffect(() => {
        const checkCancellations = async () => {
            try {
                const response = await fetchAdminCancellationRequests();
                if (response.success && response.data) {
                    setCancellationCount(response.data.length);
                }
            } catch (error) {
            }
        };

        const checkApplications = async () => {
            try {
                const response = await PendingtimeSlotApp();
                if (response.success && response.data) {
                    setApplicationCount(response.data.length);
                }
            } catch (error) {
            }
        };

        const checkVolunteers = async () => {
            try {
                const response = await PendingNewVolunteers();
                if (response.success && response.data) {
                    setVolunteerCount(response.data.length);
                }
            } catch (error) {
            }
        };

        checkCancellations();
        checkApplications();
        checkVolunteers();
    }, []);

    // Function to handle switching active section
    const switchSection = (section: string) => {
        setActiveSection(section);
    };

    const refreshCalendar = () => {
        setCalendarRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <Navbar />
            <div className="p-8">
                <ApprovedAppointmentsCalendar key={calendarRefreshKey} fetchAppointments={fetchApprovedAppointments} passedData='all' />
                <div className='border-b-4 border-solid py-0'>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'applications' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('applications')}
                    >
                        {t('New Applications')}
                        {applicationCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full">
                                {applicationCount}
                            </span>
                        )}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'volunteers' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('volunteers')}
                    >
                        {t('New Volunteers')}
                        {volunteerCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full">
                                {volunteerCount}
                            </span>
                        )}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'newAppointment' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('newAppointment')}
                    >
                        {t('New Appointment')}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'newAdmin' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('newAdmin')}
                    >
                        {t('Add New Admin')}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'smartScheduling' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('smartScheduling')}
                    >
                        {t('Smart Scheduling')}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'manageSlots' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('manageSlots')}
                    >
                        {t('Manage Slots')}
                    </button>
                    <button
                        className={`focus:outline-none font-bold ${activeSection === 'cancellations' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
                        onClick={() => switchSection('cancellations')}
                    >
                        {t('Cancellations')}
                        {cancellationCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full">
                                {cancellationCount}
                            </span>
                        )}
                    </button>
                </div>


                {/* Render section based on activeSection state */}
                {activeSection === 'applications' && (
                    <PendingApplicationsList
                        onApprove={refreshCalendar}
                        onCountChange={setApplicationCount}
                    />
                )}
                {activeSection === 'volunteers' && (
                    <PendingVolunteersList onCountChange={setVolunteerCount} />
                )}
                {activeSection === 'newAppointment' && <AdminAppointment />}
                {activeSection === 'newAdmin' && <AddAdmin />}
                {activeSection === 'smartScheduling' && <AdminRecommendations />}
                {activeSection === 'manageSlots' && <ManageSlots />}
                {activeSection === 'cancellations' && (
                    <AdminCancellations onCountChange={setCancellationCount} />
                )}
            </div>
        </>
    )
}

Home.requireAuth = true