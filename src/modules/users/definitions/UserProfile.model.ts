export interface UserProfile {
  // User Data
  id: string; // UUID de user
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;

  // Profile Data
  profile_id?: string; // UUID profiles.id
  alias?: string | null;
  bio?: string | null;
  birth_date?: string | null; // timestamp
  gender?: number | null; // smallint 0 -> male, 1 -> woman
  interested_in?: string[] | null; // jsonb -> ['men','women'] or ['woman']
  avatar?: string | null; // URL del avatar
  address?: string | null;
  preferences?: string | null; // jsonb -> '["tall","ebony"]' (como string JSON)
  last_online?: string | null; // timestamp
  location?: string | null; // Geographic information
  latitude: number;
  longitude: number;
  is_onboarded?: number | null; // 0 NO ONBOARDED, 1 ONBOARDED
  status?: number | null; // 1 ACTIVE, 0 INACTIVE
  is_verified?: number | null; // 1 verified, 0 NOT verified
  created_at: string; // Profile Creation Date
  updated_at?: string | null; // Profile Last Update Date
  ageRangePreference?: [number, number] | null;
}
