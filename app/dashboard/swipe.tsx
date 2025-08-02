import { Text } from "@/components/ui";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { mockProfiles } from "@/src/modules/users/repositories/profile.repository";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper to require images from string paths (for mock assets)
const imageRequireMap: Record<string, any> = {
  "istockphoto1.jpg": require("@/assets/images/vertical/istockphoto1.jpg"),
  "istockphoto2.jpg": require("@/assets/images/vertical/istockphoto2.jpg"),
  "istockphoto3.jpg": require("@/assets/images/vertical/istockphoto3.jpg"),
  "istockphoto4.jpg": require("@/assets/images/vertical/istockphoto4.jpg"),
  "istockphoto5.jpg": require("@/assets/images/vertical/istockphoto5.jpg"),
  "istockphoto6.png": require("@/assets/images/vertical/istockphoto6.png"),
  "istockphoto7.jpg": require("@/assets/images/vertical/istockphoto7.jpg"),
  "istockphoto8.jpg": require("@/assets/images/vertical/istockphoto8.jpg"),
};

function requireImage(path: string) {
  const filename = path.split("/").pop() || "";
  return (
    imageRequireMap[filename] ||
    require("@/assets/images/avatar-placeholder.png")
  );
}

const { width, height } = Dimensions.get("window");
const GENDER_TEXT: Record<number, string> = {
  0: "Mujer",
  1: "Hombre",
  2: "Otro",
};

const SwipeScreen = () => {
  const [profileIndex, setProfileIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likeAnim] = useState(new Animated.Value(0));
  const [passAnim] = useState(new Animated.Value(0));
  const [cardAnim] = useState(new Animated.Value(0));
  const [cardOpacity] = useState(new Animated.Value(1));
  const carouselRef = useRef<any>(null);
  const router = useRouter();

  // Get current profile and its images (main + secondary, no duplicates, no empty)
  const currentProfile = mockProfiles[profileIndex % mockProfiles.length];
  const images = Array.from(
    new Set(
      [
        ...(currentProfile.main_photo ? [currentProfile.main_photo] : []),
        ...(currentProfile.photos || []),
      ].filter(Boolean)
    )
  );

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderGrant: () => {
      cardAnim.setOffset((cardAnim as any).__getValue());
    },
    onPanResponderMove: (evt, gestureState) => {
      cardAnim.setValue(gestureState.dx);
      // Update opacity based on swipe distance
      const progress = Math.abs(gestureState.dx) / (width * 0.5);
      cardOpacity.setValue(Math.max(0.7, 1 - progress * 0.3));
    },
    onPanResponderRelease: (evt, gestureState) => {
      cardAnim.flattenOffset();
      const { dx, vx } = gestureState;
      if (Math.abs(dx) > width * 0.25 || Math.abs(vx) > 0.5) {
        // Swipe threshold reached
        if (dx > 0) {
          // Swipe right - Like
          triggerLike();
        } else {
          // Swipe left - Pass
          triggerPass();
        }
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(cardAnim, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(cardOpacity, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  // Animations for like/pass - simplified without color interpolation
  const triggerLike = () => {
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(likeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        goNextProfile();
      }, 100);
    });
  };

  const triggerPass = () => {
    Animated.sequence([
      Animated.timing(passAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(passAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        goNextProfile();
      }, 100);
    });
  };

  // Go to next profile and reset photo index
  const goNextProfile = () => {
    setProfileIndex((prev) => (prev + 1) % mockProfiles.length);
    setPhotoIndex(0);
    cardAnim.setValue(0);
    cardOpacity.setValue(1);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ index: 0, animated: false });
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Truncate bio for excerpt
  const bioExcerpt =
    (currentProfile.bio || "").length > 60
      ? currentProfile.bio?.slice(0, 60) + "..."
      : currentProfile.bio;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: cardAnim },
              {
                rotate: cardAnim.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: ["-10deg", "0deg", "10deg"],
                  extrapolate: "clamp",
                }),
              },
            ],
            opacity: cardOpacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Background carousel image - Fixed */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <Carousel
              ref={carouselRef}
              width={width}
              height={height}
              data={images}
              scrollAnimationDuration={400}
              onSnapToItem={setPhotoIndex}
              renderItem={({ item }) => (
                <Image
                  source={requireImage(item)}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              loop={false}
            />
          ) : (
            <Image
              source={require("@/assets/images/avatar-placeholder.png")}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          {/* Overlay: dark gradient for readability */}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.leftSpace} />
          <Text style={styles.title}>Hola</Text>
          <Pressable
            onPress={() => router.push("/dashboard/profile")}
            style={styles.avatarButton}
          >
            <Avatar size="sm">
              <AvatarImage
                source={require("@/assets/images/avatar-placeholder.png")}
              />
            </Avatar>
          </Pressable>
        </View>

        {/* Carousel dots */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === photoIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}

        {/* User info overlay */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {currentProfile.alias},{" "}
            {currentProfile.birth_date
              ? calculateAge(currentProfile.birth_date)
              : ""}
          </Text>
          <Text style={styles.gender}>
            {GENDER_TEXT[currentProfile.gender ?? 2]}
          </Text>
          {bioExcerpt && <Text style={styles.bioExcerpt}>"{bioExcerpt}"</Text>}
        </View>

        {/* Blue animation overlay for buttons */}
        <Animated.View
          style={[
            styles.blueAnimationOverlay,
            {
              opacity: Animated.add(likeAnim, passAnim),
            },
          ]}
        />
      </Animated.View>

      {/* Bottom action buttons */}
      <View style={styles.bottomNav}>
        {/* Pass (X) */}
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [
                {
                  scale: passAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={triggerPass}
            style={styles.iconPressable}
            accessibilityLabel="Pasar"
          >
            <MaterialIcons name="close" size={36} color="#fff" />
          </Pressable>
        </Animated.View>

        {/* View profile */}
        <Pressable
          onPress={() => router.push(`/dashboard/profile/${currentProfile.id}`)}
          style={styles.profilePressable}
        >
          <MaterialIcons name="keyboard-arrow-up" size={28} color="#fff" />
          <Text style={styles.profileText}>Ver perfil</Text>
        </Pressable>

        {/* Like (Heart) */}
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [
                {
                  scale: likeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={triggerLike}
            style={styles.iconPressable}
            accessibilityLabel="Me gusta"
          >
            <MaterialIcons name="favorite" size={32} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  blueAnimationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(91,198,234,0.1)",
    zIndex: 2,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 90,
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  leftSpace: {
    width: 38,
    height: 38,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 170,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 4,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: "#fff",
    opacity: 1,
  },
  dotInactive: {
    backgroundColor: "#fff",
    opacity: 0.4,
  },
  infoContainer: {
    position: "absolute",
    bottom: 110,
    left: 0,
    width: "100%",
    zIndex: 5,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gender: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 8,
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bioExcerpt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomNav: {
    position: "absolute",
    bottom: 30,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 6,
    paddingHorizontal: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconPressable: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePressable: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 80,
  },
  profileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -2,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SwipeScreen;
