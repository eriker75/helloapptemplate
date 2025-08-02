import CheckDone from "@/assets/images/check_done.svg";
import CheckDouble from "@/assets/images/check_double.svg";
import CheckSmall from "@/assets/images/check_small.svg";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import formatMessageTime from "@/src/utils/time-formatter";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const ChatsNotFound = require("@/assets/images/ChatsNotFound.png");

import { useTypingForChats } from "@/src/modules/chat/hooks/useTyping";
import { usePaginatedUserChats } from "@/src/modules/chat/services/chat.service";
import { useChatStore, useHydrateChatStore } from "@/src/modules/chat/stores/chat.store";
import { useAuthUserProfile } from "@/src/modules/users/hooks/useAuthUserProfile";
import { useEffect } from "react";

const MessageStatusIcon = ({ status }: { status: string }) => {
  if (status === "sent") return <CheckSmall />;
  if (status === "delivered") return <CheckDouble />;
  if (status === "read") return <CheckDone />;
  return null;
};

type ChatListItemProps = {
  id: string;
  name: string;
  avatar: string;
  loading?: boolean;
  lastMessage: string;
  lastMessageStatus: "sent" | "delivered" | "read" | "none";
  time: string;
  unread: number;
  isMe: boolean;
  onPress: (id: string) => void;
};

const ChatListItem = ({
  id,
  name,
  avatar,
  loading,
  lastMessage,
  lastMessageStatus,
  time,
  unread,
  isMe,
  onPress,
}: ChatListItemProps) => (
  <TouchableOpacity
    onPress={() => onPress(id)}
    activeOpacity={0.7}
    className="bg-[#eaf8fc] pt-3"
  >
    <HStack
      style={{
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#fff",
      }}
    >
      <Avatar size="lg" style={{ marginRight: 12 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#4fc3f7" />
        ) : (
          <AvatarImage source={{ uri: avatar }} />
        )}
      </Avatar>
      <VStack style={{ flex: 1 }}>
        <HStack
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{name}</Text>
          <Text style={{ color: "#b0b0b0", fontSize: 12 }}>
            {formatMessageTime(time)}
          </Text>
        </HStack>
        <HStack style={{ alignItems: "center", marginTop: 2 }}>
          {/* Check de estado alineado a la derecha */}
          <View style={{ marginLeft: 6, minWidth: 20 }}>
            <MessageStatusIcon status={lastMessageStatus} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: "#757575",
              fontSize: 13,
              flex: 1,
            }}
          >
            {lastMessage}
          </Text>

          {unread > 0 && (
            <View
              style={{
                backgroundColor: "#4fc3f7",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                {unread}
              </Text>
            </View>
          )}
        </HStack>
      </VStack>
    </HStack>
  </TouchableOpacity>
);

const ChatScreen = () => {
  useHydrateChatStore(); // Hydrate chat state from AsyncStorage on mount

  const router = useRouter();
  const { userProfile, isLoading: isUserLoading } = useAuthUserProfile();
  const userId = userProfile?.id;
  const {
    data: paginatedChats,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePaginatedUserChats(userId || "", 20);

  // Flatten paginated data
  const chats = paginatedChats?.pages
    ? paginatedChats.pages.flatMap((page: any) => page.chats)
    : [];

  // Chat store
  const setChats = useChatStore((s) => s.setChats);
  const getChatName = useChatStore((s) => s.getChatName);
  const getAvatar = useChatStore((s) => s.getAvatar);
  // const chats = useChatStore((s) => s.chats); // Removed: now using paginated data
  const hydrated = useChatStore((s) => s.hydrated);

  // Typing indicator for all chats
  const chatIds = chats.map((c: any) => c.id);
  const { data: typingMap } = useTypingForChats(chatIds);

  // Sync chats to store when fetched from network
  useEffect(() => {
    if (chats && Array.isArray(chats)) {
      setChats(chats);
    }
  }, [chats, setChats]);

  const handleChatPress = (id: string) => {
    router.push(`/dashboard/chats/${id}`);
  };

  const { width } = Dimensions.get("window");
  const imageWidth = width * 0.5;
  const imageHeight = imageWidth * 1.1;

  /**
   * Helper para obtener info del último mensaje de un chat
   * Devuelve: { text, isMe, status, time }
   */
  const getLastMessage = (chat: any, userId: string) => {
    const lastMsg = chat.last_message;
    if (!lastMsg) {
      return {
        text: "",
        isMe: false,
        status: "none",
        time: chat.last_message_date || chat.updated_at || chat.created_at,
      };
    }
    const isMe = lastMsg.sender_id === userId;
    let status: "sent" | "delivered" | "read" | "none" = "none";
    if (lastMsg.readed) {
      status = "read";
    } else if (!isMe) {
      status = "delivered";
    } else {
      status = "sent";
    }
    return {
      text: lastMsg.content,
      isMe,
      status,
      time: lastMsg.created_at || chat.last_message_date || chat.updated_at || chat.created_at,
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eaf8fc" }}>
      {/* Header */}
      <HStack
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: "#eaf8fc",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 26, color: "#222" }}>
          Chats
        </Text>
        <Avatar size="md">
          <AvatarImage
            source={{
              uri:
                userProfile?.avatar ||
                "https://randomuser.me/api/portraits/men/10.jpg",
            }}
          />
        </Avatar>
      </HStack>
      {/* Chat List or Empty State */}
      {(isUserLoading || (!hydrated && isLoading)) ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Circular progress spinner */}
          <Spinner size="large" color="#4fc3f7" />
        </View>
      ) : error && (!chats || chats.length === 0) ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Error cargando chats</Text>
        </View>
      ) : !chats || chats.length === 0 ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Image
            source={ChatsNotFound}
            style={{
              width: imageWidth,
              height: imageHeight,
              resizeMode: "contain",
              marginBottom: 32,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              color: "#444",
              textAlign: "center",
              marginBottom: 0,
            }}
          >
            ¡Tu bandeja está vacía! Pero no por mucho... empieza a conectar 😉
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(chat: any) => chat.id}
          renderItem={({ item: chat }: { item: any }) => {
            const isGroup = chat.type === "group";
            if (!isGroup && !chat.other_user_profile) return null;
            const name = getChatName(chat.id);
            const { avatar, loading } = getAvatar(chat.id);
            const last = getLastMessage(chat, userId || "");
            const unread = chat.unread_count || 0;

            // Typing indicator logic
            const typingUsers = typingMap?.[chat.id]?.filter((u: any) => u.user_id !== userId) ?? [];
            let typingText = "";
            if (typingUsers.length === 1 && chat.type === "individual" && chat.other_user_profile) {
              typingText = `${chat.other_user_profile.alias || "Alguien"} está escribiendo...`;
            } else if (typingUsers.length > 0) {
              typingText = "Escribiendo...";
            }

            return (
              <ChatListItem
                id={chat.id}
                name={name}
                avatar={
                  avatar || (isGroup
                    ? "https://randomuser.me/api/portraits/lego/1.jpg"
                    : "https://randomuser.me/api/portraits/lego/1.jpg")
                }
                loading={loading === "loading"}
                lastMessage={
                  typingText
                    ? typingText
                    : last.text !== undefined && last.text !== null
                      ? (last.isMe ? `Tú: ${last.text}` : last.text)
                      : ""
                }
                lastMessageStatus={last.status as "sent" | "delivered" | "read" | "none"}
                time={last.time}
                unread={unread}
                isMe={last.isMe}
                onPress={handleChatPress}
              />
            );
          }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#4fc3f7" />
              </View>
            ) : null
          }
          style={{ flex: 1, backgroundColor: "#fff" }}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;
