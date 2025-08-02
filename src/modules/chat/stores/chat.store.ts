import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { create } from "zustand";

type OtherUserProfile = {
  profileId: string;
  alias: string;
  avatar: string;
  userId: string;
  // Puede expandirse con más campos si es necesario
};

type Chat = {
  id: string;
  type: string;
  name?: string;
  other_user_profile?: OtherUserProfile;
  // ...otros campos relevantes
};

type AvatarLoadingState = "idle" | "loading" | "loaded" | "error";

type ChatStore = {
  chats: Chat[];
  avatarLoading: Record<string, AvatarLoadingState>; // userId -> state
  hydrated: boolean;
  setChats: (chats: Chat[]) => void;
  updateOtherUserProfile: (chatId: string, profile: OtherUserProfile) => void;
  setAvatarLoading: (userId: string, state: AvatarLoadingState) => void;
  getOtherUserProfile: (chatId: string) => OtherUserProfile | null;
  getChatName: (chatId: string) => string;
  getAvatar: (chatId: string) => {
    avatar: string;
    loading: AvatarLoadingState;
  };
  hydrate: () => Promise<void>;
};

const CHAT_STORAGE_KEY = "@helloapp/chats";

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  avatarLoading: {},
  hydrated: false,
  setChats: (chats) => {
    set({ chats });
    // Persist chats to AsyncStorage
    AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats)).catch((e) =>
      console.error("Failed to persist chats:", e)
    );
  },
  updateOtherUserProfile: (chatId, profile) => {
    set((state) => {
      const updatedChats = state.chats.map((c) =>
        c.id === chatId ? { ...c, other_user_profile: profile } : c
      );
      // Persist updated chats
      AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(updatedChats)
      ).catch((e) => console.error("Failed to persist chats:", e));
      return { chats: updatedChats };
    });
  },
  setAvatarLoading: (userId, state) =>
    set((store) => ({
      avatarLoading: { ...store.avatarLoading, [userId]: state },
    })),
  getOtherUserProfile: (chatId) => {
    const chat = get().chats.find((c) => c.id === chatId);
    return chat?.other_user_profile || null;
  },
  getChatName: (chatId) => {
    const chat = get().chats.find((c) => c.id === chatId);
    if (!chat) return "Chat";
    if (chat.type === "group") return chat.name || "Grupo";
    return chat.other_user_profile?.alias || "Chat";
  },
  getAvatar: (chatId) => {
    const chat = get().chats.find((c) => c.id === chatId);
    const userId = chat?.other_user_profile?.userId;
    const avatar = chat?.other_user_profile?.avatar || "";
    const loading =
      userId && get().avatarLoading[userId]
        ? get().avatarLoading[userId]
        : "idle";
    return { avatar, loading };
  },
  // Hydrate chats from AsyncStorage
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        set({ chats: JSON.parse(stored), hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch (e) {
      console.error("Failed to hydrate chats from storage:", e);
      set({ hydrated: true });
    }
  },
}));

// Optional: React hook to auto-hydrate on mount (can be used in App entry or chat screens)
export function useHydrateChatStore() {
  const hydrate = useChatStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
