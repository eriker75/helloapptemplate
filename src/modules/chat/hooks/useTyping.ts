import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  TypingEvent,
  TypingRepository,
} from "../repositories/typing.repository";
import {
  useClearTyping,
  useSetTyping,
  useTypingUsers,
} from "../services/typing.service";
interface UseTypingOptions {
  chatId: string;
  userId: string;
  enabled?: boolean;
  typingTimeout?: number; // ms
  onTypingUsersChange?: (typingUsers: TypingEvent[]) => void;
}

export function useTyping({
  chatId,
  userId,
  enabled = true,
  typingTimeout = 3000,
  onTypingUsersChange,
}: UseTypingOptions) {
  const { mutate: setTyping } = useSetTyping();
  const { mutate: clearTyping } = useClearTyping();
  const { data: typingUsers, refetch } = useTypingUsers(chatId);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refetchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for typing events from others
  useEffect(() => {
    if (onTypingUsersChange && typingUsers) {
      onTypingUsersChange(typingUsers.filter((u) => u.user_id !== userId));
    }
  }, [typingUsers, userId, onTypingUsersChange]);

  // Subscribe to realtime typing events
  useEffect(() => {
    if (!enabled) return;
    const channel = TypingRepository.subscribeToTypingEvents(chatId, () => {
      // Debounce refetch to avoid flooding
      if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
      refetchDebounceRef.current = setTimeout(() => {
        refetch();
      }, 500);
    });
    return () => {
      channel.unsubscribe();
      if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
    };
  }, [chatId, enabled]);

  // Call this when user starts typing
  function handleTyping() {
    if (!enabled) return;
    setTyping({ chatId, userId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      clearTyping({ chatId, userId });
    }, typingTimeout);
  }

  // Call this when user sends a message
  function handleSend() {
    if (!enabled) return;
    clearTyping({ chatId, userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }

  return {
    typingUsers: typingUsers?.filter((u) => u.user_id !== userId) ?? [],
    handleTyping,
    handleSend,
  };
}

/**
 * Hook to get typing users for multiple chats at once.
 * Returns a map: { [chatId]: TypingEvent[] }
 */
export function useTypingForChats(chatIds: string[]) {
  return useQuery({
    queryKey: ["typing-users-for-chats", chatIds],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      for (const chatId of chatIds) {
        try {
          result[chatId] = await TypingRepository.getTypingUsers(chatId);
        } catch {
          result[chatId] = [];
        }
      }
      return result;
    },
    enabled: chatIds.length > 0,
    refetchInterval: 2000,
  });
}
