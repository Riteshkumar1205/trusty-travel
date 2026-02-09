

# Comprehensive Security Review

## Summary

The security scan found **8 findings** across three scanners. Here is the full breakdown organized by severity.

---

## CRITICAL / ERROR-Level Issues (4)

### 1. Delivery OTPs Exposed in Plain Text
**Risk**: OTP codes for pickup and delivery are stored as plain text and are accessible to delivery participants via client-side queries. An attacker who is a delivery participant could read the OTP directly from the database, bypassing the intended verification flow.

**Fix**:
- Remove `pickup_otp` and `delivery_otp` from all client-side SELECT queries in `useTravelerData.ts` and `useSenderData.ts`
- Hash OTPs in the database using `pgcrypto` so they can't be read even if accessed
- Update the `verify-otp` Edge Function to hash the user input before comparing
- Add OTP expiration columns (`pickup_otp_expires_at`, `delivery_otp_expires_at`)

### 2. Parcel Contact Information Visible to All Users
**Risk**: The `parcels` table has a SELECT policy of `true` (viewable by everyone), exposing `pickup_contact` and `drop_contact` fields (phone numbers) to any authenticated user.

**Fix**:
- Update the `parcels_public` view to exclude `pickup_contact` and `drop_contact`
- Change the `parcels` table SELECT RLS policy so only the parcel owner and matched delivery participants can see contact fields
- Alternatively, create a security definer function that redacts contacts for non-owners

### 3. User Phone Numbers Exposed via Profile RLS
**Risk**: The `profiles` table SELECT policy allows anyone with a journey or delivery relationship to see full profile data including phone numbers. Since journeys are public, anyone can see journey creators' phone numbers.

**Fix**:
- Update the `profiles_public` view to exclude `phone` field
- Modify the profiles RLS policy to be more restrictive, or use a security definer function that only returns phone numbers to active delivery participants

### 4. Public Profile View Has No Access Controls
**Risk**: The `profiles_public` table/view has zero RLS policies and contains phone numbers. Anyone can query it.

**Fix**:
- Enable RLS on `profiles_public` or recreate the view to exclude the `phone` column entirely

---

## WARNING-Level Issues (3)

### 5. Leaked Password Protection Disabled
**Risk**: Users can sign up with passwords known to have been compromised in data breaches.

**Fix**: This is a platform setting. Enable it from Lovable Cloud settings (cannot be done via code).

### 6. Recipient Data Exposed Before Delivery Confirmation
**Risk**: `recipient_phone` and `recipient_name` in the `deliveries` table are accessible to both parties before pickup is confirmed.

**Fix**: Consider restricting visibility of recipient fields until status = 'picked-up' using a column-level security definer function or a computed view.

### 7. Public Views (`parcels_public`, `journeys_public`) May Bypass Security
**Risk**: These views/tables have no RLS policies and may expose fields that are protected in the main tables (like `pnr_number`, `vehicle_number`, contacts).

**Fix**: Recreate these views to exclude sensitive columns (`pnr_number`, `vehicle_number`, `pickup_contact`, `drop_contact`, `phone`).

---

## INFO-Level (Already Addressed)

- **Security Definer Functions**: Properly configured with `SET search_path` and `auth.uid()` validation. No action needed.
- **Firebase Demo Fallbacks**: Acceptable for optional features that gracefully degrade.

---

## Additional Findings from Code Review

### 8. No Input Sanitization on Contact Modal
The `ContactModal.tsx` passes phone numbers directly into `tel:` and `wa.me` URLs without validation. A malicious phone number stored in the database could lead to unexpected behavior.

**Fix**: Validate phone number format before constructing URLs.

### 9. Signup Form Missing Name/Phone Validation
The signup form validates email and password with Zod but does not validate `fullName` or `phone` fields, allowing injection of arbitrary data into user metadata.

**Fix**: Add Zod validation for `fullName` (max length, character restrictions) and `phone` (format validation).

---

## Implementation Plan

### Phase 1: Database Hardening (Highest Priority)

1. **Secure the public views** - Recreate `profiles_public`, `parcels_public`, and `journeys_public` views to exclude sensitive columns:
   - `profiles_public`: Remove `phone`
   - `parcels_public`: Remove `pickup_contact`, `drop_contact`
   - `journeys_public`: Remove `pnr_number`, `vehicle_number`

2. **Hash OTPs** - Add `pgcrypto` extension, update OTP storage to use SHA-256 hashes, add expiration columns

3. **Remove OTPs from client queries** - Update `useTravelerData.ts` and `useSenderData.ts` to stop selecting `pickup_otp` and `delivery_otp`

### Phase 2: Edge Function Hardening

4. **Update `verify-otp` Edge Function** to:
   - Hash the entered OTP before comparing against stored hash
   - Check OTP expiration
   - Add basic rate limiting (track attempts in a `otp_attempts` table)

### Phase 3: Client-Side Validation

5. **Add Zod validation** for signup name and phone fields
6. **Add phone number format validation** in `ContactModal.tsx` before constructing URLs

### Technical Details

**Migration SQL for Phase 1** (views):
```text
-- Drop and recreate views without sensitive columns
DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public AS
  SELECT id, user_id, full_name, avatar_url, verification_status,
         trust_score, total_deliveries, successful_deliveries,
         created_at, updated_at
  FROM profiles;

DROP VIEW IF EXISTS parcels_public;
CREATE VIEW parcels_public AS
  SELECT id, user_id, title, description, pickup_city,
         pickup_location, drop_city, drop_location, weight,
         dimensions, category, urgency, budget, preferred_modes,
         urgent_delivery, status, created_at, updated_at
  FROM parcels;

DROP VIEW IF EXISTS journeys_public;
CREATE VIEW journeys_public AS
  SELECT id, user_id, source_city, source_location,
         destination_city, destination_location, transport_mode,
         departure_date, departure_time, arrival_date, arrival_time,
         total_capacity, available_capacity, price_per_kg,
         max_parcel_weight, accepted_parcel_types, notes,
         current_lat, current_lng, status, created_at, updated_at
  FROM journeys;
```

**Migration SQL for OTP hashing**:
```text
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE deliveries ADD COLUMN pickup_otp_expires_at timestamptz;
ALTER TABLE deliveries ADD COLUMN delivery_otp_expires_at timestamptz;
```

**Files to modify**:
- `src/hooks/useTravelerData.ts` - Remove OTP fields from queries
- `src/hooks/useSenderData.ts` - Remove OTP fields from queries
- `supabase/functions/verify-otp/index.ts` - Add hashing, expiration checks, rate limiting
- `src/pages/Auth.tsx` - Add name/phone Zod validation
- `src/components/communication/ContactModal.tsx` - Add phone validation

