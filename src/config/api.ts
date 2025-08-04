import axios from "axios";
import { useAuthUserProfileStore } from "../modules/users/stores/auth-user-profile.store";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthUserProfileStore.getState().userProfile?.accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    console.error("Request error:", err);
    return Promise.reject(err);
  }
);

// Handle 401 responses: try to refresh token, or logout and redirect
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;
    // Prevent infinite retry loop
    if (originalRequest?._retry) {
      return Promise.reject(err);
    }

    // Don't try to refresh on login endpoint
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/google")
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      originalRequest._retry = true;
      const refreshToken =
        useAuthUserProfileStore.getState().userProfile?.refreshToken;

      try {
        interface RefreshResponseData {
          accessToken: string;
          refreshToken: string;
          userId: string;
        }
        const refreshResponse = await api.post<RefreshResponseData>(
          "/auth/refresh",
          {
            refreshToken,
          }
        );
        const {
          accessToken,
          refreshToken: newRefreshToken,
          userId,
        } = refreshResponse.data;

        useAuthUserProfileStore.getState().setTokens({
          accessToken,
          refreshToken: newRefreshToken,
          userId,
        });
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        await useAuthUserProfileStore.getState().clearAuthData();
        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
