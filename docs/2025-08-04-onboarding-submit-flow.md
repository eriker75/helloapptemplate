# Onboarding Submit Flow Integration (2025-08-04)

## Objective
Implement the onboarding submission flow in the frontend, sending onboarding data to the backend when the user completes the location step (final onboarding step).

## Steps

1. **Review Backend Endpoint**
   - Endpoint: `POST /onboarding`
   - DTO: `OnboardingDto` (see backendnestjs/src/users/dto/onboarding.dto.ts)
   - Requires `multipart/form-data` with fields: alias, bio, birthDate, gender (number), interestedIn, address, location (string), isOnboarded, status, isVerified, latitude, longitude, mainImage (file), secondaryImages (files), ageRangePreference.

2. **Review Onboarding Store**
   - File: `src/modules/onboarding/stores/onboarding.store.ts`
   - Collects: name, alias, birth_date, bio, gender, interestedIn, ageRangePreference, mainPicture, secondaryPictures, selectedAddress, selectedLocation.

3. **Repository/Service/Hook Pattern**
   - Pattern is function-based (see chat module).
   - Repository: async function using axios via `api.ts`.
   - Service: function/hook for business logic.
   - Hook: connects service to store.

4. **Implementation Plan**
   - Create `repositories/onboarding.repository.ts` with `submitOnboarding` function.
   - Create `services/onboarding.service.ts` to handle data mapping and call repository.
   - Create `hooks/useSubmitOnboarding.ts` to connect service and store.
   - Integrate hook in location view to trigger onboarding submission after location is set.
   - Ensure correct mapping and transformation of store data to backend DTO, including file handling.
   - Update documentation and devlog.

## Files to Create/Modify

- `src/modules/onboarding/repositories/onboarding.repository.ts`
- `src/modules/onboarding/services/onboarding.service.ts`
- `src/modules/onboarding/hooks/useSubmitOnboarding.ts`
- `src/modules/onboarding/stores/onboarding.store.ts` (if needed)
- `app/onboarding/location.tsx` (or relevant location view)

## Observations

- Must send images as files (not base64/URI) in `multipart/form-data`.
- Map store fields to backend DTO, handling naming and type differences.
- Follow existing patterns for repository/service/hook.
- Update `devlog.md` and reference this file.

---

## 2025-08-04 Bugfix: Content-Type mismatch (multipart != application/x-www-form-urlencoded)

### Problem

When submitting onboarding data with images from the mobile frontend, the backend returned an error:  
`multipart != application/x-www-form-urlencoded`  
Axios/React Native was sending the request with `Content-Type: application/x-www-form-urlencoded` instead of the required `multipart/form-data`.

### Root Cause

- The POST request in `repositories/onboarding.repository.ts` was explicitly setting the header:  
  `{ headers: { "Content-Type": undefined } }`
- Although this is a common workaround, the Axios instance (`config/api.ts`) already has a request interceptor that removes the Content-Type header for FormData, letting Axios set the correct multipart boundary.
- Setting the header explicitly caused Axios to fall back to the wrong Content-Type, resulting in the backend rejecting the request.

### Solution

- Removed the explicit `Content-Type` header from the POST request in `submitOnboarding`.
- Now, the interceptor detects FormData and lets Axios set the correct `multipart/form-data` boundary automatically.
- This resolves the error and allows file uploads to work as expected.

### Files Modified

- `src/modules/onboarding/repositories/onboarding.repository.ts`
- (No backend changes required)

### References

- See also: [devlog.md](./devlog.md) entry for 2025-08-04.
