import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import { Location } from "@/src/definitions/ineterfaces/Location.interface";
import {
  checkLocationPermission,
  requestLocationPermission,
} from "@/src/utils/location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { UserProfile } from "../definitions/UserProfile.model";

interface AuthUserProfileStoreState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  locationStatus: LocationPermissionStatuses;
  currentLocation: Location | null;

  setAuthUserProfileData: (userProfile: UserProfile | null) => Promise<void>;
  loadAuthData: () => Promise<void>;
  clearAuthData: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  requestLocationPermission: () => Promise<LocationPermissionStatuses>;
  checkLocationPermission: () => Promise<LocationPermissionStatuses>;
  setCurrentLocation: (location: Location | null) => void;
}

export const useAuthUserProfileStore = create<AuthUserProfileStoreState>(
  (set, get) => ({
    userProfile: {
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
    },
    isLoading: false,
    isAuthenticated: true,
    error: null,
    locationStatus: LocationPermissionStatuses.CHECKING,
    currentLocation: null,

    setAuthUserProfileData: async (userProfile) => {
      set({ isLoading: true });
      try {
        if (userProfile) {
          await AsyncStorage.setItem(
            "userProfile",
            JSON.stringify(userProfile)
          );
        } else {
          await AsyncStorage.removeItem("userProfile");
        }

        set({
          userProfile,
          isAuthenticated: !!userProfile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: error as Error,
          isLoading: false,
        });
        throw error;
      }
    },

    loadAuthData: async () => {
      set({ isLoading: true });
      try {
        const userProfileStr = await AsyncStorage.getItem("userProfile");
        const userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;

        set({
          userProfile,
          isAuthenticated: !!userProfile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: error as Error,
          isLoading: false,
        });
        throw error;
      }
    },

    clearAuthData: async () => {
      try {
        await AsyncStorage.removeItem("userProfile");
        set({
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: error as Error,
          isLoading: false,
        });
      }
    },

    updateUserProfile: (updates) => {
      const current = get().userProfile;
      const updated = current ? { ...current, ...updates } : null;

      set({ userProfile: updated });
      if (updated) {
        AsyncStorage.setItem("userProfile", JSON.stringify(updated));
      }
    },

    requestLocationPermission: async () => {
      const status = await requestLocationPermission();
      set({ locationStatus: status });
      return status;
    },

    checkLocationPermission: async () => {
      const status = await checkLocationPermission();
      set({ locationStatus: status });
      return status;
    },

    setCurrentLocation: (location) => set({ currentLocation: location }),
  })
);
