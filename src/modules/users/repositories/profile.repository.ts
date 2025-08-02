/**
 * MOCKED PROFILE REPOSITORY (typed, async)
 * All Supabase logic has been removed. This file now uses in-memory mock data.
 * Types are based on db.md DDL. All functions simulate async requests.
 */

import { UpdateProfileData } from "../dtos/update-profile.dto";

// --- Types based on db.md ---
export interface Profile {
  id: string; // uuid
  created_at: string; // ISO string
  updated_at: string | null;
  alias: string | null;
  bio: string | null;
  birth_date: string | null;
  gender: number | null;
  interested_in: any | null; // jsonb
  avatar: string | null;
  address: string | null;
  preferences: any | null; // jsonb
  last_online: string | null;
  location: string | null;
  user_id: string | null;
  is_onboarded: number | null;
  status: number | null;
  is_verified: number | null;
  latitude: number | null;
  longitude: number | null;
}

// --- Mock Data Store ---
let mockProfiles: Profile[] = [
  {
    id: "1",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "alice123",
    bio: "Loves hiking and coffee.",
    birth_date: "1995-06-15",
    gender: 0,
    interested_in: "1",
    avatar: "",
    address: "123 Main St",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "1",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.5,
    longitude: -66.9,
  },
  {
    id: "2",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "bobster",
    bio: "React Native dev.",
    birth_date: "1992-03-22",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "456 Side Ave",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "2",
    is_onboarded: 1,
    status: 1,
    is_verified: 0,
    latitude: 10.7,
    longitude: -66.7,
  },
  {
    id: "3",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "carla_dev",
    bio: "Fullstack dev and runner.",
    birth_date: "1990-11-10",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "789 North Ave",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "3",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.3,
    longitude: -67.1,
  },
  {
    id: "4",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "daniel_music",
    bio: "Guitarist and teacher.",
    birth_date: "1988-04-05",
    gender: 0,
    interested_in: "1",
    avatar: "",
    address: "1010 South Blvd",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "4",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.6,
    longitude: -67.05,
  },
  {
    id: "5",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "eva_art",
    bio: "Painter and traveler.",
    birth_date: "1997-08-19",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "2020 Art St",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "5",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.4,
    longitude: -66.75,
  },
  {
    id: "6",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "frankie",
    bio: "Cyclist and foodie.",
    birth_date: "1993-02-14",
    gender: 0,
    interested_in: "1",
    avatar: "",
    address: "3030 Cycle Rd",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "6",
    is_onboarded: 1,
    status: 1,
    is_verified: 0,
    latitude: 10.2,
    longitude: -66.95,
  },
  {
    id: "7",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "gaby_writer",
    bio: "Writer and poet.",
    birth_date: "1991-12-01",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "4040 Book Ln",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "7",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.8,
    longitude: -66.85,
  },
  {
    id: "8",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "hector_surf",
    bio: "Surfer and barista.",
    birth_date: "1996-06-30",
    gender: 0,
    interested_in: "1",
    avatar: "",
    address: "5050 Beach Dr",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "8",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.55,
    longitude: -67.08,
  },
  {
    id: "9",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "ines_chef",
    bio: "Chef and food blogger.",
    birth_date: "1994-09-23",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "6060 Food Ct",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "9",
    is_onboarded: 1,
    status: 1,
    is_verified: 0,
    latitude: 10.65,
    longitude: -66.95,
  },
  {
    id: "10",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "juan_pilot",
    bio: "Pilot and photographer.",
    birth_date: "1989-07-12",
    gender: 0,
    interested_in: "1",
    avatar: "",
    address: "7070 Sky Ave",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "10",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.35,
    longitude: -66.8,
  },
  {
    id: "11",
    created_at: new Date().toISOString(),
    updated_at: null,
    alias: "karla_dance",
    bio: "Dancer and yoga teacher.",
    birth_date: "1998-03-17",
    gender: 1,
    interested_in: "0",
    avatar: "",
    address: "8080 Dance St",
    preferences: null,
    last_online: null,
    location: null,
    user_id: "11",
    is_onboarded: 1,
    status: 1,
    is_verified: 1,
    latitude: 10.45,
    longitude: -67.0,
  },
];

// --- Helper: Haversine distance ---
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simulate async/latency
function asyncDelay<T>(result: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

// Obtener usuarios cercanos usando mock data
export async function getNearbyUsers(
  userId: string,
  radiusKm: number = 200
): Promise<Profile[]> {
  const currentUser = mockProfiles.find((p) => p.user_id === userId);
  if (
    !currentUser ||
    currentUser.latitude == null ||
    currentUser.longitude == null
  ) {
    return asyncDelay([]);
  }
  const nearby = mockProfiles.filter((p) => {
    if (p.user_id === userId || p.latitude == null || p.longitude == null)
      return false;
    const dist = haversine(
      currentUser.latitude!,
      currentUser.longitude!,
      p.latitude,
      p.longitude
    );
    return dist <= radiusKm;
  });
  return asyncDelay(nearby);
}

// Obtener un perfil de usuario por ID
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const profile = mockProfiles.find((p) => p.user_id === userId);
  return asyncDelay(profile ?? null);
}

// Actualizar perfil del usuario
export async function updateProfile(
  userId: string,
  updateData: Partial<UpdateProfileData>
): Promise<boolean> {
  const idx = mockProfiles.findIndex((p) => p.user_id === userId);
  if (idx === -1) {
    return asyncDelay(false);
  }
  // interested_in: always string or null
  const { interested_in, ...rest } = updateData;
  let interestedInStr: string | null | undefined = undefined;
  if (interested_in !== undefined) {
    interestedInStr = Array.isArray(interested_in)
      ? (interested_in as string[]).join(",")
      : String(interested_in);
  }
  mockProfiles[idx] = {
    ...mockProfiles[idx],
    ...rest,
    ...(interestedInStr !== undefined
      ? { interested_in: interestedInStr }
      : {}),
    updated_at: new Date().toISOString(),
  };
  return asyncDelay(true);
}

// Procesar onboarding y actualizar perfil
export async function onboardUser(
  userId: string,
  state: any
): Promise<boolean> {
  // Asegurar tipo literal para gender
  const gender: 0 | 1 | 2 =
    state.gender === "1" ? 0 : state.gender === "2" ? 1 : 2;

  const updateData: Partial<UpdateProfileData> = {
    name: state.name,
    alias: state.alias,
    bio: state.bio,
    birth_date: state.birth_date,
    gender,
    interested_in: state.interestedIn,
    avatar: state.mainPicture,
    address: state.selectedAddress,
    location: state.selectedLocation
      ? JSON.stringify(state.selectedLocation)
      : null,
    latitude: state.selectedLocation?.latitude ?? null,
    longitude: state.selectedLocation?.longitude ?? null,
    is_onboarded: 1,
  };

  return updateProfile(userId, updateData);
}

// Obtener un perfil de usuario por ID de perfil (uuid)
export async function getProfileById(id: string): Promise<Profile | null> {
  const profile = mockProfiles.find((p) => p.id === id);
  return asyncDelay(profile ?? null);
}
