import { useEffect } from "react";
import { Chat } from "../definitions/Chat.model";
import { subscribeToUserChats } from "../repositories/chat.repository";
import { useUserChats } from "../services/chat.service";

// Fetch all chats and subscribe to new ones in real time
export function useChats(userId: string) {
  console.log({userId});
  const query = useUserChats(userId);

  useEffect(() => {
    if (!userId) return;
    const subscription = subscribeToUserChats(userId, (newChat: Chat) => {
      // Optimistically update the cache with the new chat
      query.refetch();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return query;
}
