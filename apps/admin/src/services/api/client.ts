import axios, { AxiosError } from 'axios';
import { auth } from '@/config/firebase';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Firebase ID Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback for dev session if demo token is stored
        const demoToken = sessionStorage.getItem('krishisetu_demo_token');
        if (demoToken) {
          config.headers.Authorization = `Bearer ${demoToken}`;
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve Firebase ID token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Standardize data unpacking & handle 401/403
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns standard { success: true, data: ... }, extract data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error: AxiosError<any>) => {
    const errorResponse = error.response?.data;
    const message =
      errorResponse?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the server.';

    if (error.response?.status === 401) {
      // Unauthorized: user session expired
      console.warn('API Session Expired (401)');
    }

    return Promise.reject(new Error(Array.isArray(message) ? message.join('; ') : message));
  },
);

export default apiClient;
