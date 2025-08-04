import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CreateChatDto } from "../dtos/create-chat.dto";
import {
  createChat,
  getPaginatedUserChats,
  getUserChatList,
} from "../repositories/chat.repository";

// Fetch all chats for a user
/**
 * Fetch enriched chat list for a user (with last_message, unread_count, etc)
 */
export function useUserChats(userId: string) {
  return useQuery({
    queryKey: ["chats", userId],
    queryFn: () => getUserChatList(userId),
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 500,
  });
}

/**
 * Infinite query for paginated chats for a user.
 * Uses cursor-based pagination (last_message_date).
 */
export function usePaginatedUserChats(userId: string, pageSize: number = 20) {
  return useInfiniteQuery<{ chats: any[]; nextCursor: string | null }, Error>({
    queryKey: ["paginated-chats", userId],
    queryFn: async (context) =>
      getPaginatedUserChats(
        userId,
        pageSize,
        (context.pageParam as string | null) ?? null
      ),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    initialPageParam: null,
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

// Fetch all chats (from chats table)
/*
 * (Opcional) Si quieres mantener la función de obtener todos los chats sin usuario,
 * deberías definir una nueva función en el repositorio para eso.
 * Si no, puedes eliminar este hook si no se usa en la app.
 */
// export function useAllChats() {
//   return useQuery({
//     queryKey: ["all-chats"],
//     queryFn: getAllChats,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//   });
// }

// Create a new chat
export function useCreateChat(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateChatDto) => createChat(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", userId] });
      queryClient.invalidateQueries({ queryKey: ["all-chats"] });
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });
}
