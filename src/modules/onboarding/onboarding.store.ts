import { Location } from "@/src/definitions/ineterfaces/Location.interface";
import { create } from "zustand";
import { useAuthUserProfileStore } from "../users/stores/auth-user-profile.store";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "./onboarding.schemas";

export interface OnboardingState {
  name: string;
  alias: string;
  birth_date: string;
  bio: string;
  gender: string;
  interestedIn: string[];
  mainPicture: string;
  secondaryPictures: string[];
  selectedAddress: string;
  selectedLocation: Location | null;
}

export interface OnboardingActions {
  // Profile Data
  setName: (name: string) => void;
  setAlias: (alias: string) => void;
  setBirthDate: (birth_date: string) => void;
  setBio: (bio: string) => void;
  setGender: (gender: string) => void;
  setInterest: (interestedIn: string[]) => void;
  addInterest: (interestedIn: string) => void;
  removeInterest: (interestedIn: string) => void;

  // Photos
  setMainPicture: (mainPicture: string) => void;
  setSecondaryPictures: (secondaryPictures: string[]) => void;
  addSecondaryPicture: (picture: string) => void;
  removeSecondaryPicture: (picture: string) => void;

  // Location
  setSelectedLocation: (address: string, location: Location | null) => void;
  clearSelectedLocation: () => void;

  // Utils
  reset: () => void;
  validateCurrentStep: (step: number) => Promise<boolean>;
  submitOnboarding: () => Promise<void>;
}

const initialState: OnboardingState = {
  name: "",
  alias: "",
  birth_date: "",
  bio: "",
  gender: "",
  interestedIn: [],
  mainPicture: "",
  secondaryPictures: [],
  selectedAddress: "",
  selectedLocation: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set, get) => ({
    ...initialState,

    // Personal User Profile Data
    setName: (name) => set({ name }),
    setAlias: (alias) => set({ alias }),
    setBirthDate: (birth_date) => set({ birth_date }),
    setBio: (bio) => set({ bio }),
    setGender: (gender) => set({ gender }),

    setInterest: (interestedIn) => set({ interestedIn }),
    addInterest: (interestedIn) =>
      set((state) => ({ interestedIn: [...state.interestedIn, interestedIn] })),
    removeInterest: (interestedIn) =>
      set((state) => ({
        interestedIn: state.interestedIn.filter((i) => i !== interestedIn),
      })),

    // Photos
    setMainPicture: (mainPicture) => set({ mainPicture }),
    setSecondaryPictures: (secondaryPictures) => set({ secondaryPictures }),
    addSecondaryPicture: (picture) =>
      set((state) => ({
        secondaryPictures: [...state.secondaryPictures, picture],
      })),
    removeSecondaryPicture: (picture) =>
      set((state) => ({
        secondaryPictures: state.secondaryPictures.filter((p) => p !== picture),
      })),

    // Location
    setSelectedLocation: (address, location) =>
      set({ selectedAddress: address, selectedLocation: location }),
    clearSelectedLocation: () =>
      set({ selectedAddress: "", selectedLocation: null }),

    // Steps Validation
    validateCurrentStep: async (step) => {
      const state = get();
      try {
        switch (step) {
          case 1:
            await step1Schema.parseAsync({ name: state.name });
            return true;
          case 2:
            await step2Schema.parseAsync({
              alias: state.alias,
              birth_date: state.birth_date,
              bio: state.bio,
              gender: state.gender,
              interestedIn: state.interestedIn,
            });
            return true;
          case 3:
            await step3Schema.parseAsync({
              mainPicture: state.mainPicture,
              secondaryPictures: state.secondaryPictures,
            });
            return true;
          case 4:
            await step4Schema.parseAsync({
              selectedAddress: state.selectedAddress,
              selectedLocation: state.selectedLocation,
            });
            return true;
          default:
            return false;
        }
      } catch (error) {
        console.log("Validation error:", error);
        return false;
      }
    },

    // Sendind Data
    submitOnboarding: async () => {
      const state = get();
      const authStore = useAuthUserProfileStore.getState();

      // Convertir datos de onboarding a formato de perfil de usuario
      const profileUpdates = {
        name: state.name,
        alias: state.alias,
        bio: state.bio,
        birth_date: state.birth_date,
        gender: state.gender === "1" ? 0 : state.gender === "2" ? 1 : 2,
        interested_in: state.interestedIn,
        avatar: state.mainPicture,
        address: state.selectedAddress,
        location: state.selectedLocation
          ? JSON.stringify(state.selectedLocation)
          : null,
        is_onboarded: 1,
      };

      await authStore.updateUserProfile(profileUpdates);
    },

    // Reset
    reset: () => set(initialState),
  })
);
