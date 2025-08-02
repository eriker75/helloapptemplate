import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingLayout() {
  const router = useRouter();
  const userProfile = useAuthUserProfileStore((state) => state.userProfile);

  useEffect(() => {
    if (userProfile?.is_onboarded === 1) {
      router.replace("/dashboard/radar");
    }
  }, [userProfile, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Onboarding start" }} />
      <Stack.Screen
        name="basicinfo"
        options={{ title: "Informacion Basica" }}
      />
      <Stack.Screen name="location" options={{ title: "Activar Ubicación" }} />
      <Stack.Screen name="pictures" options={{ title: "Foto de Perfil" }} />
      <Stack.Screen
        name="terms-and-conditions"
        options={{ title: "Términos y Condiciones", headerShown: false }}
      />
    </Stack>
  );
}
