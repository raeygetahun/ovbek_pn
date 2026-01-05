import { getAuthHeaders } from '../authHelper';

const timeSlotApplication = async (email: string, applicationDate: Date, slotId: string): Promise<{ success: boolean, error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/volunteer/apply-for-time-slot`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ email, applicationDate, slotId }),
        });
        if (response.ok) {
            return { success: true };
        } else {
            const errorMessage = await response.text();
            console.error('Error during signup:', errorMessage);
            return { success: false, error: errorMessage };
        }
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.' };
    }

};

export default timeSlotApplication;
