-- Fix DonationRequests table to add missing created_by column
-- This script will safely add the column if it doesn't exist

-- Check if created_by column exists and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donationrequests' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE DonationRequests ADD COLUMN created_by VARCHAR(25) REFERENCES Users(user_id);
        RAISE NOTICE 'Added created_by column to DonationRequests table';
    ELSE
        RAISE NOTICE 'created_by column already exists in DonationRequests table';
    END IF;
END $$;

-- Check if updated_by column exists and add it if missing  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donationrequests' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE DonationRequests ADD COLUMN updated_by VARCHAR(25) REFERENCES Users(user_id);
        RAISE NOTICE 'Added updated_by column to DonationRequests table';
    ELSE
        RAISE NOTICE 'updated_by column already exists in DonationRequests table';
    END IF;
END $$;

-- Also make appointment_id nullable for walk-in donations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donationrequests' 
        AND column_name = 'appointment_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE DonationRequests ALTER COLUMN appointment_id DROP NOT NULL;
        RAISE NOTICE 'Made appointment_id nullable in DonationRequests table';
    ELSE
        RAISE NOTICE 'appointment_id is already nullable in DonationRequests table';
    END IF;
END $$;