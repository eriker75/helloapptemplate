# Supabase Logic Removal & Mock Data Migration Plan

**Date:** 2025-08-02

## Objective

Progressively remove all Supabase logic from the React Native app, replacing it with mock/demo data while preserving the current UI/UX. The app must remain functional at all times. This will prepare the codebase for later integration with a NestJS backend.

## Action Plan

1. **Establish Documentation**
   - Create `docs/` directory, `readme.md`, and `docs/devlog.md` if missing.
   - Document this migration plan.

2. **Audit Supabase Usage**
   - Identify all files and modules using Supabase (services, hooks, repositories, etc.).
   - List all affected screens/components.

3. **Progressive Migration**
   - For each feature/view:
     - Replace Supabase calls with mock data providers.
     - Ensure UI remains unchanged.
     - Test for regressions.

4. **Prepare for Backend Integration**
   - Structure mock data access to allow easy replacement with API calls to NestJS later.

5. **Documentation Updates**
   - Update `docs/devlog.md` and `readme.md` as changes are made.

## Files to Modify

- All files using Supabase logic (to be identified in step 2).
- Documentation files: `readme.md`, `docs/devlog.md`, and this plan.

## Observations

- No prior documentation was found; this migration will establish the required docs.
- The migration will be tracked in this file and summarized in `docs/devlog.md`.
