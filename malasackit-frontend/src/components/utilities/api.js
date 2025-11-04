import axios from "axios";

// Use your backend URL
const rawBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim();
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true, // Important for HTTP-only cookies
});

// Track if we've already redirected to prevent loops
let hasRedirectedToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Only redirect to login if:
    // 1. Status is 401 (unauthorized)
    // 2. NOT the login endpoint itself
    // 3. NOT the /api/auth/profile endpoint (to avoid loop during initial check)
    // 4. Haven't already redirected
    // 5. Not already on the login page
    if (
      status === 401 &&
      !requestUrl.includes("/api/auth/login") &&
      !requestUrl.includes("/api/auth/profile") &&
      !hasRedirectedToLogin &&
      window.location.pathname !== "/login"
    ) {
      hasRedirectedToLogin = true;
      window.location.href = "/login";
      
      // Reset flag after redirect completes
      setTimeout(() => {
        hasRedirectedToLogin = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api;