import { getAuthHeaders } from '../authHelper';

export interface VolunteerSuggestion {
    name: string;
    email: string;
    reason: string;
}

export interface SlotRecommendation {
    date: string;
    slot: number;
    slotDisplay: string;
    dayOfWeek: string;
    volunteers: VolunteerSuggestion[];
}

interface AdminRecommendationsResponse {
    success: boolean;
    data?: SlotRecommendation[];
    cached?: boolean;
    message?: string;
    fallback?: boolean;
    limitReached?: boolean;
    error?: string;
    status?: number;
}

const fetchAdminRecommendations = async (): Promise<AdminRecommendationsResponse> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(
            `${backendUrl}/api/recommendations/admin-recommendations`,
            { headers: await getAuthHeaders() }
        );
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : null;

        if (response.ok) {
            return payload;
        }

        const errorMessage = payload?.error || (await response.text());
        return { success: false, error: errorMessage, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch admin recommendations'
        };
    }
};

export default fetchAdminRecommendations;
