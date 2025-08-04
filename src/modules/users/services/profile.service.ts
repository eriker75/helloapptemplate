import { fetchProfileMe } from "../repositories/profile.repository";

/**
 * Service for user profile business logic.
 */
export async function getProfileMe(token?: string) {
  // Here you could add business logic, mapping, or error handling if needed.
  return fetchProfileMe(token);
}
