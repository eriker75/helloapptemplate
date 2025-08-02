import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import { useAuthUserProfile } from "@/src/modules/users/hooks/useAuthUserProfile";
import { useUpdateProfile } from "@/src/modules/users/services/auth-user-profile.service";
import { useAuthUserProfileStore } from "@/src/modules/users/stores/auth-user-profile.store";
import * as Location from "expo-location";
import { useCallback } from "react";

/**
 * Returns a function that, when called, checks location permission,
 * requests if needed, and updates the user location in DB and store if changed.
 */
export function useUpdateUserLocation() {
  const {
    userProfile: user,
    isAuthenticated,
    isLoading: isLoadingAuth,
  } = useAuthUserProfile();

  const updateUserProfileStore = useAuthUserProfileStore((state) => state.updateUserProfile);
  const setCurrentLocation = useAuthUserProfileStore((state) => state.setCurrentLocation);
  const checkLocationPermission = useAuthUserProfileStore((state) => state.checkLocationPermission);
  const requestLocationPermission = useAuthUserProfileStore((state) => state.requestLocationPermission);

  const updateProfileMutation = useUpdateProfile(user?.id || "");

  const updateLocation = useCallback(async () => {
    console.log("[useUpdateUserLocation] updateLocation called");
    console.log("[useUpdateUserLocation] user:", user);
    console.log("[useUpdateUserLocation] isAuthenticated:", isAuthenticated, "isLoadingAuth:", isLoadingAuth);

    if (!isAuthenticated || !user?.id || isLoadingAuth) {
      console.log("[useUpdateUserLocation] Not authenticated or user not loaded, aborting");
      return;
    }
    try {
      let permissionStatus = await checkLocationPermission();
      console.log("[useUpdateUserLocation] checkLocationPermission:", permissionStatus);
      if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
        permissionStatus = await requestLocationPermission();
        console.log("[useUpdateUserLocation] requestLocationPermission:", permissionStatus);
      }
      if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
        console.log("[useUpdateUserLocation] Permission not granted, aborting");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log("[useUpdateUserLocation] Device location:", latitude, longitude);

      const prevLat = user.latitude;
      const prevLng = user.longitude;
      // Siempre actualiza la ubicación en la base de datos y el store si tienes permisos y puedes obtener la ubicación
      console.log("[useUpdateUserLocation] Forzando actualización de ubicación en DB y store con datos del dispositivo...");
      await updateProfileMutation.mutateAsync({
        latitude,
        longitude,
        location: JSON.stringify({ latitude, longitude }),
      });

      console.log("[useUpdateUserLocation] Actualizando user profile store...");
      updateUserProfileStore({
        latitude,
        longitude,
        location: JSON.stringify({ latitude, longitude }),
      });
      setCurrentLocation({ latitude, longitude });
      console.log("[useUpdateUserLocation] Location updated in store y DB");
    } catch (error) {
      console.error("[useUpdateUserLocation] Error updating location:", error);
    }
  }, [
    isAuthenticated,
    user?.id,
    isLoadingAuth,
    user?.latitude,
    user?.longitude,
    checkLocationPermission,
    requestLocationPermission,
    updateProfileMutation,
    updateUserProfileStore,
    setCurrentLocation,
  ]);

  return updateLocation;
}
