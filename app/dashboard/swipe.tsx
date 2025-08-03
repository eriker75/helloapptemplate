"use client";

import { Text } from "@/components/ui";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { mockProfiles } from "@/src/modules/users/repositories/profile.repository";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Reanimated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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

  // Reanimated values for Like/Pass button animation
  const likeAnim = useSharedValue(0);
  const passAnim = useSharedValue(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Get current profile and its images
  const currentProfile = mockProfiles[profileIndex % mockProfiles.length];
  const images =
    Array.isArray(currentProfile.photos) && currentProfile.photos.length > 0
      ? currentProfile.photos
      : [];

  // Handle scroll events to update photo index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setPhotoIndex(currentIndex);
  };

  // Animations for like/pass
  const triggerLike = () => {
    likeAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        likeAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            runOnJS(goNextProfile)();
          }
        });
      }
    });
  };

  const triggerPass = () => {
    passAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        passAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            runOnJS(goNextProfile)();
          }
        });
      }
    });
  };

  // Go to next profile and reset photo index
  const goNextProfile = () => {
    setProfileIndex((prev) => (prev + 1) % mockProfiles.length);
    setPhotoIndex(0);
    // Reset scroll position
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: false });
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
      <View style={styles.cardContainer}>
        {/* Image ScrollView - Main scrollable content */}
        {images.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={requireImage(imageUri)}
                  style={styles.image}
                  resizeMode="cover"
                />
                {/* Overlay per image */}
                <View style={styles.gradientOverlay} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/avatar-placeholder.png")}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.gradientOverlay} />
          </View>
        )}

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

        {/* Dots indicator */}
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
      </View>

      {/* Bottom action buttons */}
      <View style={styles.bottomNav}>
        {/* Pass (X) */}
        <Reanimated.View
          style={[
            styles.actionButton,
            useAnimatedStyle(() => ({
              transform: [
                {
                  scale: interpolate(passAnim.value, [0, 1], [1, 1.1]),
                },
              ],
            })),
          ]}
        >
          <Pressable
            onPress={triggerPass}
            style={styles.iconPressable}
            accessibilityLabel="Pasar"
          >
            <ReanimatedIcon
              name="close"
              size={36}
              animatedColor={passAnim}
              baseColor="#fff"
              activeColor="#5BC6EA"
            />
          </Pressable>
        </Reanimated.View>

        {/* View profile */}
        <Pressable
          onPress={() => router.push(`/dashboard/profile/${currentProfile.id}`)}
          style={styles.profilePressable}
        >
          <MaterialIcons name="keyboard-arrow-up" size={28} color="#fff" />
          <Text style={styles.profileText}>Ver perfil</Text>
        </Pressable>

        {/* Like (Heart) */}
        <Reanimated.View
          style={[
            styles.actionButton,
            useAnimatedStyle(() => ({
              transform: [
                {
                  scale: interpolate(likeAnim.value, [0, 1], [1, 1.1]),
                },
              ],
            })),
          ]}
        >
          <Pressable
            onPress={triggerLike}
            style={styles.iconPressable}
            accessibilityLabel="Me gusta"
          >
            <ReanimatedIcon
              name="favorite"
              size={32}
              animatedColor={likeAnim}
              baseColor="#fff"
              activeColor="#5BC6EA"
            />
          </Pressable>
        </Reanimated.View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Animated MaterialIcons with color interpolation using animatedProps.
 */
const AnimatedMaterialIcons = Reanimated.createAnimatedComponent(MaterialIcons);

const ReanimatedIcon = ({
  name,
  size,
  animatedColor,
  baseColor,
  activeColor,
}: {
  name: string;
  size: number;
  animatedColor: any; // SharedValue<number>
  baseColor: string;
  activeColor: string;
}) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      color: interpolateColor(
        animatedColor.value,
        [0, 1],
        [baseColor, activeColor]
      ),
    };
  });

  // @ts-ignore
  return (
    <AnimatedMaterialIcons
      name={name as any}
      size={size}
      animatedProps={animatedProps}
      color={baseColor}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  scrollView: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Base layer for scrolling
  },
  scrollViewContent: {
    // ScrollView content doesn't need specific styling
  },
  imageWrapper: {
    width: width,
    height: height,
    position: "relative",
  },
  image: {
    width: width,
    height: height,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 90,
    zIndex: 10, // Higher than scroll
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 30,
    pointerEvents: "box-none", // Allow touches to pass through empty areas
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
    top: 120, // Below the top bar
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5, // Above images, below top bar
    paddingHorizontal: 20,
    pointerEvents: "none", // Don't block scroll touches
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
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
    zIndex: 5, // Above images, below buttons
    alignItems: "center",
    paddingHorizontal: 24,
    pointerEvents: "none", // Don't block scroll touches
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
    zIndex: 10, // Highest priority for buttons
    paddingHorizontal: 32,
    pointerEvents: "box-none", // Allow touches to pass through empty areas
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
