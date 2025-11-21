// Check min_fmv and max_fmv usage analysis
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'malasackit_portal_db',
    user: 'postgres',
    password: 'password'
});

async function analyzeMinMaxFMV() {
    try {
        await client.connect();
        console.log('🔍 ANALYZING MIN_FMV AND MAX_FMV USAGE\n');
        
        // Get items with their min/max FMV values
        const query = `
            SELECT 
                it.itemtype_name,
                ic.category_name,
                it.avg_retail_price,
                it.min_fmv,
                it.max_fmv,
                -- Calculate reasonable range percentages
                CASE 
                    WHEN it.avg_retail_price > 0 THEN ROUND((it.min_fmv / it.avg_retail_price * 100), 1)
                    ELSE 0 
                END as min_percent_of_retail,
                CASE 
                    WHEN it.avg_retail_price > 0 THEN ROUND((it.max_fmv / it.avg_retail_price * 100), 1)
                    ELSE 0 
                END as max_percent_of_retail
            FROM ItemType it
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE it.min_fmv IS NOT NULL AND it.max_fmv IS NOT NULL
            ORDER BY ic.category_name, it.itemtype_name
            LIMIT 15
        `;
        
        const result = await client.query(query);
        
        console.log('=== MIN/MAX FMV VALUES IN DATABASE ===\n');
        
        for (const item of result.rows) {
            const minFmv = parseFloat(item.min_fmv);
            const maxFmv = parseFloat(item.max_fmv);
            const retailPrice = parseFloat(item.avg_retail_price);
            
            console.log(`📦 ${item.itemtype_name} (${item.category_name})`);
            console.log(`   Retail Price: ₱${retailPrice.toFixed(2)}`);
            console.log(`   Min FMV: ₱${minFmv.toFixed(2)} (${item.min_percent_of_retail}% of retail)`);
            console.log(`   Max FMV: ₱${maxFmv.toFixed(2)} (${item.max_percent_of_retail}% of retail)`);
            console.log(`   📊 Range: ₱${minFmv.toFixed(2)} - ₱${maxFmv.toFixed(2)} (${(maxFmv - minFmv).toFixed(2)} spread)`);
            console.log('');
        }
        
        // Check if any donations are currently outside these ranges
        const donationCheckQuery = `
            SELECT 
                it.itemtype_name,
                di.declared_value,
                it.min_fmv,
                it.max_fmv,
                it.avg_retail_price,
                dr.donation_id,
                dr.status,
                CASE 
                    WHEN di.declared_value < it.min_fmv THEN 'BELOW_MIN'
                    WHEN di.declared_value > it.max_fmv THEN 'ABOVE_MAX'
                    ELSE 'WITHIN_RANGE'
                END as range_status
            FROM DonationItems di
            JOIN ItemType it ON di.itemtype_id = it.itemtype_id
            JOIN DonationRequests dr ON di.donation_id = dr.donation_id
            WHERE it.min_fmv IS NOT NULL 
            AND it.max_fmv IS NOT NULL
            AND di.declared_value IS NOT NULL
            AND (di.declared_value < it.min_fmv OR di.declared_value > it.max_fmv)
            ORDER BY di.declared_value DESC
            LIMIT 10
        `;
        
        const donationResult = await client.query(donationCheckQuery);
        
        console.log('=== CURRENT DONATIONS OUTSIDE MIN/MAX RANGES ===\n');
        
        if (donationResult.rows.length === 0) {
            console.log('✅ All current donations are within their min/max FMV ranges');
        } else {
            for (const donation of donationResult.rows) {
                const declaredValue = parseFloat(donation.declared_value);
                const minFmv = parseFloat(donation.min_fmv);
                const maxFmv = parseFloat(donation.max_fmv);
                
                console.log(`⚠️  Donation #${donation.donation_id} - ${donation.itemtype_name}`);
                console.log(`   Status: ${donation.status}`);
                console.log(`   Declared Value: ₱${declaredValue.toFixed(2)}`);
                console.log(`   Expected Range: ₱${minFmv.toFixed(2)} - ₱${maxFmv.toFixed(2)}`);
                console.log(`   Issue: ${donation.range_status}`);
                console.log('');
            }
        }
        
        // Analyze potential usage patterns
        console.log('=== ANALYSIS: POTENTIAL USES FOR MIN/MAX FMV ===\n');
        
        console.log('🎯 VALIDATION OPPORTUNITIES:');
        console.log('✅ Donor Input Validation - Prevent unrealistic declared values');
        console.log('✅ Quality Control - Flag donations for manual review');
        console.log('✅ Fraud Prevention - Detect over/under-valued donations');
        console.log('✅ Consistency Checks - Ensure reasonable value ranges');
        
        console.log('\n💡 CURRENT SYSTEM BEHAVIOR:');
        console.log('❌ NO validation against min/max FMV ranges');
        console.log('❌ Donors can declare ANY value without range checks');
        console.log('❌ No automated flagging of unusual valuations');
        console.log('❌ Min/max FMV fields are UNUSED in current implementation');
        
        console.log('\n🔧 RECOMMENDED IMPLEMENTATION:');
        console.log('1. Frontend Validation: Warn if declared_value < min_fmv or > max_fmv');
        console.log('2. Backend Validation: Require justification for out-of-range values');
        console.log('3. Admin Review: Auto-flag donations outside acceptable ranges');
        console.log('4. Condition Logic: Use ranges to validate condition factor calculations');
        
        // Sample validation logic
        console.log('\n📝 SAMPLE VALIDATION LOGIC:');
        console.log(`
// Frontend validation example:
if (declaredValue < itemType.min_fmv) {
    showWarning('Value seems low for this item type. Please verify.');
} else if (declaredValue > itemType.max_fmv) {
    showWarning('Value seems high for this item type. Please verify.');
}

// Backend validation example:
if (declaredValue < minFmv || declaredValue > maxFmv) {
    // Require admin approval or donor justification
    donationStatus = 'Pending Review';
}
        `);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

analyzeMinMaxFMV();