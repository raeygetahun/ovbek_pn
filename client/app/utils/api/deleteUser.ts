import { getAuthHeaders } from './authHelper';

export const deleteUser = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/auth/delete-user`, {
            method: 'DELETE',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ email })
        });
        if (response.ok) return { success: true };
        const errorMessage = await response.text();
        return { success: false, error: errorMessage };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' };
    }
};
