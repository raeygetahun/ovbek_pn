import { getAuthHeaders } from '../authHelper';

interface CancellationRequest {
    applicationId: string;
    startTime: Date | string;
    endTime: Date | string;
    volunteerName: string;
    slotName?: string;
    cancellationReason?: string;
    cancellationRequestedAt?: Date | string;
}

interface CancellationRequestsResponse {
    success: boolean;
    data?: CancellationRequest[];
    error?: string;
}

export const fetchAdminCancellationRequests = async (): Promise<CancellationRequestsResponse> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/admin/cancellation-requests`, {
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

export const approveCancellation = async (applicationId: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/admin/approve-cancellation`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ applicationId }),
        });
        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Failed to approve cancellation' };
        }
    } catch (error) {
        console.error('Error approving cancellation:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

export const rejectCancellation = async (applicationId: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/admin/reject-cancellation`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ applicationId }),
        });
        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Failed to reject cancellation' };
        }
    } catch (error) {
        console.error('Error rejecting cancellation:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

export type { CancellationRequest };
