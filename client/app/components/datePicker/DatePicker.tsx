'use client'
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isWeekend, isHoliday } from '@/app/utils/api/holidays';

interface DatePickerProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    holidays: string[];
    minDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect, holidays, minDate }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [viewDate, setViewDate] = useState(() => {
        if (selectedDate) {
            return new Date(selectedDate + 'T00:00:00');
        }
        return new Date(today);
    });

    const minDateNormalized = useMemo(() => {
        if (minDate) {
            const d = new Date(minDate);
            d.setHours(0, 0, 0, 0);
            return d;
        }
        return today;
    }, [minDate, today]);

    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' });
        });
    }, [locale]);

    const dayNames = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            return new Date(2000, 0, 2 + i).toLocaleDateString(locale, { weekday: 'short' });
        });
    }, [locale]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDateStr = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isDateSelectable = (year: number, month: number, day: number) => {
        const date = new Date(year, month, day);
        const dateStr = formatDateStr(year, month, day);

        // Check if date is before min date
        if (date < minDateNormalized) {
            return false;
        }

        // Check if weekend or holiday
        return isWeekend(date) || isHoliday(dateStr, holidays);
    };

    const isDateSelected = (year: number, month: number, day: number) => {
        const dateStr = formatDateStr(year, month, day);
        return dateStr === selectedDate;
    };

    const isToday = (year: number, month: number, day: number) => {
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    const handleDateClick = (year: number, month: number, day: number) => {
        if (isDateSelectable(year, month, day)) {
            const dateStr = formatDateStr(year, month, day);
            onDateSelect(dateStr);
        }
    };

    const goToPrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const selectable = isDateSelectable(year, month, day);
            const selected = isDateSelected(year, month, day);
            const todayDate = isToday(year, month, day);
            const dateStr = formatDateStr(year, month, day);
            const isHolidayDate = isHoliday(dateStr, holidays);

            let className = 'h-10 w-10 flex items-center justify-center rounded-full text-sm relative ';

            if (selected) {
                className += 'bg-indigo-500 text-white font-bold ';
            } else if (selectable) {
                className += 'bg-indigo-900/50 text-white hover:bg-indigo-700 cursor-pointer ';
            } else {
                className += 'text-gray-600 cursor-not-allowed ';
            }

            if (todayDate && !selected) {
                className += 'ring-2 ring-indigo-400 ';
            }

            days.push(
                <div
                    key={day}
                    className={className}
                    onClick={() => handleDateClick(year, month, day)}
                    title={isHolidayDate ? t('Holiday') : selectable ? t('Available') : t('Not available')}
                >
                    {day}
                    {isHolidayDate && selectable && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-gray-700 rounded-full text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-white font-semibold">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h3>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-700 rounded-full text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-gray-400 text-xs font-medium">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-indigo-900/50 rounded"></div>
                    <span>{t('Available')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-indigo-900/50 rounded relative">
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
                    </div>
                    <span>{t('Holiday')}</span>
                </div>
            </div>
        </div>
    );
};

export default DatePicker;
