import { useEffect } from "react";
import { UserProfile } from "../definitions/UserProfile.model";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";

interface UseAuthUserReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

export const useAuthUserProfile = (): UseAuthUserReturn => {
  const userProfile = useAuthUserProfileStore((state) => state.userProfile);
  const isLoading = useAuthUserProfileStore((state) => state.isLoading);
  const isAuthenticated = useAuthUserProfileStore(
    (state) => state.isAuthenticated
  );
  const error = useAuthUserProfileStore((state) => state.error);
  const loadAuthData = useAuthUserProfileStore((state) => state.loadAuthData);

  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  return {
    userProfile,
    isLoading,
    isAuthenticated,
    error,
  };
};
