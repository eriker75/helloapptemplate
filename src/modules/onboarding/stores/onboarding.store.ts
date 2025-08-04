import { Location } from "@/src/definitions/ineterfaces/Location.interface";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useAuthUserProfileStore } from "../../users/stores/auth-user-profile.store";
import { step1Schema, step2Schema, step3Schema, step4Schema } from "../validators/onboarding.schemas";

// --- State Interface ---
export interface OnboardingState {
  name: string;
  alias: string;
  birth_date: string;
  bio: string;
  gender: string;
  interestedIn: string[];
  ageRangePreference: [number, number];
  mainPicture: string;
  secondaryPictures: string[];
  selectedAddress: string;
  selectedLocation: Location | null;
}

// --- Actions Interface ---
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
  setAgeRangePreference: (range: [number, number]) => void;

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
  // submitOnboarding removed: now handled by React Query mutation in useOnboardingSubmit hook
}

// --- Store Type ---
export type OnboardingStoreType = OnboardingState & Omit<OnboardingActions, "submitOnboarding">;

// --- Initial State ---
const initialOnboardingState: OnboardingState = {
  name: "",
  alias: "",
  birth_date: "",
  bio: "",
  gender: "",
  interestedIn: [],
  mainPicture: "",
  secondaryPictures: [],
  ageRangePreference: [18, 118],
  selectedAddress: "",
  selectedLocation: null,
};

// --- Store Creator ---
const onboardingStoreCreator: StateCreator<
  OnboardingStoreType,
  [],
  [],
  OnboardingStoreType
> = (set, get) => ({
  ...initialOnboardingState,

  // Profile Data
  setName: (name) => set({ name }),
  setAlias: (alias) => set({ alias }),
  setBirthDate: (birth_date) => set({ birth_date }),
  setBio: (bio) => set({ bio }),
  setGender: (gender) => set({ gender }),

  setInterest: (interestedIn) => set({ interestedIn }),
  addInterest: (interestedIn) =>
    set((state: OnboardingStoreType) => ({
      interestedIn: [...state.interestedIn, interestedIn],
    })),
  removeInterest: (interestedIn) =>
    set((state: OnboardingStoreType) => ({
      interestedIn: state.interestedIn.filter(
        (i: string) => i !== interestedIn
      ),
    })),
  setAgeRangePreference: (range) => set({ ageRangePreference: range }),

  // Photos
  setMainPicture: (mainPicture) => set({ mainPicture }),
  setSecondaryPictures: (secondaryPictures) => set({ secondaryPictures }),
  addSecondaryPicture: (picture) =>
    set((state: OnboardingStoreType) => ({
      secondaryPictures: [...state.secondaryPictures, picture],
    })),
  removeSecondaryPicture: (picture) =>
    set((state: OnboardingStoreType) => ({
      secondaryPictures: state.secondaryPictures.filter(
        (p: string) => p !== picture
      ),
    })),

  // Location
  setSelectedLocation: (address, location) =>
    set({ selectedAddress: address, selectedLocation: location }),
  clearSelectedLocation: () =>
    set({ selectedAddress: "", selectedLocation: null }),

  // Utils
  reset: () => set(initialOnboardingState),

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
});

// --- Store Export (with immer middleware for consistency) ---
export const useOnboardingStore = create<OnboardingStoreType>()(
  immer(onboardingStoreCreator)
);
