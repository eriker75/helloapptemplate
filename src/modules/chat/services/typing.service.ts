import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TypingEvent,
  TypingRepository,
} from "../repositories/typing.repository";

export function useSetTyping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      userId,
      isTyping,
    }: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      await TypingRepository.setTyping(chatId, userId, isTyping);
    },
    onSuccess: (_data, variables) => {
      // Invalidate typing users for this chat
      queryClient.invalidateQueries({
        queryKey: ["typing-users", variables.chatId],
      });
    },
  });
}

export function useClearTyping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      await TypingRepository.clearTyping(chatId, userId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["typing-users", variables.chatId],
      });
    },
  });
}

export function useTypingUsers(chatId: string) {
  return useQuery<TypingEvent[]>({
    queryKey: ["typing-users", chatId],
    queryFn: () => TypingRepository.getTypingUsers(chatId),
    refetchInterval: 2000, // fallback polling in case realtime fails
  });
}
