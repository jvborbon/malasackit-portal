-- Add condition field automation to DonationItems table
-- This script adds automatic FMV calculation based on condition

-- Function to calculate FMV based on condition
CREATE OR REPLACE FUNCTION calculate_donation_item_fmv()
RETURNS TRIGGER AS $$
BEGIN
    -- Get item type data for FMV calculation
    SELECT 
        avg_retail_price,
        CASE NEW.selected_condition
            WHEN 'new' THEN condition_factor_new
            WHEN 'good' THEN condition_factor_good
            WHEN 'fair' THEN condition_factor_fair
            WHEN 'poor' THEN condition_factor_poor
            ELSE condition_factor_good  -- default to good
        END as condition_factor
    INTO NEW.calculated_fmv, NEW.condition_multiplier
    FROM ItemType 
    WHERE itemtype_id = NEW.itemtype_id;
    
    -- Calculate the final FMV
    NEW.calculated_fmv := COALESCE(NEW.calculated_fmv * NEW.condition_multiplier * NEW.quantity, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate FMV
DROP TRIGGER IF EXISTS trigger_calculate_donation_item_fmv ON DonationItems;
CREATE TRIGGER trigger_calculate_donation_item_fmv
    BEFORE INSERT OR UPDATE ON DonationItems
    FOR EACH ROW
    EXECUTE FUNCTION calculate_donation_item_fmv();

COMMENT ON FUNCTION calculate_donation_item_fmv() IS 'Automatically calculates FMV for donation items based on condition and item type';
COMMENT ON TRIGGER trigger_calculate_donation_item_fmv ON DonationItems IS 'Triggers FMV calculation when donation items are inserted or updated';