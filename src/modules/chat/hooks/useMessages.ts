import { useEffect } from "react";
import { subscribeToMessages } from "../repositories/message.repository";

// Combines React Query infinite fetch with Supabase realtime for messages in a chat
import { usePaginatedMessagesForChat } from "../services/message.service";

export function useMessages(chatId: string, pageSize: number = 20) {
  const query = usePaginatedMessagesForChat(chatId, pageSize);

  useEffect(() => {
    if (!chatId) return;
    const subscription = subscribeToMessages(chatId, () => {
      // Refetch the first page (newest messages)
      query.refetch();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  return query;
}
