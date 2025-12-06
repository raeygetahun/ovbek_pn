import { Request, Response } from 'express';
import Application from '../models/application';
import Volunteer from '../models/volunteer';
import aiService from '../services/aiService';
import cacheService from '../services/cacheService';
import { IVolunteerStats, ICoverageGap, IVolunteerWithStats, IRecommendation, ISlotRecommendation } from '../types';

const MAX_RECOMMENDATION_REQUESTS_PER_DAY = Number.parseInt(process.env.MAX_RECOMMENDATION_REQUESTS_PER_DAY || '', 10) || 3;
const MAX_ADMIN_RECOMMENDATION_REQUESTS_PER_DAY = Number.parseInt(process.env.MAX_ADMIN_RECOMMENDATION_REQUESTS_PER_DAY || '', 10) || 3;

const getMsUntilEndOfDay = (): number => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.max(endOfDay.getTime() - now.getTime(), 0);
};

const getDailyLimitKey = (email: string): string => {
    const today = new Date().toISOString().slice(0, 10);
    return `recommendations_limit_${email}_${today}`;
};

const getAdminDailyLimitKey = (): string => {
    const today = new Date().toISOString().slice(0, 10);
    return `admin_recommendations_limit_${today}`;
};

export const getSmartRecommendations = async (
    req: Request<{ email: string }>,
    res: Response
): Promise<void> => {
    let stats: IVolunteerStats | null = null;
    let coverageGaps: ICoverageGap[] | null = null;

    try {
        const { email } = req.params;

        if (!email) {
            res.status(400).json({ success: false, error: 'Email is required' });
            return;
        }

        const limitKey = getDailyLimitKey(email);
        const currentCount = cacheService.get<number>(limitKey) || 0;

        if (currentCount >= MAX_RECOMMENDATION_REQUESTS_PER_DAY) {
            const volunteer = await Volunteer.getByEmail(email);
            if (volunteer) {
                stats = await Application.getVolunteerStats(volunteer.volunteerId);
                const startDate = new Date();
                const numberOfGaps = 30;
                coverageGaps = await Application.getCoverageGaps(startDate, numberOfGaps);
                const fallback = aiService.getFallbackRecommendations(coverageGaps, stats);

                res.status(200).json({
                    success: true,
                    data: fallback,
                    cached: false,
                    fallback: true,
                    limitReached: true,
                    message: 'Daily recommendation limit reached. Returned fallback recommendations.'
                });
                return;
            }
        }
        cacheService.set(limitKey, currentCount + 1, getMsUntilEndOfDay());

        const cacheKey = `recommendations_${email}`;
        const cached = cacheService.get<IRecommendation[]>(cacheKey);
        if (cached) {
            res.json({ success: true, data: cached, cached: true });
            return;
        }

        const volunteer = await Volunteer.getByEmail(email);
        if (!volunteer) {
            res.status(404).json({ success: false, error: 'Volunteer not found' });
            return;
        }

        if (volunteer.accountStatus !== 'Approved') {
            res.status(403).json({ success: false, error: 'Volunteer account not approved' });
            return;
        }

        stats = await Application.getVolunteerStats(volunteer.volunteerId);

        const startDate = new Date();
        const numberOfGaps = 30;
        coverageGaps = await Application.getCoverageGaps(startDate, numberOfGaps);

        const recommendations = await aiService.generateRecommendations(coverageGaps, stats);

        res.json({ success: true, data: recommendations, cached: false });
    } catch (error) {
        if (stats && coverageGaps) {
            const fallback = aiService.getFallbackRecommendations(coverageGaps, stats);
            res.status(200).json({
                success: true,
                data: fallback,
                cached: false,
                fallback: true,
                message: 'AI unavailable. Returned fallback recommendations.'
            });
            return;
        }
        res.status(500).json({ success: false, error: 'Unable to generate recommendations' });
    }
};

export const getAdminRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheKey = 'admin_recommendations';
        const cached = cacheService.get<ISlotRecommendation[]>(cacheKey);
        if (cached) {
            res.json({ success: true, data: cached, cached: true });
            return;
        }

        const volunteers = await Volunteer.getAll('Approved');
        if (!volunteers || volunteers.length === 0) {
            res.json({ success: true, data: [], message: 'No approved volunteers' });
            return;
        }

        const allVolunteerStats: IVolunteerWithStats[] = await Promise.all(
            volunteers.map(async (v) => {
                const stats = await Application.getVolunteerStats(v.volunteerId);
                return {
                    name: `${v.firstName} ${v.lastName}`,
                    email: v.email,
                    volunteerId: v.volunteerId,
                    stats
                };
            })
        );

        const startDate = new Date();
        const numberOfGaps = 30;
        const coverageGaps = await Application.getCoverageGaps(startDate, numberOfGaps);

        if (coverageGaps.length === 0) {
            res.json({ success: true, data: [], message: 'All slots are covered' });
            return;
        }

        const adminLimitKey = getAdminDailyLimitKey();
        const adminCount = cacheService.get<number>(adminLimitKey) || 0;

        if (adminCount >= MAX_ADMIN_RECOMMENDATION_REQUESTS_PER_DAY) {
            const fallback = aiService.getAdminFallbackRecommendations(allVolunteerStats, coverageGaps);
            const enrichedFallback = (fallback || []).map(rec => ({
                ...rec,
                dayOfWeek: rec.dayOfWeek || new Date(rec.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
            }));

            res.status(200).json({
                success: true,
                data: enrichedFallback,
                cached: false,
                fallback: true,
                limitReached: true,
                message: 'Daily recommendation limit reached. Returned fallback recommendations.'
            });
            return;
        }
        cacheService.set(adminLimitKey, adminCount + 1, getMsUntilEndOfDay());

        const recommendations = await aiService.generateAdminRecommendations(allVolunteerStats, coverageGaps);

        const enriched = (recommendations || []).map(rec => ({
            ...rec,
            dayOfWeek: rec.dayOfWeek || new Date(rec.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
        }));

        res.json({ success: true, data: enriched, cached: false });
    } catch (error) {
        console.error('Admin recommendation error:', error);
        res.status(500).json({ success: false, error: 'Unable to generate admin recommendations' });
    }
};
