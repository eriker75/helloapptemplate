import {
  Avatar,
  AvatarImage,
  Box,
  HStack,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { Message } from "@/src/modules/chat/definitions/Message.model";
import { useMessages } from "@/src/modules/chat/hooks/useMessages";
import { useTyping } from "@/src/modules/chat/hooks/useTyping";
import { subscribeToMessageState } from "@/src/modules/chat/repositories/message.repository";
import {
  useMarkAllMessagesAsRead,
  useSendMessage,
} from "@/src/modules/chat/services/message.service";
import { useChatStore } from "@/src/modules/chat/stores/chat.store";
import { useAuthUserProfile } from "@/src/modules/users/hooks/useAuthUserProfile";
import formatMessageTime from "@/src/utils/time-formatter";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
} from "react-native";

const ChatHeader = ({
  chatId,
  typingUsers,
}: {
  chatId: string;
  typingUsers?: { alias?: string }[];
}) => {
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
  // Debug logs
  console.log("ChatHeader chat:", chat);
  // Extract current user ID from profile
  const { userProfile } = useAuthUserProfile();
  const currentUserId = userProfile?.id;

  // Prefer the UUID from other_user_profile if available
  let otherUserId: string | undefined = undefined;
  if (
    chat &&
    chat.type === "individual" &&
    chat.other_user_profile &&
    chat.other_user_profile.profileId
  ) {
    otherUserId = chat.other_user_profile.profileId;
  }
  console.log("ChatHeader otherUserId:", otherUserId);

  const loading =
    otherUserId &&
    useChatStore.getState().avatarLoading[otherUserId] === "loading";
  let name = "Chat";
  let avatar = "https://randomuser.me/api/portraits/lego/1.jpg";
  if (chat) {
    if (chat.type === "group") {
      name = chat.name || "Grupo";
      avatar = "https://randomuser.me/api/portraits/lego/1.jpg";
    } else if (chat.other_user_profile) {
      name = chat.other_user_profile.alias || "Chat";
      avatar =
        chat.other_user_profile.avatar ||
        "https://randomuser.me/api/portraits/lego/1.jpg";
    }
  }

  return (
    <Box style={styles.header}>
      <HStack
        space="md"
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        {/* Make avatar + name area pressable for 1:1 chats */}
        {chat && chat.type === "individual" && otherUserId ? (
          <HStack space="md" style={{ alignItems: "center", flex: 1 }}>
            <Pressable onPress={() => router.replace("/dashboard/chats")}>
              <MaterialIcons name="arrow-back" size={24} color="#222" />
            </Pressable>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                backgroundColor: "#e0f7fa", // Visual debug
                borderWidth: 2,
                borderColor: "#ff9800",
              }}
              onPress={() => {
                console.log("clicked", otherUserId)
                if (otherUserId) {
                  router.push(`/dashboard/profile/${otherUserId}`);
                }
              }}
            >
              <Avatar size="lg">
                {loading ? (
                  <ActivityIndicator size="small" color="#4fc3f7" />
                ) : (
                  <AvatarImage
                    source={{
                      uri: avatar,
                    }}
                  />
                )}
              </Avatar>
              <VStack style={{ flex: 1 }}>
                <Text style={styles.headerName}>{name}</Text>
                {typingUsers && typingUsers.length > 0 && (
                  <Text style={{ color: "#5BC6EA", fontSize: 13 }}>
                    {typingUsers.length === 1
                      ? `${typingUsers[0].alias || "Alguien"} está escribiendo...`
                      : "Escribiendo..."}
                  </Text>
                )}
              </VStack>
            </Pressable>
          </HStack>
        ) : (
          <HStack space="md" style={{ alignItems: "center", flex: 1 }}>
            <Pressable onPress={() => router.replace("/dashboard/chats")}>
              <MaterialIcons name="arrow-back" size={24} color="#222" />
            </Pressable>
            <Avatar size="lg">
              {loading ? (
                <ActivityIndicator size="small" color="#4fc3f7" />
              ) : (
                <AvatarImage
                  source={{
                    uri: avatar,
                  }}
                />
              )}
            </Avatar>
            <VStack style={{ flex: 1 }}>
              <Text style={styles.headerName}>{name}</Text>
              {typingUsers && typingUsers.length > 0 && (
                <Text style={{ color: "#5BC6EA", fontSize: 13 }}>
                  {typingUsers.length === 1
                    ? `${typingUsers[0].alias || "Alguien"} está escribiendo...`
                    : "Escribiendo..."}
                </Text>
              )}
            </VStack>
          </HStack>
        )}
        <Pressable>
          <MaterialIcons name="more-vert" size={24} color="#222" />
        </Pressable>
      </HStack>
    </Box>
  );
};

