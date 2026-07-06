-- New BookingStatus values must be committed in their own transaction before
-- 20260703000000_pandit_domain can use REQUESTED as a column default
-- (Postgres 55P04: unsafe use of new value of enum type).
ALTER TYPE "BookingStatus" ADD VALUE 'REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "BookingStatus" ADD VALUE 'REJECTED';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';
