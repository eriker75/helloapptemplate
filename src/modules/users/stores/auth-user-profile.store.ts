import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CustomStorage } from "@/src/config/storage";
import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import { Location } from "@/src/definitions/ineterfaces/Location.interface";
import {
  checkLocationPermission,
  requestLocationPermission,
} from "@/src/utils/location";
import { UserProfile } from "../definitions/UserProfile.model";

export interface AuthUserProfileState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  locationStatus: LocationPermissionStatuses;
  currentLocation: Location | null;
}

export interface AuthUserProfileActions {
  setTokens: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  }) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;

  setAuthUserProfileData: (userProfile: UserProfile | null) => Promise<void>;
  loadAuthData: () => Promise<void>;
  clearAuthData: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  requestLocationPermission: () => Promise<LocationPermissionStatuses>;
  checkLocationPermission: () => Promise<LocationPermissionStatuses>;
  setCurrentLocation: (location: Location | null) => void;
}

const initialAuthUserProfileState: AuthUserProfileState = {
  userProfile: {
    id: "",
    name: "",
    email: "",
    accessToken: "",
    refreshToken: "",
    profile_id: "",
    alias: "",
    bio: "",
    birth_date: "",
    gender: 0,
    interested_in: [],
    avatar: "",
    address: "",
    preferences: null,
    last_online: null,
    location: null,
    is_onboarded: 0,
    status: 0,
    latitude: 0,
    longitude: 0,
    is_verified: 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    ageRangePreference: [18, 99],
  },
  isLoading: false,
  isAuthenticated: false,
  error: null,
  locationStatus: LocationPermissionStatuses.CHECKING,
  currentLocation: null,
};

export type AuthUserProfileStoreStore = AuthUserProfileState &
  AuthUserProfileActions;

const authUserProfileStoreCreator: StateCreator<
  AuthUserProfileStoreStore,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  AuthUserProfileStoreStore
> = (set, get) => ({
  ...initialAuthUserProfileState,

  setAuthUserProfileData: async (userProfile) => {
    set((state) => {
      state.isLoading = true;
    });
    set((state) => {
      state.userProfile = userProfile;
      state.isAuthenticated = !!userProfile;
      state.isLoading = false;
      state.error = null;
    });
  },

  setTokens: ({ accessToken, refreshToken, userId }) => {
    const current = get().userProfile;
    if (current) {
      const updated = {
        ...current,
        accessToken,
        refreshToken,
        id: String(userId),
      };
      set((state) => {
        state.userProfile = updated;
        state.isAuthenticated = true;
        state.isLoading = false;
      });
    }
  },

  clearTokens: () => {
    const current = get().userProfile;
    if (current) {
      const updated = {
        ...current,
        accessToken: "",
        refreshToken: "",
      };
      set((state) => {
        state.userProfile = updated;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
    }
  },

  getAccessToken: () => {
    const userProfile = get().userProfile;
    return userProfile ? userProfile.accessToken : null;
  },

  getRefreshToken: () => {
    const userProfile = get().userProfile;
    return userProfile ? userProfile.refreshToken : null;
  },

  loadAuthData: async () => {
    set((state) => {
      state.isLoading = true;
    });
    try {
      set((state) => {
        state.isLoading = false;
        state.error = null;
      });
    } catch (error) {
      set((state) => {
        state.error = error as Error;
        state.isLoading = false;
      });
      throw error;
    }
  },

  clearAuthData: async () => {
    try {
      set((state) => {
        state.userProfile = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
    } catch (error) {
      set((state) => {
        state.error = error as Error;
        state.isLoading = false;
      });
    }
  },

  updateUserProfile: (updates) => {
    const current = get().userProfile;
    const updated = current ? { ...current, ...updates } : null;
    set((state) => {
      state.userProfile = updated;
    });
  },

  requestLocationPermission: async () => {
    const status = await requestLocationPermission();
    set((state) => {
      state.locationStatus = status;
    });
    return status;
  },

  checkLocationPermission: async () => {
    const status = await checkLocationPermission();
    set((state) => {
      state.locationStatus = status;
    });
    return status;
  },

  setCurrentLocation: (location) =>
    set((state) => {
      state.currentLocation = location;
    }),
});

export const useAuthUserProfileStore = create<AuthUserProfileStoreStore>()(
  immer(
    persist(authUserProfileStoreCreator, {
      name: "auth-user-profile-store",
      storage: createJSONStorage(() => CustomStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    })
  )
);
