/**
 * Shared mock data for chat, message, and profile repositories.
 * All arrays are exported and mutable.
 */

import type { Chat, ChatMember, Message, Profile } from "./chat.repository";

// --- Mock Profiles (minimal, for chat context) ---
export const mockProfiles: Profile[] = [
  { id: "1", alias: "alice123", avatar: "", user_id: "1" },
  { id: "2", alias: "bobster", avatar: "", user_id: "2" },
];

// --- Mock Chats ---
export const mockChats: Chat[] = [
  {
    id: "c1",
    created_at: new Date().toISOString(),
    updated_at: null,
    is_active: true,
    type: "private",
    last_message_id: "m1",
    description: "General chat",
    creator_id: "1",
    name: "General",
  },
  {
    id: "c2",
    created_at: new Date().toISOString(),
    updated_at: null,
    is_active: true,
    type: "private",
    last_message_id: "m2",
    description: "Random chat",
    creator_id: "1",
    name: "Random",
  },
];

// --- Mock Chat Members ---
export const mockChatMembers: ChatMember[] = [
  {
    id: "cm1",
    created_at: new Date().toISOString(),
    updated_at: null,
    chat_id: "c1",
    user_id: "1",
    joined_at: new Date().toISOString(),
    role: "member",
  },
  {
    id: "cm2",
    created_at: new Date().toISOString(),
    updated_at: null,
    chat_id: "c1",
    user_id: "2",
    joined_at: new Date().toISOString(),
    role: "member",
  },
  {
    id: "cm3",
    created_at: new Date().toISOString(),
    updated_at: null,
    chat_id: "c2",
    user_id: "1",
    joined_at: new Date().toISOString(),
    role: "member",
  },
];

// --- Mock Messages ---
export const mockMessages: Message[] = [
  {
    id: "m1",
    chat_id: "c1",
    content: "Hello Bob!",
    created_at: new Date(Date.now() - 100000).toISOString(),
    updated_at: null,
    sender_id: "1",
    parent_id: null,
    draft_content: null,
    type: "text",
    readed: true,
    deleted: false,
  },
  {
    id: "m2",
    chat_id: "c2",
    content: "Random chat message",
    created_at: new Date(Date.now() - 50000).toISOString(),
    updated_at: null,
    sender_id: "1",
    parent_id: null,
    draft_content: null,
    type: "text",
    readed: false,
    deleted: false,
  },
];