const DateSeparator = ({ label }: { label: string }) => (
  <Box style={styles.dateSeparator}>
    <Text style={styles.dateSeparatorText}>{label}</Text>
  </Box>
);

const ChatBubble = ({
  text,
  fromMe,
  time,
}: {
  text: string;
  fromMe: boolean;
  time: string;
}) => (
  <HStack
    space="md"
    style={{
      marginVertical: 2,
      marginHorizontal: 8,
      justifyContent: fromMe ? "flex-end" : "flex-start",
    }}
  >
    <Box
      style={[
        styles.bubble,
        fromMe ? styles.bubbleMe : styles.bubbleOther,
        { alignSelf: fromMe ? "flex-end" : "flex-start" },
      ]}
    >
      <Text style={fromMe ? styles.bubbleTextMe : styles.bubbleTextOther}>
        {text}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: fromMe ? "#e0f7fa" : "#b0bfc6",
          marginTop: 2,
          textAlign: "right",
        }}
      >
        {formatMessageTime(time)}
      </Text>
    </Box>
  </HStack>
);

const ChatInputBar = ({
  value,
  onChangeText,
  onSend,
  sending,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
}) => {
  const [inputHeight, setInputHeight] = React.useState(40);

  return (
    <HStack style={[styles.inputBar, { alignItems: "center" }]} space="md">
      <Box style={styles.inputContainer}>
        <Textarea
          size="md"
          variant="default"
          className="text-base px-1 py-1 outline-none border-none"
          style={{ borderColor: "transparent", minHeight: 40, height: inputHeight, maxHeight: 120 }}
        >
          <TextareaInput
            placeholder="Escribe algo genial..."
            value={value}
            onChangeText={onChangeText}
            editable={!sending}
            onSubmitEditing={onSend}
            returnKeyType="send"
            numberOfLines={1}
            className="outline-none border-none"
            multiline
            onContentSizeChange={e => {
              const newHeight = Math.max(40, Math.min(e.nativeEvent.contentSize.height, 120));
              setInputHeight(newHeight);
            }}
            style={{ minHeight: 40, height: inputHeight, maxHeight: 120 }}
          />
        </Textarea>
      </Box>
      <Pressable style={styles.imageButton}>
        <MaterialIcons name="image" size={22} color="#666" />
      </Pressable>
      <Pressable
        style={styles.sendButton}
        onPress={onSend}
        disabled={sending || !value.trim()}
      >
        <MaterialIcons name="send" size={22} color="#fff" />
      </Pressable>
    </HStack>
  );
};

const ChatScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { userProfile } = useAuthUserProfile();
  const userId = userProfile?.id;
  const chats = useChatStore(s => s.chats);

  // Typing indicator logic
  const {
    typingUsers,
    handleTyping,
    handleSend: handleTypingSend,
  } = useTyping({
    chatId: chatId || "",
    userId: userId || "",
    enabled: !!chatId && !!userId,
  });

  // Map typing users to include alias (only for individual chats)
  const typingUsersWithAlias =
    typingUsers?.map(u => {
      let alias: string | undefined = undefined;
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.type === "individual" && chat.other_user_profile) {
        if (chat.other_user_profile.userId === u.user_id) {
          alias = chat.other_user_profile.alias;
        }
      }
      return { ...u, alias };
    }) ?? [];

  const {
    data: messagesData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(chatId || "");

  let flatMessages = messagesData?.pages
    ? messagesData.pages.flatMap((page: any) => page.messages)
    : [];

  // Remove optimistic messages if a real message with same content and created_at exists
  const realMessageIds = new Set(flatMessages.filter(m => !String(m.id).startsWith("optimistic-")).map(m => m.id));
  flatMessages = flatMessages.filter((msg, idx, arr) => {
    if (String(msg.id).startsWith("optimistic-")) {
      // If a real message exists with same content and created_at, remove optimistic
      return !arr.some(
        m =>
          !String(m.id).startsWith("optimistic-") &&
          m.content === msg.content &&
          m.created_at === msg.created_at
      );
    }
    return true;
  });
  const sendMessageMutation = useSendMessage(chatId || "");
  const markAllAsReadMutation = useMarkAllMessagesAsRead(
    chatId || "",
    userId || ""
  );

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (flatMessages.length === 0) return;
    // Scroll to bottom (index 0, since inverted)
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  }, [flatMessages.length]);

  const [input, setInput] = useState("");
  // Track last message id to detect new messages
  const lastMessageIdRef = React.useRef<string | null>(null);

  // Marcar todos los mensajes como leídos al entrar al chat
  React.useEffect(() => {
    if (chatId && userId) {
      markAllAsReadMutation.mutate();
    }
    // Solo cuando cambia el chat o el usuario
  }, [chatId, userId]);

  // Mark as read in real time when new messages arrive and chat is open
  React.useEffect(() => {
    if (!chatId || !userId || !flatMessages.length) return;
    const lastMsg = flatMessages[0]; // Newest message (since order is DESC)
    if (
      lastMsg &&
      lastMsg.sender_id !== userId &&
      lastMsg.id !== lastMessageIdRef.current
    ) {
      markAllAsReadMutation.mutate();
      lastMessageIdRef.current = lastMsg.id;
    }
  }, [flatMessages.length, chatId, userId]);

  // Subscribe to message state changes (delivered/read) and refetch messages
  React.useEffect(() => {
    if (!chatId) return;
    const subscription = subscribeToMessageState(chatId, () => {
      // Refetch messages on state change
      if (typeof fetchNextPage === "function") {
        // Optionally, could use refetch() if available
        fetchNextPage();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, fetchNextPage]);

  const handleSend = () => {
    if (!input.trim() || !userId) return;
    sendMessageMutation.mutate({
      chat_id: chatId,
      content: input.trim(),
      sender_id: userId,
    });
    setInput("");
  };
  // Cleanup typing state on unmount
  React.useEffect(() => {
    return () => {
      if (chatId && userId) {
        handleTypingSend();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <Box style={styles.container}>
          <ChatHeader chatId={chatId || ""} typingUsers={typingUsersWithAlias} />
          {isLoading ? (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Cargando mensajes...</Text>
            </Box>
          ) : error ? (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Error cargando mensajes</Text>
            </Box>
          ) : (
            <FlatList
              ref={flatListRef}
              data={flatMessages} // Newest at top, oldest at bottom (matches backend order)
              keyExtractor={(item: Message, idx: number) =>
                String(item.id).startsWith("optimistic-")
                  ? `optimistic-${item.id}-${item.created_at}-${idx}`
                  : `${item.id}-${item.created_at}-${idx}`
              }
              renderItem={({ item, index }) => (
                <>
                  {index === 0 && <DateSeparator label="Hoy" />}
                  <ChatBubble
                    text={item.content || ""}
                    fromMe={item.sender_id === userId}
                    time={item.created_at}
                  />
                </>
              )}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              inverted={true}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Box style={{ padding: 16, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#4fc3f7" />
                  </Box>
                ) : null
              }
            />
          )}
          {/* Typing indicator at bottom */}
          {typingUsersWithAlias && typingUsersWithAlias.length > 0 && (
            <TypingIndicator
              style={{ marginBottom: 4 }}
              text={
                typingUsersWithAlias.length === 1
                  ? `${typingUsersWithAlias[0].alias || "Alguien"} está escribiendo`
                  : "Escribiendo..."
              }
            />
          )}
          <ChatInputBar
            value={input}
            onChangeText={text => {
              setInput(text);
              handleTyping();
            }}
            onSend={() => {
              handleSend();
              handleTypingSend();
            }}
            sending={sendMessageMutation.isPending}
          />
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#EAF9FE",
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    elevation: 0,
    zIndex: 2,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginLeft: 8,
    fontFamily: "Poppins-SemiBold",
  },
  dateSeparator: {
    alignSelf: "center",
    backgroundColor: "#f2f6f8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginVertical: 8,
  },
  dateSeparatorText: {
    color: "#b0bfc6",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  messagesContainer: {
    paddingVertical: 8,
    paddingBottom: 60,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 2,
  },
  bubbleMe: {
    backgroundColor: "#5BC6EA",
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#F7F9FA",
    borderTopLeftRadius: 4,
  },
  bubbleTextMe: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  bubbleTextOther: {
    color: "#222",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    zIndex: 3,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#e0e7ef",
  },
  textInput: {
    fontSize: 15,
    color: "#222",
    fontFamily: "Poppins-Regular",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  imageButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#e0e7ef",
  },
  sendButton: {
    backgroundColor: "#5BC6EA",
    borderRadius: 24,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
