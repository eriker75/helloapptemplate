/**
 * MOCKED MESSAGE REPOSITORY (typed, async)
 * All Supabase logic has been removed. This file now uses in-memory mock data.
 * Types are based on db.md DDL. All functions simulate async requests.
 */

import type { Message } from "./chat.repository";

function asyncDelay<T>(result: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

// --- Use the same mockMessages and mockChats as in chat.repository.ts ---
import { mockChats, mockMessages } from "./mockData";

// --- Main API ---

export async function getPaginatedMessagesForChat(
  chatId: string,
  limit: number = 20,
  cursor: string | null = null
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  let messages = mockMessages
    .filter((m) => m.chat_id === chatId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (cursor) {
    messages = messages.filter((m) => new Date(m.created_at) > new Date(cursor));
  }

  const page = messages.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].created_at : null;
  return asyncDelay({ messages: page, nextCursor });
}

export async function sendMessage(dto: {
  chat_id: string;
  content: string;
  sender_id: string;
}): Promise<Message | null> {
  const newId = "m" + (mockMessages.length + 1);
  const newMsg: Message = {
    id: newId,
    chat_id: dto.chat_id,
    content: dto.content,
    created_at: new Date().toISOString(),
    updated_at: null,
    sender_id: dto.sender_id,
    parent_id: null,
    draft_content: null,
    type: "text",
    readed: false,
    deleted: false,
  };
  mockMessages.push(newMsg);

  // Update chat's last_message_id
  const chat = mockChats.find((c) => c.id === dto.chat_id);
  if (chat) {
    chat.last_message_id = newId;
    chat.updated_at = newMsg.created_at;
  }

  return asyncDelay(newMsg);
}

// Real-time subscriptions are not supported in mock mode
export function subscribeToMessages(chatId: string, callback: (message: Message) => void) {
  // No-op: In real app, replace with backend subscription
  return {
    unsubscribe: () => {},
  };
}

export function subscribeToMessageState(
  chatId: string,
  callback: (message: Message) => void
) {
  // No-op: In real app, replace with backend subscription
  return {
    unsubscribe: () => {},
  };
}

export async function markAllMessagesAsRead(chatId: string, userId: string): Promise<void> {
  mockMessages.forEach((m) => {
    if (
      m.chat_id === chatId &&
      m.sender_id !== userId &&
      !m.readed
    ) {
      m.readed = true;
    }
  });
  return asyncDelay(undefined);
}
