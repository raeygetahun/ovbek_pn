import { IHolidayCacheItem } from "../types";

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

class HolidayService {
  private cache: Map<number, IHolidayCacheItem>;
  private cacheTTL: number;

  constructor() {
    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
  }

  async fetchHolidays(year: number): Promise<string[]> {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/DE`,
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch holidays for ${year}: ${response.status}`,
        );
        return [];
      }

      const holidays = (await response.json()) as NagerHoliday[];

      const relevantHolidays = holidays
        .filter(
          (h) =>
            h.counties === null || (h.counties && h.counties.includes("DE-HB")),
        )
        .map((h) => h.date);

      return relevantHolidays;
    } catch (error) {
      console.error(
        `Error fetching holidays for ${year}:`,
        (error as Error).message,
      );
      return [];
    }
  }

  async getHolidaysForYear(year: number): Promise<Set<string>> {
    const cached = this.cache.get(year);

    if (cached && Date.now() - cached.fetchedAt < this.cacheTTL) {
      return cached.holidays;
    }

    const holidayDates = await this.fetchHolidays(year);
    const holidaySet = new Set(holidayDates);

    this.cache.set(year, {
      holidays: holidaySet,
      fetchedAt: Date.now(),
    });

    return holidaySet;
  }

  async isHoliday(date: Date | string): Promise<boolean> {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const holidays = await this.getHolidaysForYear(year);
    return holidays.has(dateStr);
  }

  async getHolidays(year: number): Promise<string[]> {
    const holidays = await this.getHolidaysForYear(year);
    return Array.from(holidays).sort();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default new HolidayService();
