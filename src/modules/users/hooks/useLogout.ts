import { useRouter } from "expo-router";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";
import { useLogoutMutation } from "../services/auth.service";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

/**
 * Hook for logging out the user: calls backend, clears tokens, and navigates to login.
 */
export const useLogout = () => {
  const router = useRouter();
  const clearAuthData = useAuthUserProfileStore((state) => state.clearAuthData);
  const logoutMutation = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await GoogleSignin.signOut();
      await clearAuthData();
      router.replace("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return {
    logout,
    ...logoutMutation,
    isLoading: logoutMutation.isPending,
    error: logoutMutation.error ? logoutMutation.error.message : null,
  };
};
