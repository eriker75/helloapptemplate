import { useMutation } from "@tanstack/react-query";
import {
  loginWithGoogle,
  logout,
  fetchMyProfile,
} from "../repositories/auth.repository";
import type { UserProfile } from "../definitions/UserProfile.model";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";
import { User } from "@react-native-google-signin/google-signin";

/**
 * React Query mutation for Google login.
 * Usage: const mutation = useGoogleLoginMutation();
 * mutation.mutate(idToken);
 */
export function useGoogleLoginMutation() {
  return useMutation<UserProfile | undefined, Error, string>({
    mutationFn: async (idToken: string) => {
      // 1. Login with Google, get tokens and userId
      const authResponse = await loginWithGoogle(idToken);

      // 2. Save tokens in store (so axios sends them)
      useAuthUserProfileStore.getState().setTokens({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        userId: authResponse.userId,
      });

      // 3. Fetch profile
      const profileRaw = await fetchMyProfile();

      // 4. Map to UserProfile shape
      const userProfile: UserProfile = {
        id: profileRaw.user?.id ?? profileRaw.userId ?? "",
        name:
          (profileRaw.user?.firstName && profileRaw.user?.lastName
            ? `${profileRaw.user.firstName} ${profileRaw.user.lastName}`
            : profileRaw.user?.firstName || profileRaw.user?.lastName || "") ??
          "",
        email: profileRaw.user?.email ?? "",
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        profile_id: profileRaw.id ?? profileRaw.profile_id ?? "",
        alias: profileRaw.alias ?? null,
        bio: profileRaw.bio ?? null,
        birth_date: profileRaw.birthdate ?? profileRaw.birth_date ?? null,
        gender:
          typeof profileRaw.gender === "number"
            ? profileRaw.gender
            : profileRaw.gender
            ? parseInt(profileRaw.gender)
            : null,
        interested_in: profileRaw.interests ?? profileRaw.interested_in ?? null,
        avatar: profileRaw.avatar ?? null,
        address: profileRaw.address ?? null,
        preferences: profileRaw.preferences ?? null,
        last_online:
          profileRaw.lastConnection ?? profileRaw.last_online ?? null,
        location: profileRaw.location ?? null,
        latitude: profileRaw.lat ?? profileRaw.latitude ?? 0,
        longitude: profileRaw.lng ?? profileRaw.longitude ?? 0,
        is_onboarded:
          profileRaw.onboarded ??
          profileRaw.is_onboarded ??
          (profileRaw.onboarded === true ? 1 : 0),
        status:
          typeof profileRaw.status === "number"
            ? profileRaw.status
            : profileRaw.status
            ? parseInt(profileRaw.status)
            : null,
        is_verified:
          typeof profileRaw.verified === "number"
            ? profileRaw.verified
            : profileRaw.verified
            ? parseInt(profileRaw.verified)
            : null,
        created_at: profileRaw.createdAt ?? profileRaw.created_at ?? "",
        updated_at: profileRaw.updatedAt ?? profileRaw.updated_at ?? null,
      };

      return userProfile;
    },
  });
}

/**
 * React Query mutation for logout.
 * Usage: const mutation = useLogoutMutation();
 * mutation.mutate();
 */
export function useLogoutMutation() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      return await logout();
    },
  });
}

/**
 * Fetches the profile from the backend and merges with Google info.
 * @param googleInfo - The object returned by GoogleSignin.signIn()
 * @param tokens - The tokens returned by backend login
 * @returns Promise<UserProfile>
 */
export async function fetchAndMergeProfile(
  googleInfo: User["user"],
  tokens: { accessToken: string; refreshToken: string; userId: string }
): Promise<UserProfile> {

  console.log(JSON.stringify({ googleInfo }, null, 2));

  const profileRaw = await fetchMyProfile();

  // Determine if onboarded
  const isOnboarded = profileRaw.onboarded ?? profileRaw.is_onboarded ?? false;

  // Merge logic: prioritize profile if onboarded, else Google info
  const nameFromGoogle =
    googleInfo?.givenName && googleInfo?.familyName
      ? `${googleInfo.givenName} ${googleInfo.familyName}`
      : googleInfo?.name || "";

  const userProfile: UserProfile = {
    id: profileRaw.user?.id ?? profileRaw.userId ?? tokens.userId ?? "",
    name: isOnboarded
      ? profileRaw.user?.firstName && profileRaw.user?.lastName
        ? `${profileRaw.user.firstName} ${profileRaw.user.lastName}`
        : profileRaw.user?.firstName || profileRaw.user?.lastName || ""
      : nameFromGoogle,
    email: profileRaw.user?.email ?? googleInfo?.email ?? "",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    profile_id: profileRaw.id ?? profileRaw.profile_id ?? "",
    alias: profileRaw.alias ?? null,
    bio: profileRaw.bio ?? null,
    birth_date: profileRaw.birthdate,
    gender: parseInt(profileRaw.gender),
    interested_in: profileRaw.interests ?? profileRaw.interested_in ?? null,
    avatar: isOnboarded ? profileRaw.avatar ?? null : googleInfo?.photo ?? null,
    address: profileRaw.address ?? null,
    preferences: profileRaw.preferences ?? null,
    last_online: profileRaw.lastConnection ?? profileRaw.last_online ?? null,
    location: profileRaw.location ?? null,
    latitude: profileRaw.lat ?? profileRaw.latitude ?? 0,
    longitude: profileRaw.lng ?? profileRaw.longitude ?? 0,
    is_onboarded: isOnboarded ? 1 : 0,
    status:
      typeof profileRaw.status === "number"
        ? profileRaw.status
        : profileRaw.status
        ? parseInt(profileRaw.status)
        : null,
    is_verified:
      typeof profileRaw.verified === "number"
        ? profileRaw.verified
        : profileRaw.verified
        ? parseInt(profileRaw.verified)
        : null,
    created_at: profileRaw.createdAt ?? profileRaw.created_at ?? "",
    updated_at: profileRaw.updatedAt ?? profileRaw.updated_at ?? null,
  };

  return userProfile;
}
