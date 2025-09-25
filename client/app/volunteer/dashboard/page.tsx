'use client';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import ApprovedAppointmentsCalendar from '@/app/components/calendar/calander'
import TimeslotApp from '@/app/components/timeslotApplication/timeslot';
import { useState, useEffect } from 'react';
import { fetchApprovedAppointments } from '@/app/utils/api/calander/appointments';
import AppliedTimeSlots from "@/app/components/myApplications/mypendingApplications"
import Navbar from '@/app/components/navbar/navbar';
import SmartRecommendations from '@/app/components/smartRecommendations/SmartRecommendations';
import MyAppointments from '@/app/components/myAppointments/MyAppointments';
import PendingCancellations from '@/app/components/pendingCancellations/PendingCancellations';
import { fetchCancellationRequests } from '@/app/utils/api/Volunteer/cancellationRequests';


export default function Home() {
  const { t } = useTranslation();
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  const [activeSection1, setActiveSection1] = useState('all');
  const [activeSection2, setActiveSection2] = useState('apply');
  const [pendingCancellationsCount, setPendingCancellationsCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkPendingCancellations = async () => {
      if (!user?.email) return;

      try {
        const response = await fetchCancellationRequests(user.email);
        if (response.success && response.data) {
          setPendingCancellationsCount(response.data.length);
        }
      } catch (error) {
        console.error('Error checking pending cancellations:', error);
      }
    };

    checkPendingCancellations();
  }, [user?.email]);

  const switchSection = (section: string, option: number) => {
    option ? setActiveSection1(section) : setActiveSection2(section);
  };

  return (
    <>
      <Navbar />
      <div className="p-8">
        <SmartRecommendations />
        <div className='border-b-4 border-solid py-0'>
          <button
            className={`focus:outline-none font-bold ${activeSection1 === 'all' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
            onClick={() => switchSection('all', 1)}
          >
            {t('All Schedule')}
          </button>
          <button
            className={`focus:outline-none font-bold ${activeSection1 === 'my' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
            onClick={() => switchSection('my', 1)}
          >
            {t('My Schedule')}
          </button>
        </div>
        {activeSection1 === 'all' && <ApprovedAppointmentsCalendar fetchAppointments={fetchApprovedAppointments} passedData='all' />}
        {activeSection1 === 'my' && <ApprovedAppointmentsCalendar fetchAppointments={fetchApprovedAppointments} passedData={user?.email} />}
        <div className='border-b-4 border-solid py-0 mt-8'>
          <button
            className={`focus:outline-none font-bold ${activeSection2 === 'appointments' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
            onClick={() => switchSection('appointments', 0)}
          >
            {t('My Appointments')}
          </button>
          <button
            className={`focus:outline-none font-bold ${activeSection2 === 'applied' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
            onClick={() => switchSection('applied', 0)}
          >
            {t('Pending Applications')}
          </button>
          {pendingCancellationsCount > 0 && (
            <button
              className={`focus:outline-none font-bold ${activeSection2 === 'cancellations' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
              onClick={() => switchSection('cancellations', 0)}
            >
              {t('Pending Cancellations')}
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full">
                {pendingCancellationsCount}
              </span>
            </button>
          )}
          <button
            className={`focus:outline-none font-bold ${activeSection2 === 'apply' ? 'text-white bg-black rounded-t-lg border-b-2 border-gray-900 py-3 px-6 h-12' : 'text-black py-3 px-6 h-12'}`}
            onClick={() => switchSection('apply', 0)}
          >
            {t('New Application')}
          </button>
        </div>
        {activeSection2 === 'appointments' && <MyAppointments />}
        {activeSection2 === 'applied' && <AppliedTimeSlots />}
        {activeSection2 === 'cancellations' && <PendingCancellations onCountChange={setPendingCancellationsCount} />}
        {activeSection2 === 'apply' && <TimeslotApp />}
      </div>
    </>
  )
}

Home.requireAuth = true
