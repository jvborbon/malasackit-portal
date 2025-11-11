import { query } from '../../db.js';

/**
 * Distribution Planning Service
 * Handles the business logic for creating optimal distribution plans using smart algorithms
 */

/**
 * Generate intelligent distribution recommendations based on beneficiary requests and inventory
 * Uses rule-based algorithms to optimize resource allocation
 */
export const generateDistributionRecommendations = async (requestIds) => {
    try {
        // Get all approved beneficiary requests
        const requestsQuery = `
            SELECT br.*, b.name as beneficiary_name, b.type, b.address
            FROM BeneficiaryRequests br
            JOIN Beneficiaries b ON br.beneficiary_id = b.beneficiary_id
            WHERE br.request_id = ANY($1) AND br.status = 'Approved'
        `;

        const requests = await query(requestsQuery, [requestIds]);

        if (requests.rows.length === 0) {
            throw new Error('No approved beneficiary requests found');
        }

        // Get current inventory with available quantities
        const inventoryQuery = `
            SELECT i.*, it.itemtype_name, ic.category_name, it.fmv_value
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE i.quantity_available > 0 AND i.status = 'Available'
            ORDER BY ic.category_name, it.itemtype_name
        `;

        const inventory = await query(inventoryQuery);

        // Generate recommendations for each request
        const recommendations = [];

        for (const request of requests.rows) {
            const recommendation = await generateRecommendationForRequest(request, inventory.rows);
            if (recommendation) {
                recommendations.push(recommendation);
            }
        }

        return {
            success: true,
            data: recommendations,
            summary: {
                totalRequests: requests.rows.length,
                recommendationsGenerated: recommendations.length,
                totalEstimatedValue: recommendations.reduce((sum, rec) => sum + rec.estimatedValue, 0)
            }
        };

    } catch (error) {
        console.error('Error generating distribution recommendations:', error);
        throw error;
    }
};

/**
 * Generate recommendation for a single request
 */
async function generateRecommendationForRequest(request, availableInventory) {
    const recommendation = {
        requestId: request.request_id,
        beneficiaryName: request.beneficiary_name,
        beneficiaryType: request.type,
        purpose: request.purpose,
        urgency: request.urgency,
        recommendedItems: [],
        estimatedValue: 0,
        warnings: []
    };

    // Simple recommendation logic based on beneficiary type and purpose
    const itemAllocation = determineItemAllocation(request);

    for (const allocation of itemAllocation) {
        const availableItem = availableInventory.find(inv => 
            inv.itemtype_name.toLowerCase().includes(allocation.itemType.toLowerCase()) ||
            allocation.itemType.toLowerCase().includes(inv.itemtype_name.toLowerCase())
        );

        if (availableItem && availableItem.quantity_available >= allocation.quantity) {
            recommendation.recommendedItems.push({
                inventoryId: availableItem.inventory_id,
                itemTypeName: availableItem.itemtype_name,
                categoryName: availableItem.category_name,
                quantity: allocation.quantity,
                allocatedValue: availableItem.fmv_value * allocation.quantity,
                availableQuantity: availableItem.quantity_available,
                notes: allocation.notes
            });
            recommendation.estimatedValue += availableItem.fmv_value * allocation.quantity;
        } else if (availableItem) {
            recommendation.warnings.push(`Limited stock for ${allocation.itemType}. Available: ${availableItem.quantity_available}, Recommended: ${allocation.quantity}`);
            
            // Allocate what's available
            if (availableItem.quantity_available > 0) {
                recommendation.recommendedItems.push({
                    inventoryId: availableItem.inventory_id,
                    itemTypeName: availableItem.itemtype_name,
                    categoryName: availableItem.category_name,
                    quantity: availableItem.quantity_available,
                    allocatedValue: availableItem.fmv_value * availableItem.quantity_available,
                    availableQuantity: availableItem.quantity_available,
                    notes: `Partial allocation - ${allocation.notes}`
                });
                recommendation.estimatedValue += availableItem.fmv_value * availableItem.quantity_available;
            }
        } else {
            recommendation.warnings.push(`No available inventory for ${allocation.itemType}`);
        }
    }

    return recommendation;
}

/**
 * Determine item allocation based on beneficiary type and request purpose
 */
