import { getAuthHeaders } from '../authHelper';

interface CancellationRequest {
    applicationId: string;
    startTime: Date | string;
    endTime: Date | string;
    slotName?: string;
    cancellationReason?: string;
    cancellationRequestedAt?: Date | string;
}

interface CancellationRequestsResponse {
    success: boolean;
    data?: CancellationRequest[];
    error?: string;
}

export const fetchCancellationRequests = async (email: string): Promise<CancellationRequestsResponse> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/volunteer/cancellation-requests/${email}`, {
            headers: await getAuthHeaders(),
        });
        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Failed to fetch cancellation requests' };
        }
    } catch (error) {
        console.error('Error fetching cancellation requests:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

export type { CancellationRequest };
