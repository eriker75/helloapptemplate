/**
 * MOCKED CHAT REPOSITORY (typed, async)
 * All Supabase logic has been removed. This file now uses in-memory mock data.
 * Types are based on db.md DDL. All functions simulate async requests.
 */

export interface Chat {
  id: string; // uuid
  created_at: string;
  updated_at: string | null;
  is_active: boolean | null;
  type: string | null;
  last_message_id: string | null;
  description: string | null;
  creator_id: string | null;
  name: string | null;
}

export interface ChatMember {
  id: string;
  created_at: string;
  updated_at: string | null;
  chat_id: string;
  user_id: string;
  joined_at: string | null;
  role: string | null;
}

export interface Profile {
  id: string;
  alias: string | null;
  avatar: string | null;
  user_id: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string | null;
  created_at: string;
  updated_at: string | null;
  sender_id: string | null;
  parent_id: string | null;
  draft_content: string | null;
  type: string | null;
  readed: boolean | null;
  deleted: boolean | null;
}

function asyncDelay<T>(result: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

// --- Mock Data Store ---
import { mockChatMembers, mockChats, mockMessages, mockProfiles } from "./mockData";

// --- Helper functions ---
function getOtherMembers(chatId: string, userId: string) {
  return mockChatMembers
    .filter((m) => m.chat_id === chatId && m.user_id !== userId)
    .map((m) => m.user_id);
}

function getProfileByUserId(userId: string) {
  return mockProfiles.find((p) => p.user_id === userId);
}

function getMessageById(messageId: string) {
  return mockMessages.find((m) => m.id === messageId);
}

// --- Main API ---

export async function getUserChatList(userId: string): Promise<any[]> {
  const chatIds = mockChatMembers
    .filter((m) => m.user_id === userId)
    .map((m) => m.chat_id);

  if (!chatIds.length) return asyncDelay([]);

  const chatsData = mockChats.filter((c) => chatIds.includes(c.id));

  const enrichedChats = chatsData.map((chat) => {
    let last_message = null;
    let other_user_profile = null;

    const otherMembers = getOtherMembers(chat.id, userId);
    if (otherMembers.length === 0) return null;

    if (otherMembers.length === 1) {
      const profile = getProfileByUserId(otherMembers[0]);
      if (profile) {
        other_user_profile = {
          profileId: profile.id,
          userId: profile.user_id,
          alias: profile.alias,
          avatar: profile.avatar,
        };
      }
    }

    if (chat.last_message_id) {
      const lastMsg = getMessageById(chat.last_message_id);
      if (lastMsg) {
        let senderProfile = null;
        if (lastMsg.sender_id) {
          senderProfile = getProfileByUserId(lastMsg.sender_id);
        }
        last_message = {
          ...lastMsg,
          profiles: senderProfile,
        };
      }
    }

    const unread_count = mockMessages.filter(
      (m) =>
        m.chat_id === chat.id &&
        !m.readed &&
        m.sender_id !== userId
    ).length;

    const last_message_date = last_message?.created_at || chat.updated_at || chat.created_at;

    return {
      ...chat,
      last_message,
      unread_count,
      last_message_date,
      other_user_profile,
    };
  });

  const filteredChats = enrichedChats.filter((c): c is NonNullable<typeof c> => c !== null);
  return asyncDelay(
    filteredChats.sort(
      (a, b) =>
        new Date(b.last_message_date).getTime() -
        new Date(a.last_message_date).getTime()
    )
  );
}

export async function getPaginatedUserChats(
  userId: string,
  pageSize: number = 20,
  lastMessageDateCursor: string | null = null
): Promise<{ chats: any[]; nextCursor: string | null }> {
  const allChats = await getUserChatList(userId);
  let filtered = allChats;
  if (lastMessageDateCursor) {
    filtered = allChats.filter(
      (c) => new Date(c.last_message_date) < new Date(lastMessageDateCursor)
    );
  }
  const page = filtered.slice(0, pageSize);
  const nextCursor =
    page.length === pageSize
      ? page[page.length - 1].last_message_date
      : null;
  return asyncDelay({ chats: page, nextCursor });
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const chatIds = mockChatMembers
    .filter((m) => m.user_id === userId)
    .map((m) => m.chat_id);
  return asyncDelay(mockChats.filter((c) => chatIds.includes(c.id)));
}

export async function createChat(dto: { name?: string; members?: string[] }): Promise<Chat | null> {
  const newId = "c" + (mockChats.length + 1);
  const newChat: Chat = {
    id: newId,
    created_at: new Date().toISOString(),
    updated_at: null,
    is_active: true,
    type: "private",
    last_message_id: null,
    description: dto.name || "New Chat",
    creator_id: dto.members && dto.members.length > 0 ? dto.members[0] : null,
    name: dto.name || "New Chat",
  };
  mockChats.push(newChat);
  // Add members
  const members = dto.members;
  if (members && Array.isArray(members)) {
    members.forEach((userId: string, idx) => {
      mockChatMembers.push({
        id: "cm" + (mockChatMembers.length + 1),
        created_at: new Date().toISOString(),
        updated_at: null,
        chat_id: newId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        role: idx === 0 ? "creator" : "member",
      });
    });
  }
  return asyncDelay(newChat);
}

// Real-time subscriptions are not supported in mock mode
export function subscribeToUserChats(
  userId: string,
  callback: (chat: Chat) => void
) {
  // No-op: In real app, replace with backend subscription
  return {
    unsubscribe: () => {},
  };
}
