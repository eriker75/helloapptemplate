# Profile Redesign Task (2025-08-04)

## Summary

Redesign the profile view (`appmobile/app/dashboard/profile/index.tsx`) to match the new design provided in the reference image. The new view should include:
- A large carousel at the top displaying secondary images, with left/right navigation arrows (Expo icons).
- The main profile image (avatar) as a circular, editable photo overlapping the carousel.
- Profile information (name, age, gender, description) loaded from the user's profile.
- An "Editar" button for profile editing.
- The ability to edit the main profile image (avatar).

## Files to Modify

- `appmobile/app/dashboard/profile/index.tsx` (main view logic and layout)
- `appmobile/src/modules/users/definitions/UserProfile.model.ts` (add `secondary_images?: string[]`)
- (If needed) New or updated components for carousel and image editing

## Action Plan

1. **Extend UserProfile Model**  
   Add a `secondary_images?: string[]` field to support multiple secondary images for the carousel.

2. **Carousel Implementation**  
   - Implement a horizontal carousel at the top of the profile view using `ScrollView` or `FlatList`.
   - Use Expo vector icons for left/right navigation arrows.
   - Display images from `userProfile.secondary_images`.

3. **Editable Avatar**  
   - Use the existing `Avatar` component for the main profile image.
   - Overlay an edit (pencil) icon using Expo icons.
   - On press, allow the user to pick a new image (reuse or extend existing image picker logic).

4. **Profile Info and Edit Button**  
   - Load and display name, age (calculated from `birth_date`), gender, and description from `userProfile`.
   - Keep the "Editar" button for profile editing.

5. **Data Loading and Updates**  
   - Ensure all profile data is loaded from the Zustand store.
   - Update the store and backend as needed when images or info are edited.

6. **Testing and Documentation**  
   - Test the new view for correct layout and functionality.
   - Update this file and `devlog.md` with a summary of changes and decisions.

## Observations

- The current model does not support secondary images; this will be added.
- No ready-made carousel component exists; a simple custom implementation will be used.
- Existing UI components (`Avatar`, `Button`, etc.) will be reused for consistency.
- Image editing logic for the avatar will be reused/extended for secondary images if needed.

## Open Questions / Assumptions

- Assumes secondary images are stored as URLs in the profile.
- Assumes image upload/edit logic is similar for avatar and secondary images.
- If backend changes are required for secondary images, this will be coordinated separately.
