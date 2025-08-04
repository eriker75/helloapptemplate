import api from "../../../config/api";
import { AuthResponse } from "../dtos/auth-response.dto";

/**
 * Sends the Google id token to the backend for authentication.
 * @param idToken Google id token from Google Sign-In
 * @returns Promise<AuthResponse>
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
}

/**
 * Fetches the authenticated user's profile from /profiles/me.
 * @returns Promise<any> - The raw profile response from backend
 */
export async function fetchMyProfile(): Promise<any> {
  const response = await api.get("/profiles/me");
  return response.data;
}

/**
 * Calls the backend to log out the user and invalidate tokens.
 * @returns Promise<void>
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.log(error);
  }
}
