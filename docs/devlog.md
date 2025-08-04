# Development Log

## 2025-08-02
- Replaced the "¡Hola, Alex! 👋" button in `app/dashboard/profile/index.tsx` with a "Cerrar sesión" button.
  - The new button calls `clearAuthData` from the user profile store and redirects to `/login` using the router.
  - Task documented and completed in `docs/2025-08-04-profile-logout-button.md`.

- Project documentation established: `readme.md`, `docs/2025-08-02-supabase-migration.md`, and this devlog.
- Migration plan to remove Supabase logic and use mock/demo data created.
- Next: Audit codebase for Supabase usage and begin progressive migration.

## 2025-08-02 (cont.)

- Completed full migration from Supabase to mock/demo data:
  - All Supabase logic removed from users, chat, and storage modules. All data access now uses in-memory mock data providers.
  - All Supabase dependencies and configuration removed from `package.json`, `.env`, `app.json`, and the codebase.
  - Supabase-related seeders and config directories deleted.
  - Onboarding and all screens now use only mock data, preserving the original UI/UX.
- The project is now ready for progressive integration with a new NestJS backend, using the mock data layer as a drop-in replacement for future API calls.

## 2025-08-02 (Swipe Screen Mockup)

- Created `docs/2025-08-02-swipe-mockup.md` to document the plan and requirements for the new swipe screen.
- Implemented the full layout for the swipe screen in `app/dashboard/swipe.tsx`:
  - Carousel of 4 images with overlayed indicator dots (active/inactive styling, z-indexed above image).
  - User info (alias, age, gender, bio excerpt) overlayed above the image, styled and truncated as in the reference.
  - Navigation: "Anterior" and "Siguiente" buttons, and a central "Ver perfil ¡Hola!" button (links to profile by id).
  - Top bar with "Hola", a circular back button, and a circular avatar button linking to the main profile.
  - Used only mock data and local assets; all navigation actions are stubbed or routed locally.
  - Used project UI kit components for buttons and avatar for consistency.
- The screen visually matches the provided reference and is ready for future API integration.

## 2025-08-02 (GestureHandlerRootView Fix)

- Fixed error: "GestureDetector must be used as a descendant of GestureHandlerRootView."
- Updated `app/_layout.tsx` to wrap the app in `GestureHandlerRootView` from `react-native-gesture-handler` as required by the library.
- See `docs/2025-08-02-gesture-handler-rootview.md` for details and rationale.
## 2025-08-04 (Google Login Integration)

- Implemented real Google login flow:
  - Created `src/modules/users/repositories/auth.repository.ts` to send Google id token to backend.
  - Created `src/modules/users/services/auth.service.ts` with React Query mutation for Google login.
  - Updated `src/modules/users/hooks/useGoogleLogin.ts` to use backend and set user profile from response.
  - Added task doc: `docs/2025-08-04-google-login-integration.md`.
- The app now authenticates users via Google and backend, replacing the previous mock/demo logic.

## 2025-08-04 (Range Slider for Onboarding)

- Created a reusable double-thumb range slider component for age selection in onboarding:
  - File: `components/elements/CustomInputRangeSlider.tsx`
  - Uses `react-native-range-slider-expo` for double-thumb support and styled to match the onboarding design.
  - Stateless, receives `[number, number]` value and `onChange` handler as props.
  - Fully documented and reusable for other range selection needs.
- Documented the task and plan in `docs/2025-08-04-range-slider-onboarding.md`.
- Ready for integration in the onboarding form (`basicinfo.tsx`).