function determineItemAllocation(request) {
    const allocations = [];
    const purpose = request.purpose.toLowerCase();
    const type = request.type.toLowerCase();

    // Basic allocation rules - this can be enhanced based on specific requirements
    if (purpose.includes('food') || purpose.includes('meal') || purpose.includes('nutrition')) {
        allocations.push(
            { itemType: 'Rice', quantity: type === 'family' ? 5 : type === 'community' ? 20 : 2, notes: 'Basic food staple' },
            { itemType: 'Canned Goods', quantity: type === 'family' ? 10 : type === 'community' ? 50 : 5, notes: 'Protein source' },
            { itemType: 'Cooking Oil', quantity: type === 'family' ? 2 : type === 'community' ? 10 : 1, notes: 'Cooking essential' }
        );
    }

    if (purpose.includes('hygiene') || purpose.includes('cleaning') || purpose.includes('sanitation')) {
        allocations.push(
            { itemType: 'Soap', quantity: type === 'family' ? 5 : type === 'community' ? 25 : 2, notes: 'Personal hygiene' },
            { itemType: 'Shampoo', quantity: type === 'family' ? 2 : type === 'community' ? 10 : 1, notes: 'Hair care' },
            { itemType: 'Toothpaste', quantity: type === 'family' ? 3 : type === 'community' ? 15 : 1, notes: 'Oral hygiene' }
        );
    }

    if (purpose.includes('clothing') || purpose.includes('apparel')) {
        allocations.push(
            { itemType: 'T-Shirts', quantity: type === 'family' ? 4 : type === 'community' ? 20 : 2, notes: 'Basic clothing' },
            { itemType: 'Pants', quantity: type === 'family' ? 2 : type === 'community' ? 10 : 1, notes: 'Lower garment' }
        );
    }

    if (purpose.includes('school') || purpose.includes('education') || purpose.includes('student')) {
        allocations.push(
            { itemType: 'Notebooks', quantity: type === 'individual' ? 5 : 20, notes: 'Writing materials' },
            { itemType: 'Pens', quantity: type === 'individual' ? 5 : 25, notes: 'Writing instruments' },
            { itemType: 'Pencils', quantity: type === 'individual' ? 5 : 25, notes: 'Drawing/writing tools' }
        );
    }

    if (purpose.includes('medical') || purpose.includes('health') || purpose.includes('emergency')) {
        allocations.push(
            { itemType: 'First Aid', quantity: 1, notes: 'Emergency medical supplies' },
            { itemType: 'Face Masks', quantity: type === 'family' ? 10 : type === 'community' ? 50 : 5, notes: 'Health protection' },
            { itemType: 'Alcohol', quantity: type === 'family' ? 2 : type === 'community' ? 10 : 1, notes: 'Disinfectant' }
        );
    }

    // Default allocation if no specific category matches
    if (allocations.length === 0) {
        allocations.push(
            { itemType: 'Rice', quantity: 2, notes: 'Basic necessity' },
            { itemType: 'Canned Goods', quantity: 3, notes: 'Food supply' },
            { itemType: 'Soap', quantity: 2, notes: 'Hygiene item' }
        );
    }

    return allocations;
}

/**
 * Validate distribution plan feasibility
 */
export const validateDistributionPlan = async (planItems) => {
    try {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            itemValidations: []
        };

        for (const item of planItems) {
            const itemValidation = await validatePlanItem(item);
            validation.itemValidations.push(itemValidation);

            if (!itemValidation.isValid) {
                validation.isValid = false;
                validation.errors.push(...itemValidation.errors);
            }
            
            validation.warnings.push(...itemValidation.warnings);
        }

        return validation;

    } catch (error) {
        console.error('Error validating distribution plan:', error);
        throw error;
    }
};

/**
 * Validate a single plan item
 */
async function validatePlanItem(item) {
    const validation = {
        inventoryId: item.inventory_id,
        isValid: true,
        errors: [],
        warnings: []
    };

    // Check if inventory exists and has sufficient quantity
    const inventoryCheck = await query(
        'SELECT * FROM Inventory WHERE inventory_id = $1',
        [item.inventory_id]
    );

    if (inventoryCheck.rows.length === 0) {
        validation.isValid = false;
        validation.errors.push(`Inventory item ${item.inventory_id} not found`);
        return validation;
    }

    const inventory = inventoryCheck.rows[0];

    if (inventory.status !== 'Available') {
        validation.isValid = false;
        validation.errors.push(`Inventory item ${item.inventory_id} is not available (status: ${inventory.status})`);
    }

    if (inventory.quantity_available < item.quantity) {
        validation.isValid = false;
        validation.errors.push(`Insufficient quantity for inventory item ${item.inventory_id}. Available: ${inventory.quantity_available}, Requested: ${item.quantity}`);
    }

    // Warning for allocating large portions of available stock
    const allocationPercentage = (item.quantity / inventory.quantity_available) * 100;
    if (allocationPercentage > 80) {
        validation.warnings.push(`High allocation: ${allocationPercentage.toFixed(1)}% of available stock for inventory item ${item.inventory_id}`);
    }

    return validation;
}

