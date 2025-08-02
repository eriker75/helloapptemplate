/**
 * MOCKED TYPING REPOSITORY (typed, async)
 * All Supabase logic has been removed. This file now uses in-memory mock data.
 * All functions simulate async requests.
 */

export interface TypingEvent {
  id: string;
  chat_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

// --- Mock Data Store (in-memory) ---
let mockTypingEvents: TypingEvent[] = [];

function asyncDelay<T>(result: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

export class TypingRepository {
  static async setTyping(chatId: string, userId: string, isTyping: boolean): Promise<boolean> {
    const idx = mockTypingEvents.findIndex(
      (e) => e.chat_id === chatId && e.user_id === userId
    );
    const now = new Date().toISOString();
    if (idx !== -1) {
      mockTypingEvents[idx] = {
        ...mockTypingEvents[idx],
        is_typing: isTyping,
        updated_at: now,
      };
    } else {
      mockTypingEvents.push({
        id: `${chatId}-${userId}`,
        chat_id: chatId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: now,
      });
    }
    return asyncDelay(true);
  }

  static async clearTyping(chatId: string, userId: string): Promise<boolean> {
    mockTypingEvents = mockTypingEvents.filter(
      (e) => !(e.chat_id === chatId && e.user_id === userId)
    );
    return asyncDelay(true);
  }

  static async getTypingUsers(chatId: string): Promise<TypingEvent[]> {
    return asyncDelay(
      mockTypingEvents.filter(
        (e) => e.chat_id === chatId && e.is_typing
      )
    );
  }

  // Real-time subscriptions are not supported in mock mode
  static subscribeToTypingEvents(
    chatId: string,
    callback: (event: TypingEvent) => void
  ) {
    // No-op: In real app, replace with backend subscription
    return {
      unsubscribe: () => {},
    };
  }
}
