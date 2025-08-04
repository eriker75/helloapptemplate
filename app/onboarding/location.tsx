import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import {
  useOnboardingStore,
  OnboardingState,
} from "@/src/modules/onboarding/stores/onboarding.store";
import { useOnboardingSubmit } from "@/src/modules/onboarding/hooks/useOnboardingSubmit";
import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import { requestLocationPermission } from "@/src/utils/location";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Alert, Dimensions, Image, Text, View } from "react-native";
const LocationImg = require("@/assets/images/location-img.png");

const AllowLocationScreen = () => {
  const screenHeight = Dimensions.get("window").height;

  const validateCurrentStep = useOnboardingStore(
    (state: OnboardingState & any) => state.validateCurrentStep
  );
  const setSelectedLocation = useOnboardingStore(
    (state: OnboardingState & any) => state.setSelectedLocation
  );

  const setCurrentLocation = useAuthUserProfileStore(
    (state) => state.setCurrentLocation
  );

  // New onboarding submit hook (React Query)
  const { submitOnboarding, isPending, error } = useOnboardingSubmit();

  const selectMyCurrentLocationAndContinue = async () => {
    try {
      // 1. Validar permisos y obtener ubicación
      const permissionStatus = await requestLocationPermission();
      if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
        Alert.alert(
          "Permisos requeridos",
          "Debes habilitar los permisos de ubicación para continuar"
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Setear ubicación en el store de onboarding
      setCurrentLocation({ latitude, longitude });
      setSelectedLocation("Ubicación actual", { latitude, longitude });

      // 3. (Opcional) Validar paso
      const isValid = await validateCurrentStep(4);
      if (!isValid) {
        Alert.alert(
          "Locación inválida",
          "Por favor seleccione una locación válida"
        );
        return;
      }

      await submitOnboarding();
      router.push("/dashboard/swipe");
    } catch (error) {
      console.error("Error en ubicación:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al obtener tu ubicación o enviar tus datos. Por favor intenta nuevamente."
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={100}
      showBackButton
      isStepValidated={true}
      footerButtonText={isPending ? "Enviando..." : "Activar ubicación"}
      onFooterButtonPress={selectMyCurrentLocationAndContinue}
    >
      <View className="flex-1 pb-10 gap-10 items-center">
        <Text className="font-poppins font-bold text-3xl text-center">
          Necesitamos tu ubicación
        </Text>
        <Text className="font-poppins font-normal text-xl text-center">
          Queremos mostrarte gente real, cerca de ti.{"\n"}Para eso es
          importante tu ubicación, tu privacidad está segura
        </Text>
        <Image
          source={LocationImg}
          style={{
            width: "100%",
            height: screenHeight * 0.5,
            maxHeight: 400,
          }}
          resizeMode="contain"
        />
        {error && (
          <Text style={{ color: "red", marginTop: 10 }}>
            {typeof error === "string"
              ? error
              : error?.message || "Error enviando datos de onboarding"}
          </Text>
        )}
      </View>
    </OnboardingScreenLayout>
  );
};

export default AllowLocationScreen;
