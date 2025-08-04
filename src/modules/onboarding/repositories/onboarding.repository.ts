import api from "@/src/config/api";
import { AxiosResponse } from "axios";

/**
 * Submits onboarding data to the backend.
 * @param data - Onboarding data, must match backend DTO (see backendnestjs/src/users/dto/onboarding.dto.ts)
 * @returns AxiosResponse with onboarding result
 */
export async function submitOnboarding(data: {
  alias?: string;
  bio?: string;
  birthDate?: string;
  gender?: number;
  interestedIn?: any;
  address?: string;
  lastOnline?: string;
  location?: string;
  isOnboarded?: boolean;
  status?: number;
  isVerified?: boolean;
  latitude?: number;
  longitude?: number;
  mainImage: File;
  secondaryImages?: File[];
  ageRangePreference?: [number, number];
}): Promise<AxiosResponse<any>> {
  const formData = new FormData();

  if (data.alias) formData.append("alias", data.alias);
  if (data.bio) formData.append("bio", data.bio);
  if (data.birthDate) formData.append("birthDate", data.birthDate);
  if (typeof data.gender === "number")
    formData.append("gender", String(data.gender));
  if (data.interestedIn)
    formData.append("interestedIn", JSON.stringify(data.interestedIn));
  if (data.address) formData.append("address", data.address);
  if (data.lastOnline) formData.append("lastOnline", data.lastOnline);
  if (data.location) formData.append("location", data.location);
  if (typeof data.isOnboarded === "boolean")
    formData.append("isOnboarded", String(data.isOnboarded));
  if (typeof data.status === "number")
    formData.append("status", String(data.status));
  if (typeof data.isVerified === "boolean")
    formData.append("isVerified", String(data.isVerified));
  if (typeof data.latitude === "number")
    formData.append("latitude", String(data.latitude));
  if (typeof data.longitude === "number")
    formData.append("longitude", String(data.longitude));
  if (data.ageRangePreference) {
    formData.append(
      "ageRangePreference",
      JSON.stringify(data.ageRangePreference)
    );
  }
  if (data.mainImage) formData.append("mainImage", data.mainImage);
  if (data.secondaryImages && data.secondaryImages.length > 0) {
    data.secondaryImages.forEach((file, idx) => {
      formData.append("secondaryImages", file);
    });
  }

  // Enhanced debug logs for onboarding request
  console.log("[OnboardingRepo] POST /onboarding");
  console.log("[OnboardingRepo] API base URL:", api.defaults.baseURL);

  // Log FormData keys and values/types
  const formKeys: string[] = [];
  const formEntries: any[] = [];
  // @ts-ignore
  for (const pair of formData._parts || []) {
    formKeys.push(pair[0]);
    formEntries.push(pair);
  }
  if (formKeys.length === 0) {
    // fallback for web FormData
    try {
      // @ts-ignore
      for (const pair of formData.entries()) {
        formKeys.push(pair[0]);
        formEntries.push(pair);
      }
    } catch {}
  }
  console.log("[OnboardingRepo] FormData keys:", formKeys);
  formEntries.forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      console.log(`[OnboardingRepo] FormData[${key}] type:`, value.constructor?.name, value);
    } else {
      console.log(`[OnboardingRepo] FormData[${key}] value:`, value);
    }
  });
  // Log FormData type checks
  console.log("[OnboardingRepo] formData instanceof FormData:", formData instanceof FormData);
  console.log("[OnboardingRepo] formData.constructor.name:", formData.constructor?.name);
  if (data.mainImage) {
    console.log("[OnboardingRepo] mainImage type:", data.mainImage?.constructor?.name, data.mainImage);
  }
  if (data.secondaryImages) {
    data.secondaryImages.forEach((img, idx) => {
      console.log(`[OnboardingRepo] secondaryImage[${idx}] type:`, img?.constructor?.name, img);
    });
  }

  // Log Axios config before request
  const axiosConfig = {
    url: "/onboarding",
    method: "post",
    headers: api.defaults.headers,
    baseURL: api.defaults.baseURL,
  };
  console.log("[OnboardingRepo] Axios config before request:", axiosConfig);

  try {
    // WORKAROUND: Usar fetch en vez de Axios para uploads con FormData en React Native
    // Axios+RN puede forzar Content-Type incorrecto, fetch maneja bien el boundary
    // Extra: ensure token is a string
    // Obtener el token actual directamente del store (igual que el interceptor de Axios)
    let token: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAuthUserProfileStore } = require("@/src/modules/users/stores/auth-user-profile.store");
      token = useAuthUserProfileStore.getState().userProfile?.accessToken;
    } catch (e) {
      console.warn("[OnboardingRepo] No se pudo obtener el token del store:", e);
    }
    const fetchHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) fetchHeaders["Authorization"] = `Bearer ${token}`;

    const fetchUrl = (api.defaults.baseURL || "") + "/onboarding";
    console.log("[OnboardingRepo] Enviando con fetch a:", fetchUrl, "headers:", fetchHeaders);

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: fetchHeaders,
      body: formData,
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      console.error("[OnboardingRepo] fetch error response:", response.status, responseData);
      throw new Error(`Onboarding fetch failed: ${response.status} ${JSON.stringify(responseData)}`);
    }
    console.log("[OnboardingRepo] fetch success:", response.status, responseData);
    // Return object matching AxiosResponse shape
    return {
      status: response.status,
      data: responseData,
      statusText: response.statusText,
      headers: Object.fromEntries(
        // Convert fetch Headers to plain object for AxiosResponse compatibility
        typeof response.headers?.forEach === "function"
          ? Array.from(response.headers.entries())
          : []
      ),
      config: {
        url: fetchUrl,
        method: "POST",
        headers: fetchHeaders,
      },
    } as AxiosResponse<any>;
  } catch (error: any) {
    console.error("[OnboardingRepo] Network/API error (fetch):", error);
    throw error;
  }
}
