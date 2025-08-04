import { useState } from "react";
import { useOnboardingStore } from "../stores/onboarding.store";
import { submitOnboardingService } from "../services/onboarding.service";

/**
 * Hook to submit onboarding data to the backend.
 * Exposes loading, error, and submit function.
 *
 * @returns { submitOnboarding, loading, error }
 */
export function useSubmitOnboarding() {
  const onboardingState = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submits onboarding data.
   * @param mainImageFile - File object for main image (required)
   * @param secondaryImageFiles - Array of File objects for secondary images (optional)
   */
  const submitOnboarding = async (
    mainImageFile: File,
    secondaryImageFiles?: File[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      await submitOnboardingService(
        onboardingState,
        mainImageFile,
        secondaryImageFiles
      );
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error submitting onboarding");
      setLoading(false);
      return false;
    }
  };

  return {
    submitOnboarding,
    loading,
    error,
  };
}
