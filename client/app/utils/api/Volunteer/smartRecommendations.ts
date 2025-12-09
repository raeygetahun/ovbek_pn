import { getAuthHeaders } from '../authHelper';

export interface Recommendation {
    date: string;
    slotId: string;
    slotName: string;
    slotDisplay: string;
}

interface RecommendationsResponse {
    success: boolean;
    data?: Recommendation[];
    cached?: boolean;
    fallback?: boolean;
    message?: string;
    error?: string;
    status?: number;
}

const fetchSmartRecommendations = async (email: string): Promise<RecommendationsResponse> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(
            `${backendUrl}/api/recommendations/smart-recommendations/${email}`,
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
            error: error instanceof Error ? error.message : 'Failed to fetch recommendations'
        };
    }
};

export default fetchSmartRecommendations;
