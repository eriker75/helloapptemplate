# Task: Integrate Google Login with Backend

## Date
2025-08-04

## Context
The app currently mocks Google login and user authentication. The goal is to implement the real Google login flow: after logging in with Google, the frontend should send the Google id token to the backend using axios (via the default api export). This logic should be encapsulated in a repository function, wrapped in a React Query service, and invoked in the `useGoogleLogin` hook.

## Plan
- Create a new repository: `modules/users/repositories/auth.repository.ts` with a function to send the id token to the backend.
- Create a new service: `modules/users/services/auth.service.ts` that wraps the repository function in a React Query mutation.
- Update `modules/users/hooks/useGoogleLogin.ts` to use the new mutation and set the user profile from the backend response.
- Document the task in this file and update `devlog.md` upon completion.

## Files to Modify
- `src/modules/users/repositories/auth.repository.ts` (new)
- `src/modules/users/services/auth.service.ts` (new)
- `src/modules/users/hooks/useGoogleLogin.ts` (edit)
- `docs/devlog.md` (edit)

## Observations
- The backend endpoint is assumed to be `/auth/google` and expects `{ idToken }` in the body.
- The user profile returned by the backend should match the expected structure in the store.
- Error handling and loading states should be managed via React Query.

## Status
Completed
