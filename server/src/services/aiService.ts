import OpenAI from "openai";
import {
  ICoverageGap,
  IVolunteerStats,
  IRecommendation,
  ISlotRecommendation,
  IVolunteerWithStats,
  IPreferredDay,
} from "../types";

interface AIRecommendationsResponse {
  recommendations: IRecommendation[];
}

interface AIAdminRecommendationsResponse {
  slotRecommendations: ISlotRecommendation[];
}

class AIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = "gpt-4o-mini";
  }

  private _formatDayBreakdown(preferredDays: IPreferredDay[]): string {
    if (!preferredDays || preferredDays.length === 0) return "No history yet";

    return preferredDays
      .map((d) => {
        const slotParts = d.slots
          .map((s) => `${s.count}x ${s.slotName}`)
          .join(", ");
        return `- ${d.day}: ${d.total} shifts (${slotParts})`;
      })
      .join("\n");
  }

  private _formatGapsList(coverageGaps: ICoverageGap[]): string {
    return coverageGaps
      .slice(0, 20)
      .map(
        (g) =>
          `- ${g.dayOfWeek}, ${g.date}: ${g.slotName} (${g.slotDisplay}) [slotId: ${g.slotId}]`,
      )
      .join("\n");
  }

  private _formatSlotsReference(coverageGaps: ICoverageGap[]): string {
    const uniqueSlots: Record<
      string,
      { slotId: string; slotName: string; slotDisplay: string }
    > = {};
    coverageGaps.forEach((g) => {
      if (!uniqueSlots[g.slotId]) {
        uniqueSlots[g.slotId] = {
          slotId: g.slotId,
          slotName: g.slotName,
          slotDisplay: g.slotDisplay,
        };
      }
    });
    return Object.values(uniqueSlots)
      .map((s) => `- slotId "${s.slotId}" = ${s.slotName} (${s.slotDisplay})`)
      .join("\n");
  }

  buildPrompt(stats: IVolunteerStats, coverageGaps: ICoverageGap[]): string {
    const dayBreakdown = this._formatDayBreakdown(stats.preferredDays);

    const lastActive = stats.lastVolunteered
      ? stats.lastVolunteered.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Never";

    const gapsList = this._formatGapsList(coverageGaps);
    const slotsRef = this._formatSlotsReference(coverageGaps);

    return `You are an AI assistant helping schedule volunteers at the Overbeck Museum.
Analyze the following data and recommend 3 optimal time slots for this volunteer.

VOLUNTEER PROFILE:
- Past shifts: ${stats.totalShifts} total
- Last volunteered: ${lastActive}

SHIFT HISTORY BY DAY (day: count, slot breakdown):
${dayBreakdown}

AVAILABLE SLOTS:
${slotsRef}

COVERAGE GAPS (dates needing volunteers in the next 14 days):
${gapsList || "No gaps found - all slots are covered."}

INSTRUCTIONS:
1. Each recommendation is an independent slot. You CAN recommend multiple slots on the same day if both are coverage gaps.
2. Prioritize coverage gaps that fall on days the volunteer has worked before, using the slot counts to rank which slots they are likely to accept.
3. If the volunteer hasn't been active recently, suggest sooner dates.
4. If there are no coverage gaps, suggest slots on days the volunteer has worked before.
5. Only suggest dates in the future.
6. Use the exact slotId, slotName, and slotDisplay from the AVAILABLE SLOTS section.

Return ONLY valid JSON in this exact format, no other text:
{
  "recommendations": [
    {
      "date": "YYYY-MM-DD",
      "slotId": "the-slot-id",
      "slotName": "Morning Shift",
      "slotDisplay": "11am - 2pm"
    }
  ]
}`;
  }

  parseResponse(aiResponse: string): IRecommendation[] | null {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed: AIRecommendationsResponse = JSON.parse(jsonMatch[0]);

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error("Invalid recommendations format");
      }

      return parsed.recommendations
        .filter((rec) => {
          return (
            rec.date &&
            rec.slotId &&
            rec.slotDisplay &&
            !isNaN(Date.parse(rec.date))
          );
        })
        .slice(0, 3);
    } catch (error) {
      console.error("Failed to parse AI response:", (error as Error).message);
      return null;
    }
  }

  async generateRecommendations(coverageGaps: ICoverageGap[], stats: IVolunteerStats): Promise<IRecommendation[]> {
    const prompt = this.buildPrompt(stats, coverageGaps);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) return [];

      const recommendations = this.parseResponse(content);

      if (recommendations && recommendations.length > 0) {
        return recommendations;
      }
      return [];
    } catch (error) {
      console.error("AI service error:", (error as Error).message);
      return [];
    }
  }

  buildAdminPrompt(allVolunteerStats: IVolunteerWithStats[], coverageGaps: ICoverageGap[]): string {
    const gapsList = this._formatGapsList(coverageGaps);
    const slotsRef = this._formatSlotsReference(coverageGaps);

    const volunteersList = allVolunteerStats
      .map((v, i) => {
        const dayBreakdown = this._formatDayBreakdown(v.stats.preferredDays);
        const lastActive = v.stats.lastVolunteered
          ? v.stats.lastVolunteered.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Never";
        return `${i + 1}. ${v.name} (${v.email}) - ${v.stats.totalShifts} shifts, last active: ${lastActive}\n${dayBreakdown}`;
      })
      .join("\n\n");

    return `You are an AI assistant helping schedule volunteers at the Overbeck Museum.
Given the coverage gaps and all volunteers' shift histories, recommend the 2-3 best-fit volunteers for each open slot.

AVAILABLE SLOTS:
${slotsRef}

COVERAGE GAPS (dates needing volunteers in the next 14 days):
${gapsList || "No gaps found - all slots are covered."}

VOLUNTEERS:
${volunteersList || "No volunteers available."}

INSTRUCTIONS:
1. For EACH coverage gap, recommend 3-5 volunteers ranked by best fit.
2. Consider: day-of-week match, slot match, recency, and overall activity level.
3. A volunteer CAN appear in recommendations for multiple gaps.
4. Each volunteer recommendation needs a brief reason (max 20 words).
5. Use the exact slotId, slotName, and slotDisplay from the AVAILABLE SLOTS section.

Return ONLY valid JSON in this exact format, no other text:
{
  "slotRecommendations": [
    {
      "date": "YYYY-MM-DD",
      "slotId": "the-slot-id",
      "slotName": "Morning Shift",
      "slotDisplay": "11am - 2pm",
      "volunteers": [
        { "name": "John Smith", "email": "john@email.com", "reason": "Brief reason" }
      ]
    }
  ]
}`;
  }

  parseAdminResponse(aiResponse: string): ISlotRecommendation[] | null {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed: AIAdminRecommendationsResponse = JSON.parse(jsonMatch[0]);

      if (
        !parsed.slotRecommendations ||
        !Array.isArray(parsed.slotRecommendations)
      ) {
        throw new Error("Invalid slotRecommendations format");
      }

      return parsed.slotRecommendations.filter((slot) => {
        return (
          slot.date &&
          slot.slotId &&
          slot.slotDisplay &&
          !isNaN(Date.parse(slot.date)) &&
          Array.isArray(slot.volunteers) &&
          slot.volunteers.length > 0
        );
      });
    } catch (error) {
      console.error(
        "Failed to parse admin AI response:",
        (error as Error).message,
      );
      return null;
    }
  }

  async generateAdminRecommendations(allVolunteerStats: IVolunteerWithStats[], coverageGaps: ICoverageGap[]): Promise<ISlotRecommendation[]> {
    const prompt = this.buildAdminPrompt(allVolunteerStats, coverageGaps);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content)
        return this.getAdminFallbackRecommendations(
          allVolunteerStats,
          coverageGaps,
        );

      const recommendations = this.parseAdminResponse(content);

      if (recommendations && recommendations.length > 0) {
        return recommendations;
      }

      return this.getAdminFallbackRecommendations(
        allVolunteerStats,
        coverageGaps,
      );
    } catch (error) {
      console.error("AI service error (admin):", (error as Error).message);
      return this.getAdminFallbackRecommendations(
        allVolunteerStats,
        coverageGaps,
      );
    }
  }

  getAdminFallbackRecommendations(allVolunteerStats: IVolunteerWithStats[], coverageGaps: ICoverageGap[]): ISlotRecommendation[] {
    if (!coverageGaps || coverageGaps.length === 0) return [];

    return coverageGaps
      .slice(0, 10)
      .map((gap) => {
        const ranked = allVolunteerStats
          .map((v) => {
            let score = v.stats.totalShifts;
            const dayMatch = v.stats.preferredDays.find(
              (d) => d.day === gap.dayOfWeek,
            );
            if (dayMatch) {
              score += 10;
              const slotMatch = dayMatch.slots.find(
                (s) => s.slotId === gap.slotId,
              );
              if (slotMatch) score += slotMatch.count * 2;
            }
            return { ...v, score };
          })
          .filter((v) => v.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        return {
          date: gap.date,
          slotId: gap.slotId,
          slotName: gap.slotName,
          slotDisplay: gap.slotDisplay,
          dayOfWeek: gap.dayOfWeek,
          volunteers: ranked.map((v) => ({
            name: v.name,
            email: v.email,
            reason: `Has worked ${gap.dayOfWeek}s before with ${v.stats.totalShifts} total shifts.`,
          })),
        };
      })
      .filter((slot) => slot.volunteers.length > 0);
  }

  getFallbackRecommendations(coverageGaps: ICoverageGap[], stats: IVolunteerStats): IRecommendation[] {
    if (!coverageGaps || coverageGaps.length === 0) return [];

    const preferredDayNames =
      stats && stats.preferredDays ? stats.preferredDays.map((d) => d.day) : [];

    let sortedGaps = [...coverageGaps];
    if (preferredDayNames.length > 0) {
      sortedGaps.sort((a, b) => {
        const aPreferred = preferredDayNames.includes(a.dayOfWeek) ? 0 : 1;
        const bPreferred = preferredDayNames.includes(b.dayOfWeek) ? 0 : 1;
        return aPreferred - bPreferred;
      });
    }

    return sortedGaps.slice(0, 3).map((gap) => ({
      date: gap.date,
      slotId: gap.slotId,
      slotName: gap.slotName,
      slotDisplay: gap.slotDisplay,
    }));
  }
}

export default new AIService();