/**
 * Calculate distribution metrics and analytics
 */
export const calculateDistributionMetrics = async (timeframe = 30) => {
    try {
        // Distribution efficiency metrics
        const efficiencyQuery = `
            SELECT 
                COUNT(dp.plan_id) as total_plans,
                COUNT(CASE WHEN dp.status = 'Completed' THEN 1 END) as completed_plans,
                AVG(EXTRACT(DAY FROM (dp.updated_at - dp.created_at))) as avg_completion_days,
                SUM(dpi.allocated_value) as total_value_distributed
            FROM DistributionPlans dp
            LEFT JOIN DistributionPlanItems dpi ON dp.plan_id = dpi.plan_id
            WHERE dp.created_at >= NOW() - INTERVAL '${timeframe} days'
        `;

        // Beneficiary reach metrics
        const reachQuery = `
            SELECT 
                COUNT(DISTINCT br.beneficiary_id) as unique_beneficiaries,
                COUNT(DISTINCT CASE WHEN br.status = 'Fulfilled' THEN br.beneficiary_id END) as served_beneficiaries,
                AVG(CASE WHEN br.status = 'Fulfilled' 
                    THEN EXTRACT(DAY FROM (
                        SELECT MIN(dl.distribution_date) 
                        FROM DistributionLogs dl 
                        JOIN DistributionPlans dp ON dl.plan_id = dp.plan_id 
                        WHERE dp.request_id = br.request_id
                    ) - br.request_date) 
                END) as avg_response_days
            FROM BeneficiaryRequests br
            WHERE br.request_date >= NOW() - INTERVAL '${timeframe} days'
        `;

        // Item distribution patterns
        const patternsQuery = `
            SELECT 
                ic.category_name,
                COUNT(dl.distribution_id) as distribution_count,
                SUM(dl.quantity_distributed) as total_quantity,
                COUNT(DISTINCT dl.beneficiary_id) as beneficiaries_served
            FROM DistributionLogs dl
            JOIN ItemType it ON dl.itemtype_id = it.itemtype_id
            JOIN ItemCategory ic ON it.itemcategory_id = ic.itemcategory_id
            WHERE dl.distribution_date >= NOW() - INTERVAL '${timeframe} days'
            GROUP BY ic.category_name
            ORDER BY total_quantity DESC
        `;

        const [efficiencyResult, reachResult, patternsResult] = await Promise.all([
            query(efficiencyQuery),
            query(reachQuery),
            query(patternsQuery)
        ]);

        const efficiency = efficiencyResult.rows[0];
        const reach = reachResult.rows[0];
        const patterns = patternsResult.rows;

        return {
            efficiency: {
                completionRate: efficiency.total_plans > 0 ? 
                    (efficiency.completed_plans / efficiency.total_plans * 100).toFixed(2) : 0,
                avgCompletionDays: parseFloat(efficiency.avg_completion_days || 0).toFixed(1),
                totalValueDistributed: parseFloat(efficiency.total_value_distributed || 0)
            },
            reach: {
                uniqueBeneficiaries: parseInt(reach.unique_beneficiaries || 0),
                servedBeneficiaries: parseInt(reach.served_beneficiaries || 0),
                serviceRate: reach.unique_beneficiaries > 0 ? 
                    (reach.served_beneficiaries / reach.unique_beneficiaries * 100).toFixed(2) : 0,
                avgResponseDays: parseFloat(reach.avg_response_days || 0).toFixed(1)
            },
            itemPatterns: patterns
        };

    } catch (error) {
        console.error('Error calculating distribution metrics:', error);
        throw error;
    }
};

/**
 * Optimize inventory allocation across multiple distribution plans
 */
