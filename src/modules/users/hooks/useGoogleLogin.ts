import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";
import {
  useGoogleLoginMutation,
  fetchAndMergeProfile,
} from "../services/auth.service";

if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("Not GOOGLE_CLIENT_ID Found in env variables");
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

export const useGoogleLogin = () => {
  const setAuthUserProfileData = useAuthUserProfileStore(
    (state) => state.setAuthUserProfileData
  );
  const googleLoginMutation = useGoogleLoginMutation();

  const signIn = async () => {
    try {
      // 1. Verificar servicios de Google Play
      await GoogleSignin.hasPlayServices();

      // 2. Iniciar sesión con Google
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }
      const idToken = response.data.idToken;

      // 3. Enviar idToken al backend y obtener el perfil de usuario
      // 3. Login with backend, get tokens
      const authResponse = await googleLoginMutation.mutateAsync(idToken);

      if (!authResponse) return false;

      // 4. Merge Google info and backend profile
      const userProfile = await fetchAndMergeProfile(response.data.user, {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        userId: authResponse.id,
      });

      await setAuthUserProfileData(userProfile);

      return true;
    } catch (err) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            googleLoginMutation.reset();
            return false;
          case statusCodes.IN_PROGRESS:
            googleLoginMutation.reset();
            return false;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            googleLoginMutation.reset();
            return false;
          default:
            googleLoginMutation.reset();
            return false;
        }
      } else {
        // React Query will handle error state
        console.log(err);
      }
      return false;
    }
  };

  return {
    signIn,
    isLoading: googleLoginMutation.isPending,
    error: googleLoginMutation.error ? googleLoginMutation.error.message : null,
  };
};
