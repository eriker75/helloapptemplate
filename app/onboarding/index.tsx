import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { Pressable } from "@/components/ui/pressable";
import { useOnboardingStore } from "@/src/modules/onboarding/onboarding.store";
import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

const StartOnboardingScreen = () => {
  const userProfile = useAuthUserProfileStore((state) => state.userProfile);

  useEffect(() => {
    if (userProfile?.is_onboarded === 1) {
      router.replace("/dashboard/radar");
    }
  }, [userProfile]);

  const name = useOnboardingStore((state) => state.name);
  const setName = useOnboardingStore((state) => state.setName);
  const validateCurrentStep = useOnboardingStore(
    (state) => state.validateCurrentStep
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isValidStep, setIsValidStep] = useState(false);

  const getPlaceholderText = () =>
    !isFocused && name.length === 0 ? "[nombre]" : "";

  useEffect(() => {
    const checkValidation = async () => {
      const isValid = await validateCurrentStep(1);
      setIsValidStep(isValid);
    };
    checkValidation();
  }, [name, validateCurrentStep]);

  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile?.name);
    }
  }, [userProfile]);

  const handleContinue = async () => {
    const isValid = await validateCurrentStep(1);
    if (isValid) {
      router.push("/onboarding/basicinfo");
    } else {
      Alert.alert(
        "Nombre Requerido",
        "Por favor dinos como te llamas para poder continuar"
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={25}
      showBackButton
      footerButtonText="Continuar"
      isStepValidated={isValidStep}
      onFooterButtonPress={handleContinue}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center"
      >
        <View className="mb-8">
          <View className="flex-row flex-wrap items-baseline mb-4">
            <Text className="text-2xl font-bold text-gray-900">¡Hola, </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholderText()}
              placeholderTextColor="#9CA3AF"
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                padding: 0,
                margin: 0,
              }}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />

            <Text className="text-2xl font-bold text-gray-900"> !</Text>
          </View>

          <Text className="text-gray-600 text-base leading-6">
            Ya casi terminamos...{"\n"}solo unos detalles más para comenzar
          </Text>
        </View>
      </KeyboardAvoidingView>

      <OnboardingScreenLayout.FooterExtra>
        <Text className="text-center text-sm text-gray-500">
          Al continuar aceptas los{" "}
          <Pressable
            onPress={() => router.push("/onboarding/terms-and-conditions")}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text className="text-[#7CDAF9] font-bold underline">
              Términos y Condiciones
            </Text>
          </Pressable>
        </Text>
      </OnboardingScreenLayout.FooterExtra>
    </OnboardingScreenLayout>
  );
};

export default StartOnboardingScreen;
