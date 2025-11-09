import axios from 'axios';
import { getAuthHeaders } from '../authHelper';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Function to fetch all approved appointments
export const fetchApprovedAppointments = async (option: string) => {
  try {
    const headers = await getAuthHeaders();
    let response;
    if (option === 'all') {
      response = await axios.get(`${backendUrl}/api/application/approved-timeslots`, { headers });
    }
    else {
      response = await axios.get(`${backendUrl}/api/volunteer/my-time-slots/${option}`, { headers });
    }
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch approved appointments');
  }
};

// Function to fetch all pending timeslots
export const fetchPendingTimeslots = async (email: string) => {
  try {
    const response = await axios.get(`${backendUrl}/api/volunteer/applied-time-slots/${email}`, {
      headers: await getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pending timeslots');
  }
};
// export const fetchMyApprovedAppointments = async () => {
//   try {
//     const session = useSession();
//     const email = session.data?.user?.email
//     const response = await axios.get(`${backendUrl}/api/volunteer/my-time-slots/${email}`);

//     return response.data;
//   } catch (error) {
//     console.error('Error fetching approved appointments:', error);
//     throw new Error('Failed to fetch approved appointments');
//   }
// };

