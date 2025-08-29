import holidayService from "../services/holidayService";

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export async function isValidVolunteerDate(
  date: Date | string,
): Promise<boolean> {
  const d = date instanceof Date ? date : new Date(date);

  if (isWeekend(d)) {
    return true;
  }

  return await holidayService.isHoliday(d);
}

export async function getValidDateReason(
  date: Date | string,
): Promise<string | null> {
  const d = date instanceof Date ? date : new Date(date);

  if (isWeekend(d)) {
    return "weekend";
  }

  if (await holidayService.isHoliday(d)) {
    return "holiday";
  }

  return null;
}
