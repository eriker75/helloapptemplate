import { useAuthUserProfile } from "@/src/modules/users/hooks/useAuthUserProfile";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { userProfile, isAuthenticated, isLoading, error } =
    useAuthUserProfile();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.message}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          Ocurrió un error: {error.message || "desconocido"}
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    if (userProfile?.is_onboarded) {
      return <Redirect href="/dashboard/radar" />;
    } else {
      return <Redirect href="/onboarding" />;
    }
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
