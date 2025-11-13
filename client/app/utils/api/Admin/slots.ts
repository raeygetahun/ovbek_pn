import axios from 'axios';
import { getAuthHeaders } from '../authHelper';

export interface Slot {
    slotId: string;
    name: string;
    startTime: string;
    endTime: string;
    displayText: string;
}

// Public - no auth needed
export const fetchSlots = async (): Promise<{ success: boolean; data: Slot[] }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await axios.get(`${backendUrl}/api/slots`);
        return response.data;
    } catch (error) {
        console.error('Error fetching slots:', error);
        return { success: false, data: [] };
    }
};

// Admin only
export const createSlot = async (name: string, startTime: string, endTime: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/slots`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ name, startTime, endTime }),
        });
        if (response.ok) return { success: true };
        const errorMessage = await response.text();
        return { success: false, error: errorMessage };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create slot' };
    }
};

// Admin only
export const updateSlot = async (slotId: string, name: string, startTime: string, endTime: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/slots/${slotId}`, {
            method: 'PUT',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ name, startTime, endTime }),
        });
        if (response.ok) return { success: true };
        const errorMessage = await response.text();
        return { success: false, error: errorMessage };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update slot' };
    }
};

// Admin only
export const deleteSlot = async (slotId: string): Promise<{ success: boolean; error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/slots/${slotId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders(),
        });
        if (response.ok) return { success: true };
        const errorMessage = await response.text();
        return { success: false, error: errorMessage };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete slot' };
    }
};

// Admin only
export const seedSlots = async (): Promise<{ success: boolean }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/slots/seed`, {
            method: 'POST',
            headers: await getAuthHeaders(),
        });
        if (response.ok) return { success: true };
        return { success: false };
    } catch {
        return { success: false };
    }
};
