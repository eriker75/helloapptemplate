import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CreateMessageDto } from "../dtos/create-message.dto";
import {
  getPaginatedMessagesForChat,
  sendMessage,
} from "../repositories/message.repository";

export function usePaginatedMessagesForChat(
  chatId: string,
  pageSize: number = 20
) {
  return useInfiniteQuery<
    { messages: any[]; nextCursor: string | null },
    Error
  >({
    queryKey: ["messages", chatId],
    queryFn: async (context) =>
      getPaginatedMessagesForChat(
        chatId,
        pageSize,
        (context.pageParam as string | null) ?? null
      ),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    initialPageParam: null,
    enabled: !!chatId,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 3000,
  });
}

// Send a new message
export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMessageDto) => sendMessage(dto),
    // Optimistic update
    onMutate: async (dto: CreateMessageDto) => {
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
      const previousData = queryClient.getQueryData<any>(["messages", chatId]);
      // Add optimistic message to the first page (newest)
      const optimisticMessage = {
        ...dto,
        id: "optimistic-" + Date.now(),
        created_at: new Date().toISOString(),
        readed: false,
        status: "sending",
      };
      queryClient.setQueryData<any>(["messages", chatId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) =>
            idx === 0
              ? { ...page, messages: [optimisticMessage, ...page.messages] }
              : page
          ),
        };
      });
      return { previousData };
    },
    onError: (error, _dto, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["messages", chatId], context.previousData);
      }
      console.error("Error sending message:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    },
  });
}

/**
 * Hook to mark all unread messages as read in a chat for the current user.
 */
import { markAllMessagesAsRead } from "../repositories/message.repository";
export function useMarkAllMessagesAsRead(chatId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await markAllMessagesAsRead(chatId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    },
  });
}
