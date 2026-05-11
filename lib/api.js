import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// This runs before every request goes out
api.interceptors.request.use((config) => {
  // Get the token from memory (we'll store it in a module-level variable)
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// This runs after every response comes back
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we got 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/refresh-token`,
          { refreshToken },
        );

        // Save new tokens
        setAccessToken(data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear everything and redirect to login
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Module-level variable - lives in memory, wiped on page refresh
// This is intentional: access tokens should NOT be in localStorage (XSS risk)
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export default api;
