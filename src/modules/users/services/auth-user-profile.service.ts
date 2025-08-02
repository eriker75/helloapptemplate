import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingState } from "../../onboarding/onboarding.store";
import { UpdateProfileData } from "../dtos/update-profile.dto";
import {
  getNearbyUsers,
  onboardUser,
  updateProfile
} from "../repositories/profile.repository";

/**
 * React Query hook to fetch nearby users based on current user's ID and radius in km.
 *
 * @param userId - The ID of the current user
 * @param radiusKm - Search radius in kilometers (default: 200)
 */
export function useNearbyUsers(userId: string, radiusKm = 200) {
  return useQuery({
    queryKey: ["nearby-users", userId, radiusKm],
    queryFn: () => getNearbyUsers(userId, radiusKm),
    enabled: !!userId,
    refetchInterval: 3000,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

/**
 * React Query hook to fetch a user profile by ID.
 *
 * @param userId - The ID of the user to fetch
 */
import { getProfileById } from "../repositories/profile.repository";

export function useUserProfile(profileId: string) {
  return useQuery({
    queryKey: ["user-profile", profileId],
    queryFn: () => getProfileById(profileId),
    enabled: !!profileId,
  });
}

/**
 * React Query mutation to update user profile.
 *
 * @param userId - The ID of the current user
 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateProfileData>) =>
      updateProfile(userId, data),
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["nearby-users"] });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    },
  });
}

/**
 * React Query mutation to onboard a user with full onboarding state.
 *
 * @param userId - The ID of the current user
 */
export function useOnboardUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (state: OnboardingState) => onboardUser(userId, state),
    onSuccess: () => {
      // Refetch nearby users after onboarding
      queryClient.invalidateQueries({ queryKey: ["nearby-users"] });
    },
    onError: (error) => {
      console.error("Error onboarding user:", error);
    },
  });
}