export const optimizeInventoryAllocation = async (planItems) => {
    try {
        // Get current inventory levels
        const inventoryQuery = `
            SELECT i.*, it.itemtype_name, it.fmv_value
            FROM Inventory i
            JOIN ItemType it ON i.itemtype_id = it.itemtype_id
            WHERE i.inventory_id = ANY($1)
        `;

        const inventoryIds = [...new Set(planItems.map(item => item.inventory_id))];
        const inventory = await query(inventoryQuery, [inventoryIds]);

        const inventoryMap = inventory.rows.reduce((map, item) => {
            map[item.inventory_id] = item;
            return map;
        }, {});

        // Group items by inventory_id and calculate total demand
        const demandByInventory = planItems.reduce((demand, item) => {
            if (!demand[item.inventory_id]) {
                demand[item.inventory_id] = [];
            }
            demand[item.inventory_id].push(item);
            return demand;
        }, {});

        const optimization = {
            feasible: true,
            adjustments: [],
            warnings: [],
            totalValueImpact: 0
        };

        // Check each inventory item for over-allocation
        for (const [inventoryId, items] of Object.entries(demandByInventory)) {
            const totalDemand = items.reduce((sum, item) => sum + item.quantity, 0);
            const available = inventoryMap[inventoryId]?.quantity_available || 0;

            if (totalDemand > available) {
                optimization.feasible = false;
                
                // Proportional allocation based on urgency and beneficiary type
                const adjustedItems = allocateProportionally(items, available);
                
                optimization.adjustments.push({
                    inventoryId: parseInt(inventoryId),
                    itemName: inventoryMap[inventoryId]?.itemtype_name,
                    totalDemand,
                    available,
                    shortfall: totalDemand - available,
                    adjustedAllocations: adjustedItems
                });

                // Calculate value impact
                const originalValue = items.reduce((sum, item) => 
                    sum + (item.quantity * (inventoryMap[inventoryId]?.fmv_value || 0)), 0);
                const adjustedValue = adjustedItems.reduce((sum, item) => 
                    sum + (item.adjustedQuantity * (inventoryMap[inventoryId]?.fmv_value || 0)), 0);
                
                optimization.totalValueImpact += originalValue - adjustedValue;
            }
        }

        return optimization;

    } catch (error) {
        console.error('Error optimizing inventory allocation:', error);
        throw error;
    }
};

/**
 * Allocate inventory proportionally based on priority factors
 */
function allocateProportionally(items, availableQuantity) {
    // Priority scoring: urgency (40%) + beneficiary type (30%) + request date (30%)
    const scoredItems = items.map(item => {
        let score = 0;
        
        // Urgency scoring
        switch (item.urgency?.toLowerCase()) {
            case 'high': score += 40; break;
            case 'medium': score += 25; break;
            case 'low': score += 10; break;
            default: score += 20; break;
        }
        
        // Beneficiary type scoring (families and communities get higher priority)
        switch (item.beneficiary_type?.toLowerCase()) {
            case 'family': score += 30; break;
            case 'community': score += 25; break;
            case 'institution': score += 20; break;
            default: score += 15; break;
        }
        
        // Request date scoring (older requests get slightly higher priority)
        const daysSinceRequest = item.days_since_request || 0;
        score += Math.min(daysSinceRequest * 0.5, 30);
        
        return { ...item, priorityScore: score };
    });

    // Sort by priority score (descending)
    scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);

    // Allocate quantities proportionally
    const totalScore = scoredItems.reduce((sum, item) => sum + item.priorityScore, 0);
    let remainingQuantity = availableQuantity;

    const allocatedItems = scoredItems.map((item, index) => {
        let allocatedQuantity;
        
        if (index === scoredItems.length - 1) {
            // Give remaining quantity to last item
            allocatedQuantity = Math.min(remainingQuantity, item.quantity);
        } else {
            // Proportional allocation
            const proportion = item.priorityScore / totalScore;
            allocatedQuantity = Math.min(
                Math.floor(availableQuantity * proportion),
                item.quantity,
                remainingQuantity
            );
        }
        
        remainingQuantity -= allocatedQuantity;
        
        return {
            ...item,
            originalQuantity: item.quantity,
            adjustedQuantity: allocatedQuantity,
            allocationRate: (allocatedQuantity / item.quantity * 100).toFixed(1)
        };
    });

    return allocatedItems;
}