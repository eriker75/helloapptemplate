# Task: Replace "Hola" Button with Logout in Profile Screen

## Date
2025-08-04

## Context
The profile screen (`appmobile/app/dashboard/profile/index.tsx`) currently displays a "¡Hola, Alex! 👋" button at the bottom, which is not meaningful for a user's own profile. The correct behavior is to provide a "Cerrar sesión" (logout) button that allows the user to log out of the app.

## Plan
- Replace the "hola" button with a "Cerrar sesión" button.
- On press, the button should:
  1. Call the `clearAuthData` method from the `useAuthUserProfileStore` (Zustand store) to clear the user session.
  2. Redirect the user to the `/login` screen using the router from `expo-router`.
- Ensure the button uses the same style as the current bottom button for UI consistency.

## Files to Modify
- `appmobile/app/dashboard/profile/index.tsx` (replace button, add logout logic)

## Observations
- The app uses mock data and Zustand for user state.
- No existing logout button or logic was present in the profile screen.
- The `/login` screen is the correct destination after logout.

## Status
Completed
