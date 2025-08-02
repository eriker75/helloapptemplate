# 2025-08-02 Swipe Screen Mockup

## Objective

Implement the layout for the "swipe" screen as described in the provided UI reference. The screen should feature:

- A carousel of 4 images (from `assets/images/vertical/istockphoto1.jpg` to `istockphoto4.jpg`), with indicator dots overlayed at the bottom.
- Dots: 4 total, the active one is a lighter gray, others are visible but less prominent, all above the image in z-index.
- Overlayed user info: name (alias), gender (1 = Hombre, 2 = Mujer), and a larger excerpt of the user's bio (with ellipsis).
- Navigation: "Anterior" and "Siguiente" buttons at the bottom corners, and a central "Ver perfil ¡Hola!" button that would navigate to the profile by id.
- Top bar: "Hola" centered, a circular back arrow button on the left, and a circular avatar (our user) on the right, which links to `/dashboard/profile/index.tsx`.

## Files to Modify

- `app/dashboard/swipe.tsx` (main implementation)
- Uses assets from `assets/images/vertical/istockphoto1.jpg` ... `istockphoto4.jpg`
- Leverages UI components from `components/ui/button/` and `components/ui/avatar/`

## Observations

- The carousel will use mock data for now; in the future, images and user info will come from an API.
- All navigation actions can be stubbed or left as TODOs for now.
- The layout should use absolute positioning and zIndex to layer elements as in the reference.
- The avatar and buttons should use the project's UI kit for consistency.
- The excerpt should be truncated with ellipsis if too long.
- The design should be responsive and visually match the provided screenshot as closely as possible.

## Next Steps

1. Implement the layout in `app/dashboard/swipe.tsx`.
2. Update `docs/devlog.md` with a summary of the changes after completion.
