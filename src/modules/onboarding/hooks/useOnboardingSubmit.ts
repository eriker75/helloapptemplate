import { useOnboardingStore } from "../stores/onboarding.store";
import { useOnboardingMutation } from "../services/onboarding.service";

/**
 * Hook to submit onboarding data to the backend using React Query.
 * Connects the onboarding store state with the onboarding mutation.
 *
 * Usage:
 *   const { submitOnboarding, isLoading, error, data } = useOnboardingSubmit();
 *   submitOnboarding(mainImage, secondaryImages);
 */
export function useOnboardingSubmit() {
  const onboardingState = useOnboardingStore();
  const resetOnboarding = useOnboardingStore((state) => state.reset);

  const mutation = useOnboardingMutation();

  // Wrap mutateAsync to add onSuccess logic
  const submitOnboarding = async () => {
    const result = await mutation.mutateAsync({
      state: onboardingState,
    });
    // If mutation was successful, reset onboarding state
    resetOnboarding();
    return result;
  };

  return {
    submitOnboarding,
    ...mutation,
  };
}
