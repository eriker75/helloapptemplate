import { create } from "zustand";
import { UserProfile } from "../definitions/UserProfile.model";

interface UserProfilesStoreState {
  profilesById: Record<string, UserProfile>;
  setUserProfileById: (id: string, profile: UserProfile) => void;
  getUserProfileById: (id: string) => UserProfile | undefined;
  clearProfiles: () => void;
}

export const useUserProfilesStore = create<UserProfilesStoreState>(
  (set, get) => ({
    profilesById: {},
    setUserProfileById: (id, profile) => {
      set((state) => ({
        profilesById: {
          ...state.profilesById,
          [id]: profile,
        },
      }));
    },
    getUserProfileById: (id) => {
      return get().profilesById[id];
    },
    clearProfiles: () => {
      set({ profilesById: {} });
    },
  })
);
