import { getAuthHeaders } from '../authHelper';

const requestCancellation = async (
    applicationId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/volunteer/request-cancellation`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ applicationId, reason }),
        });
        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Failed to submit cancellation request' };
        }
    } catch (error) {
        console.error('Error requesting cancellation:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again later.' };
    }
};

export default requestCancellation;
