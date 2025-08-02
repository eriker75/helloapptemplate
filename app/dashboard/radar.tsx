import gpsAnimation from "@/assets/animations/gps-signal.json";
import { Spinner } from "@/components/ui";
import { useAuthUserProfile } from "@/src/modules/users/hooks/useAuthUserProfile";
import { useNearbyUsers } from "@/src/modules/users/services/auth-user-profile.service";
import { Redirect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_DISTANCE_KM = 200;

// Función para calcular opacidad basada en distancia
const getOpacityByDistance = (distance: number) => {
  if (distance > 170) {
    return 0.35; // Muy lejos (150-200km)
  } else if (distance > 120) {
    return 0.7; // Lejos (100-150km)
  } else {
    return 1; // Cerca (0-100km)
  }
};

const RadarScreen = () => {
  const {
    userProfile: user,
    isAuthenticated,
    isLoading: isLoadingAuth,
  } = useAuthUserProfile();

  const router = useRouter();

  const [scale, setScale] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { width, height } = Dimensions.get("window");
  const center = { x: width / 2, y: height / 2 };
  const maxRadius = Math.min(width, height) * 0.45;

  // Always call the hook, but only enable it when user?.id is available
  const {
    data: nearbyUsers = [],
    isLoading,
    isError,
  } = useNearbyUsers(user?.id || "");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.numberActiveTouches === 2) {
            setScale((prev) =>
              Math.max(0.5, Math.min(2, prev * (1 + gestureState.dy / 200))
            ));
          }
        },
      }),
    []
  );

  if (!isAuthenticated && !isLoadingAuth) {
    return <Redirect href={"/login"} />;
  }

  // Show loading spinner if user is not ready or still loading
  if (!user?.id || isLoadingAuth) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Spinner />
        <Text>Cargando usuario...</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Spinner />
        <Text>Cargando radar...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !user?.latitude || !user?.longitude) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Error al cargar usuarios cercanos o tu ubicación.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con textos */}
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hola</Text>
          <Text style={styles.question}>¿A quién conocemos hoy?</Text>
          <Text style={styles.nearbyCount}>
            Hay {nearbyUsers.length} personas cerca.
          </Text>
        </View>
      </View>

      {/* Área del radar */}
      <View
        style={styles.radarArea}
        {...panResponder.panHandlers}
        pointerEvents="box-none"
      >
        {/* Animación GPS - IMPORTANTE: pointerEvents="none" */}
        <LottieView
          source={gpsAnimation}
          autoPlay
          loop
          style={{
            position: "absolute",
            width: maxRadius * 4,
            height: maxRadius * 4,
            left: center.x - maxRadius * 2,
            top: center.y - maxRadius * 2,
            zIndex: 1,
          }}
        />

        {/* Círculos del radar - todos con pointerEvents="none" */}
        <View
          pointerEvents="none"
          style={[
            styles.outerRadarCircle,
            {
              width: maxRadius * 4,
              height: maxRadius * 4,
              borderRadius: maxRadius * 2,
              left: center.x - maxRadius * 2,
              top: center.y - maxRadius * 2,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.largeRadarCircle,
            {
              width: maxRadius * 3,
              height: maxRadius * 3,
              borderRadius: maxRadius * 1.5,
              left: center.x - maxRadius * 1.5,
              top: center.y - maxRadius * 1.5,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.radarCircle,
            {
              width: maxRadius * 2,
              height: maxRadius * 2,
              borderRadius: maxRadius,
              left: center.x - maxRadius,
              top: center.y - maxRadius,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.innerRadarCircle,
            {
              width: maxRadius,
              height: maxRadius,
              borderRadius: maxRadius / 2,
              left: center.x - maxRadius / 2,
              top: center.y - maxRadius / 2,
            },
          ]}
        />

        {/* Usuario central */}
        <View
          pointerEvents="none"
          style={[
            styles.centerAvatarContainer,
            { left: center.x - 25, top: center.y - 25 },
          ]}
        >
          <Image
            source={{
              uri: user?.avatar || "https://via.placeholder.com/50",
            }}
            style={styles.centerAvatar}
            resizeMode="cover"
          />
        </View>

        {/* Usuarios cercanos - ÁREA TÁCTIL PRINCIPAL */}
        {nearbyUsers.map((u: any) => {
          if (
            !u.latitude ||
            !u.longitude ||
            !u.avatar_url ||
            typeof u.avatar_url !== "string"
          )
            return null;

          const deltaLat = u.latitude - user.latitude;
          const deltaLng = u.longitude - user.longitude;

          const kmPerDegreeLat = 111;
          const kmPerDegreeLng =
            111 * Math.cos((user.latitude * Math.PI) / 180);

          const dx = deltaLng * kmPerDegreeLng;
          const dy = deltaLat * kmPerDegreeLat;

          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > MAX_DISTANCE_KM) return null;

          // Calcular opacidad basada en distancia
          const opacity = getOpacityByDistance(distance);

          const x = center.x + dx * (maxRadius / MAX_DISTANCE_KM) * scale;
          const y = center.y + dy * (maxRadius / MAX_DISTANCE_KM) * scale;

          const isSelected = selectedUserId === u.user_id;

          return (
            <View
              key={u.user_id}
              style={{
                position: "absolute",
                left: x - 25,
                top: y - 25,
                zIndex: isSelected ? 100 : 10,
              }}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                onPress={() => setSelectedUserId(isSelected ? null : u.user_id)}
                style={[
                  styles.avatarContainer,
                  {
                    borderColor: isSelected ? "#FFD700" : "#fff",
                    borderWidth: isSelected ? 3 : 2,
                    opacity,
                    ...(isSelected && {
                      shadowColor: "#FFD700",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.9,
                      shadowRadius: 12,
                      elevation: 15,
                    }),
                  },
                ]}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: u.avatar_url }}
                  style={styles.avatar}
                  resizeMode="cover"
                />

                {isSelected && <View style={styles.glowEffect} />}
              </TouchableOpacity>

              {isSelected && (
                <View
                  style={{
                    position: "absolute",
                    top: 55,
                    left: -25,
                    backgroundColor: "#fff",
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    borderRadius: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                    zIndex: 150,
                    width: 100,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 12, color: "#333", fontWeight: "bold" }}
                  >
                    {u.username || "Usuario"}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: "#666", marginBottom: 6 }}
                  >
                    {u.distance_km.toFixed(1)} km
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.replace(`/dashboard/profile/${u.user_id}`)}
                    style={{
                      backgroundColor: "#007AFF",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      Ver perfil
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7CDAF9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
    zIndex: 100,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  nearbyCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "bold",
  },
  radarArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  outerRadarCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    zIndex: 1,
  },
  largeRadarCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
  innerRadarCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    zIndex: 2,
  },
  radarCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 2,
  },
  centerAvatarContainer: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 10,
    backgroundColor: "#eee",
  },
  centerAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  glowEffect: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.7)",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
});

export default RadarScreen;
