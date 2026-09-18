import axios from 'axios';

/**
 * Axios instance configured with base API URL.
 * Reads base URL from VITE_API_BASE_URL, falling back to '/api' for proxy setups.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
