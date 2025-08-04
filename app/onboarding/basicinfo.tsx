import CustomInputDate from "@/components/elements/CustomInputDate";
import CustomInputText from "@/components/elements/CustomInputText";
import CustomInputTextarea from "@/components/elements/CustomInputTextarea";
import CustomRadioButton from "@/components/elements/CustomRadioButton";
import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { HStack, Text, VStack } from "@/components/ui";
import { GENDER_TYPES } from "@/src/definitions/constants/GENDER_TYPES";
import { INTEREST_TYPES } from "@/src/definitions/constants/INTEREST_TYPES";
import CustomInputRangeSlider from "@/components/elements/CustomInputRangeSlider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useOnboardingStore } from "@/src/modules/onboarding/stores/onboarding.store";

const BasicInfoScreen = () => {
  const alias = useOnboardingStore((state) => state.alias);
  const setAlias = useOnboardingStore((state) => state.setAlias);
  const birthDate = useOnboardingStore((state) => state.birth_date);
  const setBirthDate = useOnboardingStore((state) => state.setBirthDate);
  const aboutMe = useOnboardingStore((state) => state.bio);
  const setAboutMe = useOnboardingStore((state) => state.setBio);
  const gender = useOnboardingStore((state) => state.gender);
  const setGender = useOnboardingStore((state) => state.setGender);
  const interestedIn = useOnboardingStore((state) => state.interestedIn);
  const setInterest = useOnboardingStore((state) => state.setInterest);
  const validateCurrentStep = useOnboardingStore(
    (state) => state.validateCurrentStep
  );
  const [isValidStep, setIsValidStep] = useState(false);

  // Age range state
  const globalAgeRange = useOnboardingStore(
    (state) => state.ageRangePreference
  );
  const setAgeRange = useOnboardingStore(
    (state) => state.setAgeRangePreference
  );

  // Local state for slider UI
  const [ageRange, setLocalAgeRange] =
    useState<[number, number]>(globalAgeRange);

  // Sync local state with global on mount or global change
  useEffect(() => {
    setLocalAgeRange(globalAgeRange);
  }, [globalAgeRange]);

  const handleGenderSelect = (value: string) => {
    setGender(value);
  };

  const handleInterestSelect = (type: "male" | "female" | "both") => {
    switch (type) {
      case "male":
        setInterest([INTEREST_TYPES.MALE]);
        break;
      case "female":
        setInterest([INTEREST_TYPES.FEMALE]);
        break;
      case "both":
        setInterest([INTEREST_TYPES.MALE, INTEREST_TYPES.FEMALE]);
        break;
    }
  };

  const getSelectedInterestType = () => {
    if (
      interestedIn.includes(INTEREST_TYPES.MALE) &&
      interestedIn.includes(INTEREST_TYPES.FEMALE)
    ) {
      return "both";
    }
    if (interestedIn.includes(INTEREST_TYPES.MALE)) {
      return "male";
    }
    if (interestedIn.includes(INTEREST_TYPES.FEMALE)) {
      return "female";
    }
    return null;
  };

  useEffect(() => {
    console.log("checking...");
    const checkValidation = async () => {
      const isValid = await validateCurrentStep(2);
      setIsValidStep(isValid);
    };
    checkValidation();
  }, [alias, birthDate, aboutMe, gender, interestedIn, validateCurrentStep]);

  const handleContinue = async () => {
    console.log({ alias, birthDate, aboutMe, gender, interestedIn, ageRange });
    const isValid = await validateCurrentStep(2);
    if (isValid) {
      router.push("/onboarding/pictures");
    } else {
      Alert.alert(
        "Informacion Basica invalida",
        "Por favor complete su informacion personal correctamente"
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={50}
      showBackButton
      isStepValidated={isValidStep}
      footerButtonText="Continuar"
      onFooterButtonPress={handleContinue}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-[#1B1B1F] mt-2">
          ¡Arma tu perfil en un toque!
        </Text>

        <VStack space="lg" className="mt-6">
          <CustomInputText
            label="Nombre a mostrar"
            value={alias}
            setValue={setAlias}
            placeholder="Tu Nombre"
          />

          <CustomInputDate
            label="Fecha de nacimiento"
            value={birthDate}
            setValue={setBirthDate}
            placeholder="DD/MM/AAAA"
          />

          <CustomInputTextarea
            label="Acerca de ti"
            value={aboutMe}
            setValue={setAboutMe}
            placeholder="Descríbete para hacer nuevos amigos"
            maxLength={250}
          />

          <VStack className="mt-3">
            <Text className="text-[#35313D] mb-3 font-medium text-base">
              Tu Género
            </Text>
            <HStack space="xl" className="items-center">
              <CustomRadioButton
                label="Hombre"
                value={GENDER_TYPES.MALE}
                selectedValue={gender}
                onSelect={handleGenderSelect}
              />
              <CustomRadioButton
                label="Mujer"
                value={GENDER_TYPES.FEMALE}
                selectedValue={gender}
                onSelect={handleGenderSelect}
              />
            </HStack>
          </VStack>

          <VStack className="mt-3">
            <Text className="text-[#35313D] mb-3 font-medium text-base">
              Quiero conocer
            </Text>
            <HStack space="md">
              <CustomRadioButton
                label="Mujeres"
                value={INTEREST_TYPES.FEMALE}
                selectedValue={
                  getSelectedInterestType() === "female"
                    ? INTEREST_TYPES.FEMALE
                    : ""
                }
                onSelect={() => handleInterestSelect("female")}
              />
              <CustomRadioButton
                label="Hombres"
                value={INTEREST_TYPES.MALE}
                selectedValue={
                  getSelectedInterestType() === "male"
                    ? INTEREST_TYPES.MALE
                    : ""
                }
                onSelect={() => handleInterestSelect("male")}
              />
              <CustomRadioButton
                label="Ambos"
                value="both"
                selectedValue={
                  getSelectedInterestType() === "both" ? "both" : ""
                }
                onSelect={() => handleInterestSelect("both")}
              />
            </HStack>
          </VStack>
        </VStack>

        {/* Age Range Slider Section */}
        <VStack className="mt-8">
          <HStack className="justify-between items-center mb-2">
            <Text className="font-bold text-lg text-[#1B1B1F]">
              Rango de edad
            </Text>
            <Text className="text-[#35313D] text-base font-medium">
              {ageRange[1] >= 118
                ? `${ageRange[0]} a ∞ años`
                : `${ageRange[0]} a ${ageRange[1]} años`}
            </Text>
          </HStack>
          <CustomInputRangeSlider
            value={ageRange}
            onChange={setLocalAgeRange}
            min={18}
            max={118}
          />
          <HStack className="justify-between items-center mt-1 px-1">
            <Text className="text-[#35313D] text-base font-medium">18</Text>
            <MaterialCommunityIcons name="infinity" size={22} color="#35313D" />
          </HStack>
        </VStack>
      </ScrollView>
    </OnboardingScreenLayout>
  );
};

export default BasicInfoScreen;
