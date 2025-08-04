import { useMutation } from "@tanstack/react-query";
import { submitOnboarding } from "../repositories/onboarding.repository";
import { OnboardingState } from "../stores/onboarding.store";
import { rnFormDataFile } from "@/src/utils/imageFile";

/**
 * Maps onboarding store state to backend DTO and submits onboarding data.
 * Converts location and image fields as needed.
 * Returns a React Query mutation for onboarding submission.
 */
export function useOnboardingMutation() {
  return useMutation({
    mutationFn: async ({ state }: { state: OnboardingState }) => {
      // Extract images from state
      const mainImageFile = state.mainPicture;
      const secondaryImageFiles = state.secondaryPictures;

      if (!mainImageFile) {
        throw new Error("mainImageFile is required for onboarding submission");
      }
      // Map gender: store uses string ("1", "2", etc.), backend expects number (0, 1, 2)
      let genderNum: number | undefined = undefined;
      if (state.gender === "1") genderNum = 0;
      else if (state.gender === "2") genderNum = 1;
      else if (state.gender) genderNum = 2;

      // Map location
      let latitude: number | undefined = undefined;
      let longitude: number | undefined = undefined;
      let locationStr: string | undefined = undefined;
      if (state.selectedLocation) {
        latitude = state.selectedLocation.latitude;
        longitude = state.selectedLocation.longitude;
        locationStr = JSON.stringify(state.selectedLocation);
      }

      // Map interestedIn (array of strings) to backend expected format (any, likely array)
      const interestedIn = state.interestedIn;

      // Map ageRangePreference
      const ageRangePreference = state.ageRangePreference;

      // Map address
      const address = state.selectedAddress;

      // Map bio, alias, birthDate
      const bio = state.bio;
      const alias = state.alias;
      // birthDate: convertir a ISO 8601 si es posible
      let birthDate: string | undefined = undefined;
      if (state.birth_date) {
        // Si ya es ISO, usar tal cual; si es dd/MM/yyyy, convertir
        if (/^\d{4}-\d{2}-\d{2}/.test(state.birth_date)) {
          birthDate = state.birth_date;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(state.birth_date)) {
          const [day, month, year] = state.birth_date.split("/");
          birthDate = `${year}-${month}-${day}`;
        } else {
          birthDate = state.birth_date;
        }
      }

      // React Native/Expo: always use { uri, name, type } for FormData
      let mainImage: any;
      if (typeof mainImageFile === "string") {
        mainImage = rnFormDataFile(mainImageFile, "main.jpg", "image/jpeg");
      } else if (mainImageFile && typeof mainImageFile === "object" && "uri" in mainImageFile) {
        mainImage = mainImageFile;
      } else {
        throw new Error("mainImageFile must be a URI string or { uri, name, type } object");
      }

      let secondaryImages: any[] = [];
      if (secondaryImageFiles && Array.isArray(secondaryImageFiles)) {
        for (let i = 0; i < secondaryImageFiles.length; i++) {
          const img = secondaryImageFiles[i];
          if (typeof img === "string") {
            secondaryImages.push(rnFormDataFile(img, `secondary_${i}.jpg`, "image/jpeg"));
          } else if (img && typeof img === "object" && "uri" in img) {
            secondaryImages.push(img);
          }
        }
      }

      // Prepare DTO for repository
      const dto = {
        alias,
        bio,
        birthDate,
        gender: genderNum,
        interestedIn,
        address,
        location: locationStr,
        isOnboarded: true,
        latitude,
        longitude,
        mainImage,
        secondaryImages,
        ageRangePreference,
      };

      return submitOnboarding(dto);
    },
  });
}
