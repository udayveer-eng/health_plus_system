import axios from "axios";

/**
 * Pre-configured Axios instance for backend communication.
 * Automatically injects the JWT token from localStorage into every request.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("healthpulse-token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We can optionally add a response interceptor to handle 401s (token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token is expired or invalid
      localStorage.removeItem("healthpulse-token");
      // Prevent infinite redirect loop if already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
