export interface UpdateProfileData {
  name: string;
  alias: string;
  bio: string;
  birth_date: string;
  gender: 0 | 1 | 2; // 0: male, 1: woman, 2: other
  interested_in: string[];
  avatar: string;
  address: string;
  location: string | null; // stringified JSON
  latitude: number | null;
  longitude: number | null;
  is_onboarded: number; // 0 o 1
}
