const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean, error?: string }> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        const response = await fetch(`${backendUrl}/api/auth/volunteer-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
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

export default signup;
