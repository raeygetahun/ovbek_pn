export const fetchHolidays = async (year: number): Promise<{ success: boolean; data: string[] }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/holidays/${year}`);
        if (response.ok) {
            return await response.json();
        }
        return { success: false, data: [] };
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return { success: false, data: [] };
    }
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

/**
 * Check if a date string is in the holidays array
 */
export const isHoliday = (dateStr: string, holidays: string[]): boolean => {
    return holidays.includes(dateStr);
};

/**
 * Check if a date is valid for volunteer scheduling (weekend or holiday)
 */
export const isValidVolunteerDate = (date: Date, holidays: string[]): boolean => {
    if (isWeekend(date)) return true;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return isHoliday(dateStr, holidays);
};
