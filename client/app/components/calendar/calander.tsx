'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchSlots, Slot } from '@/app/utils/api/Admin/slots';
import { fetchHolidays, isWeekend, isHoliday } from '@/app/utils/api/holidays';

const VOLUNTEERS_PER_SLOT = 3;

interface Appointment {
    applicationId: string;
    startTime: Date | string;
    endTime: Date | string;
    volunteerName: string | null;
    slotId?: string;
}

interface FetchAppointments {
    success: true,
    data: Array<Appointment>
}

interface CalendarProps {
    fetchAppointments: (data: string) => Promise<FetchAppointments>;
    passedData: string | null | undefined;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'filled' | 'open';
    slotName?: string;
    position?: number;
}

const CalendarWithAppointments = ({ fetchAppointments, passedData }: CalendarProps) => {
    const { t, i18n } = useTranslation();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [dayStartHour, setDayStartHour] = useState(11);
    const [dayEndHour, setDayEndHour] = useState(17);
    const [holidays, setHolidays] = useState<string[]>([]);
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    const currentYear = useMemo(() => new Date().getFullYear(), []);

    // Set moment locale based on current language
    useMemo(() => {
        moment.locale(i18n.language = 'de');
    }, [i18n.language]);

    useEffect(() => {
        const getAppointments = async () => {
            try {
                const fetchedAppointments = await fetchAppointments(passedData as string);
                setAppointments(fetchedAppointments.data);
            } catch (error) {
            }
        };

        const loadSlots = async () => {
            const response = await fetchSlots();
            if (response.success && response.data.length > 0) {
                setSlots(response.data);
                const startHours = response.data.map(s => parseInt(s.startTime.split(':')[0], 10));
                const endHours = response.data.map(s => parseInt(s.endTime.split(':')[0], 10));
                setDayStartHour(Math.min(...startHours));
                setDayEndHour(Math.max(...endHours));
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

        getAppointments();
        loadSlots();
        loadHolidays();
    }, [fetchAppointments, passedData, currentYear]);

    const localizer = momentLocalizer(moment);
    const today = new Date();

    // Check if a date is valid for volunteering
    const isValidVolunteerDate = useCallback((date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return isWeekend(date) || isHoliday(dateStr, holidays);
    }, [holidays]);

    // Generate events including open slots
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        // Get the date range to display (current view month +/- 1 week buffer)
        const viewStart = moment(currentViewDate).startOf('month').subtract(1, 'week').toDate();
        const viewEnd = moment(currentViewDate).endOf('month').add(1, 'week').toDate();

        // Group appointments by date and slot
        const appointmentMap: { [key: string]: Appointment[] } = {};
        appointments.forEach(apt => {
            const startDate = new Date(apt.startTime);
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Determine which slot this appointment belongs to based on time
            const aptStartTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

            const matchingSlot = slots.find(s => s.startTime === aptStartTime);
            const slotId = apt.slotId || matchingSlot?.slotId || 'unknown';

            const key = `${dateStr}_${slotId}`;
            if (!appointmentMap[key]) {
                appointmentMap[key] = [];
            }
            appointmentMap[key].push(apt);
        });

        // Iterate through each day in the view range
        const current = new Date(viewStart);
        while (current <= viewEnd) {
            if (isValidVolunteerDate(current)) {
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, '0');
                const day = String(current.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                // For each slot
                slots.forEach(slot => {
                    const key = `${dateStr}_${slot.slotId}`;
                    const slotAppointments = appointmentMap[key] || [];
                    const filledCount = slotAppointments.length;

                    // Create start and end times for this slot on this day
                    const [startHour, startMin] = slot.startTime.split(':').map(Number);
                    const [endHour, endMin] = slot.endTime.split(':').map(Number);

                    const slotStart = new Date(current);
                    slotStart.setHours(startHour, startMin, 0, 0);

                    const slotEnd = new Date(current);
                    slotEnd.setHours(endHour, endMin, 0, 0);

                    // Add filled positions
                    slotAppointments.forEach((apt, index) => {
                        allEvents.push({
                            id: apt.applicationId,
                            title: apt.volunteerName || 'Volunteer',
                            start: slotStart,
                            end: slotEnd,
                            type: 'filled',
                            slotName: slot.name,
                            position: index + 1,
                        });
                    });

                    // Add open positions
                    const openCount = VOLUNTEERS_PER_SLOT - filledCount;
                    for (let i = 0; i < openCount; i++) {
                        allEvents.push({
                            id: `open_${dateStr}_${slot.slotId}_${i}`,
                            title: 'Open',
                            start: slotStart,
                            end: slotEnd,
                            type: 'open',
                            slotName: slot.name,
                            position: filledCount + i + 1,
                        });
                    }
                });
            }

            current.setDate(current.getDate() + 1);
        }

        return allEvents;
    }, [appointments, slots, holidays, currentViewDate, isValidVolunteerDate]);

    const initProps = {
        localizer: localizer,
        defaultDate: today,
        defaultView: Views.WEEK,
        min: moment(today).startOf('day').hour(dayStartHour).toDate(),
        max: moment(today).endOf('day').hour(dayEndHour).toDate(),
        step: 15,
        timeslots: 4,
        views: [Views.MONTH, Views.WEEK, Views.DAY],
        onNavigate: (date: Date) => setCurrentViewDate(date),
    };

    const formats = {
        eventTimeRangeFormat: () => "",
    };

    // Generate consistent colors for different slots
    const getSlotColor = (isOpen: boolean) => {
        // if (!slotName) return isOpen ? 'transparent' : '#22c55e';
        const colors = {
            open: "#fce7f3",
            filled: "#10b981"
        }
        
        // const colors = [
        //     { filled: '#3b82f6', open: '#dbeafe' },  // blue
        //     { filled: '#8b5cf6', open: '#ede9fe' },  // purple
        //     { filled: '#ec4899', open: '#fce7f3' },  // pink
        //     { filled: '#f59e0b', open: '#fef3c7' },  // amber
        //     { filled: '#10b981', open: '#d1fae5' },  // green
        // ];
        
        // const hash = slotName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // const colorSet = colors[hash % colors.length];
        return isOpen ? colors['open'] : colors['filled'];
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const bgColor = getSlotColor(event.type === 'open');
        
        if (event.type === 'open') {
            return {
                style: {
                    backgroundColor: bgColor,
                    border: '2px dashed #d1d5db',
                    borderRadius: '6px',
                    color: '#6b7280',
                    boxShadow: 'none',
                    display: 'block',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    padding: '2px 4px',
                    marginBottom: '2px',
                }
            };
        }

        return {
            style: {
                backgroundColor: bgColor,
                borderRadius: '6px',
                color: 'white',
                border: '2px dashed #d1d5db',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                display: 'block',
                fontWeight: '600',
                fontSize: '0.75rem',
                padding: '2px 4px',
                marginBottom: '2px',
            }
        };
    };

    // Style days based on whether they are weekends/holidays
    const dayPropGetter = useCallback((date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const isHolidayDay = isHoliday(dateStr, holidays);
        const isWeekendDay = isWeekend(date);

        if (isHolidayDay || isWeekendDay) {
            return {
                style: {
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                },
            };
        } else {
            return {
                style: {
                    background: 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 4px, #e5e7eb 4px, #e5e7eb 8px)',
                },
            };
        }
    }, [holidays]);

    // Custom event component to show position info
    const EventComponent = ({ event }: { event: CalendarEvent }) => {
        if (event.type === 'open') {
            return (
                <div className="text-center text-xs opacity-60">
                    {t('Open')}
                </div>
            );
        }

        return (
            <div className="text-xs truncate">
                {event.title}
            </div>
        );
    };

    return (
        <div className='py-7'>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md shadow-sm" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}></div>
                    <span className="text-gray-600 font-medium">{t('Weekend / Holiday')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md shadow-sm" style={{ background: 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 4px, #e5e7eb 4px, #e5e7eb 8px)' }}></div>
                    <span className="text-gray-600 font-medium">{t('Closed')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md shadow-sm bg-green-500"></div>
                    <span className="text-gray-600 font-medium">{t('Filled')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md border-2 border-dashed border-gray-300" style={{ backgroundColor: '#fce7f3' }}></div>
                    <span className="text-gray-600 font-medium">{t('Open')} ({t('{{count}} needed per slot', { count: VOLUNTEERS_PER_SLOT })})</span>
                </div>
            </div>

            <div style={{ height: 600 }}>
                <Calendar
                    events={events}
                    {...initProps}
                    eventPropGetter={eventStyleGetter}
                    dayPropGetter={dayPropGetter}
                    formats={formats}
                    components={{
                        event: EventComponent,
                    }}
                />
            </div>
        </div>
    );
};

export default CalendarWithAppointments;
