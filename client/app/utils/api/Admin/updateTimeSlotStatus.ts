import { getAuthHeaders } from '../authHelper';

const updateTimeSlot = async (applicationId: string, status: string, note: string | null): Promise<{ success: boolean, error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/admin/verify-time-slot-application`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ applicationId, status, note }),
        });
        if (response.ok) {
            return { success: true };
        } else {
            const errorMessage = await response.text();
            console.error('Error during status update:', errorMessage);
            return { success: false, error: errorMessage };
        }
    } catch (error) {
        console.error('Error during status update:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.' };
    }

};

export default updateTimeSlot;
