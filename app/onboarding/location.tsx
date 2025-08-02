import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import { useOnboardingStore } from "@/src/modules/onboarding/onboarding.store";
import { useUpdateProfile } from "@/src/modules/users/services/auth-user-profile.service";
import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import { requestLocationPermission } from "@/src/utils/location";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Alert, Dimensions, Image, Text, View } from "react-native";

const LocationImg = require("@/assets/images/location-img.png");

const AllowLocationScreen = () => {
  const screenHeight = Dimensions.get("window").height;

  const validateCurrentStep = useOnboardingStore(
    (state) => state.validateCurrentStep
  );
  const submitOnboarding = useOnboardingStore(
    (state) => state.submitOnboarding
  );
  const setSelectedLocation = useOnboardingStore(
    (state) => state.setSelectedLocation
  );

  const setCurrentLocation = useAuthUserProfileStore(
    (state) => state.setCurrentLocation
  );
  const updateUserProfileStore = useAuthUserProfileStore(
    (state) => state.updateUserProfile
  );
  const userId = useAuthUserProfileStore((state) => state.userProfile?.id);

  const store = useOnboardingStore();
  const updateProfileMutation = useUpdateProfile(userId!);

  const selectMyCurrentLocationAndContinue = async () => {
    try {
      // Paso 1: Validar permisos
      const permissionStatus = await requestLocationPermission();

      if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
        Alert.alert(
          "Permisos requeridos",
          "Debes habilitar los permisos de ubicación para continuar"
        );
        return;
      }

      // Paso 2: Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Actualizar estados locales
      setCurrentLocation({ latitude, longitude });
      setSelectedLocation("Ubicación actual", { latitude, longitude });

      // Paso 3: Validar paso
      const isValid = await validateCurrentStep(4);
      if (!isValid) {
        Alert.alert(
          "Locación inválida",
          "Por favor seleccione una locación válida"
        );
        return;
      }

      // Paso 4: Actualizar perfil (mock/local, sin Supabase)
      await updateProfileMutation.mutateAsync({
        alias: store.alias,
        bio: store.bio,
        interested_in: store.interestedIn,
        avatar: store.mainPicture,
        address: store.selectedAddress,
        location: JSON.stringify({ latitude, longitude }),
        latitude,
        longitude,
        is_onboarded: 1,
      });

      console.log(updateProfileMutation.data);

      // Paso 5: Reflejar en el store local del perfil
      updateUserProfileStore({
        latitude,
        longitude,
        location: JSON.stringify({ latitude, longitude }),
        address: "Ubicación actual",
        alias: store.alias,
      });

      // Paso 6: Continuar con el onboarding
      await submitOnboarding();
      router.push("/dashboard/swipe");
    } catch (error) {
      console.error("Error en ubicación:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al obtener tu ubicación. Por favor intenta nuevamente."
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={100}
      showBackButton
      isStepValidated={true}
      footerButtonText="Activar ubicación"
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
      </View>
    </OnboardingScreenLayout>
  );
};

export default AllowLocationScreen;
