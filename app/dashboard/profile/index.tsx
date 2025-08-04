import ChatBubbleIcon from "@/assets/images/chat-bubble.svg";
import {
  Avatar,
  AvatarBadge,
  AvatarImage,
  Button,
  ButtonIcon,
  ButtonText,
} from "@/components/ui";
import { Text } from "@/components/ui/text";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
const { width } = Dimensions.get("window");
const PROFILE_IMAGE = require("@/assets/images/profile-bg.jpg");
const AVATAR_IMAGE = require("@/assets/images/avatar-placeholder.png");

import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import { useRouter } from "expo-router";
import { useCallback } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const clearAuthData = useAuthUserProfileStore((state) => state.clearAuthData);

  const handleLogout = useCallback(async () => {
    await clearAuthData();
    router.replace("/login");
  }, [clearAuthData, router]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top curved image */}
        <View style={styles.topImageContainer}>
          <ImageBackground
            source={PROFILE_IMAGE}
            style={styles.topImage}
            imageStyle={styles.topImageRadius}
            resizeMode="cover"
          >
            {/* Optionally add navigation arrows here */}
          </ImageBackground>
          {/* Avatar overlapping */}
          <View style={styles.avatarWrapper}>
            <Avatar size="xl">
              <AvatarImage source={AVATAR_IMAGE} />
              <AvatarBadge>
                <TouchableOpacity style={styles.editBadge}>
                  {/* Use an edit icon here */}
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
              </AvatarBadge>
            </Avatar>
          </View>
        </View>

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>Alex Gutierrez, 24</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.genderText}>Hombre, busca conocer mujeres</Text>
          <Text style={styles.descriptionText}>
            “Explorando la ciudad y nuevas conexiones. Amante de los atardeceres
            y los memes. ¿Nos tomamos un café o damos match en una playlist?”
          </Text>
        </View>
      </ScrollView>
      {/* Bottom button */}
      <View style={styles.bottomButtonContainer}>
        <Button style={styles.bottomButton} onPress={handleLogout}>
          <ButtonText style={styles.bottomButtonText}>
            Cerrar sesión
          </ButtonText>
        </Button>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 110;
const AVATAR_OVERLAP = 55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topImageContainer: {
    width: "100%",
    height: 270,
    backgroundColor: "#eee",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  topImage: {
    width: "100%",
    height: "100%",
  },
  topImageRadius: {
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -AVATAR_OVERLAP,
    left: width / 2 - AVATAR_SIZE / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  editBadge: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 16,
    color: "#00BFFF",
  },
  infoContainer: {
    marginTop: AVATAR_OVERLAP + 20,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "Poppins-Bold",
  },
  editText: {
    fontSize: 14,
    color: "#00BFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
  },
  genderText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    fontFamily: "Poppins-Regular",
  },
  descriptionText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Poppins-Regular",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  bottomButton: {
    backgroundColor: "#F35B5B",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
  },
});
