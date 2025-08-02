import { useSendMessage as useSendMessageMutation } from "../services/message.service";

// Simple wrapper for sending messages in a chat
export function useSendMessage(chatId: string) {
  return useSendMessageMutation(chatId);
}
