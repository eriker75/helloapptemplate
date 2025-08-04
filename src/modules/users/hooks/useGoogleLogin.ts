import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";

const DEMO_USER_PROFILE = {
  id: "1",
  name: "Alice Demo",
  email: "alice.demo@example.com",
  profile_id: "1",
  alias: "alice123",
  bio: "Loves hiking and coffee.",
  birth_date: "1995-06-15",
  gender: 0,
  interested_in: ["1"],
  avatar: "",
  address: "123 Main St",
  preferences: null,
  last_online: null,
  location: null,
  is_onboarded: 1,
  status: 1,
  latitude: 10.5,
  longitude: -66.9,
  is_verified: 1,
  created_at: new Date().toISOString(),
  updated_at: null,
  accessToken: "string",
  refreshToken: "string"
};

if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("Not GOOGLE_CLIENT_ID Found in env variables");
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

export const useGoogleLogin = () => {
  const router = useRouter();
  const setAuthUserProfileData = useAuthUserProfileStore(
    (state) => state.setAuthUserProfileData
  );
  const clearAuthData = useAuthUserProfileStore((state) => state.clearAuthData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Verificar servicios de Google Play
      await GoogleSignin.hasPlayServices();

      // 2. Iniciar sesión con Google
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }
      const idToken = response.data.idToken;

      // 3. Simular autenticación backend con idToken
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Aquí normalmente enviarías el idToken al backend para validación.
      // Por ahora, simplemente aceptamos cualquier token y devolvemos el usuario demo.

      await setAuthUserProfileData(DEMO_USER_PROFILE);
      return true;
    } catch (err) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            setError("Inicio de sesión cancelado");
            return false;
          case statusCodes.IN_PROGRESS:
            setError("Proceso de inicio de sesión en progreso");
            return false;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services no está disponible");
            return false;
          default:
            setError("Error en el inicio de sesión con Google");
            return false;
        }
      } else {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.signOut();
      await clearAuthData();
      router.replace("/login");
    } catch (err) {
      setError("Error al cerrar sesión demo");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
    error,
  };
};
