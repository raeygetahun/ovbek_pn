import axios from 'axios';
import { getAuthHeaders } from '../authHelper';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const PendingNewVolunteers = async () => {
    try {
        const response = await axios.get(`${backendUrl}/api/admin/pending-volunteers`, {
            headers: await getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch pending new Volunteers');
    }
};
