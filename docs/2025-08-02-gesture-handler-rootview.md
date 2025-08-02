# 2025-08-02: Fix GestureHandlerRootView Error

## Context

The app was throwing the following error on startup:

> GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See <https://docs.swmansion.com/react-native-gesture-handler/docs/installation> for more details.

## Cause

The root component (`app/_layout.tsx`) was not wrapped in `GestureHandlerRootView`, which is required for `react-native-gesture-handler` to work properly.

## Action Plan

- [x] Update `app/_layout.tsx` to wrap the root with `GestureHandlerRootView` from `react-native-gesture-handler`.
- [ ] Test the app to confirm gestures work and the error is resolved.
- [ ] Update `docs/devlog.md` with a summary of the change.

## Files to Modify

- `app/_layout.tsx` (add import and wrap root)
- `docs/devlog.md` (add summary after fix)

## Observations

This is a standard requirement for React Native apps using gesture handler. No other files are expected to be affected.
