import { query } from '../../db.js';

/**
 * Distribution Validation Service
 * Handles validation logic for distribution operations
 */

/**
 * Validate beneficiary data
 */
export const validateBeneficiaryData = (beneficiaryData) => {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!beneficiaryData.name || beneficiaryData.name.trim().length === 0) {
        errors.push('Beneficiary name is required');
    }

    if (!beneficiaryData.type) {
        errors.push('Beneficiary type is required');
    } else {
        const validTypes = ['Individual', 'Family', 'Community', 'Institution'];
        if (!validTypes.includes(beneficiaryData.type)) {
            errors.push(`Invalid beneficiary type. Must be one of: ${validTypes.join(', ')}`);
        }
    }

    // Optional field validation
    if (beneficiaryData.email && !isValidEmail(beneficiaryData.email)) {
        errors.push('Invalid email format');
    }

    if (beneficiaryData.phone && !isValidPhoneNumber(beneficiaryData.phone)) {
        warnings.push('Phone number format may be invalid');
    }

    if (beneficiaryData.name && beneficiaryData.name.length > 150) {
        errors.push('Beneficiary name cannot exceed 150 characters');
    }

    if (beneficiaryData.contact_person && beneficiaryData.contact_person.length > 100) {
        errors.push('Contact person name cannot exceed 100 characters');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate beneficiary request data
 */
export const validateBeneficiaryRequestData = (requestData) => {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!requestData.beneficiary_id) {
        errors.push('Beneficiary ID is required');
    }

    if (!requestData.purpose || requestData.purpose.trim().length === 0) {
        errors.push('Request purpose is required');
    }

    // Urgency validation
    if (requestData.urgency) {
        const validUrgency = ['Low', 'Medium', 'High'];
        if (!validUrgency.includes(requestData.urgency)) {
            errors.push(`Invalid urgency level. Must be one of: ${validUrgency.join(', ')}`);
        }
    }

    // Length validation
    if (requestData.purpose && requestData.purpose.length > 1000) {
        errors.push('Purpose cannot exceed 1000 characters');
    }

    if (requestData.notes && requestData.notes.length > 2000) {
        errors.push('Notes cannot exceed 2000 characters');
    }

    // Business logic validation
    if (requestData.purpose && requestData.purpose.length < 10) {
        warnings.push('Request purpose should be more descriptive (minimum 10 characters recommended)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate distribution plan data
 */
export const validateDistributionPlanData = async (planData) => {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!planData.request_id) {
        errors.push('Request ID is required');
    }

    if (!planData.items || !Array.isArray(planData.items) || planData.items.length === 0) {
        errors.push('At least one item is required in the distribution plan');
    }

    // Validate planned date
    if (planData.planned_date) {
        const plannedDate = new Date(planData.planned_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (plannedDate < today) {
            errors.push('Planned date cannot be in the past');
        }

        // Warning for dates too far in the future
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        if (plannedDate > oneMonthFromNow) {
            warnings.push('Planned date is more than one month in the future');
        }
    }

    // Validate items if provided
    if (planData.items && Array.isArray(planData.items)) {
        for (let i = 0; i < planData.items.length; i++) {
            const item = planData.items[i];
            const itemErrors = validateDistributionPlanItem(item, i);
            errors.push(...itemErrors.errors);
            warnings.push(...itemErrors.warnings);
        }
    }

    // Check if request exists and is in valid state
    if (planData.request_id) {
        try {
            const requestCheck = await query(
                'SELECT status FROM BeneficiaryRequests WHERE request_id = $1',
                [planData.request_id]
            );

            if (requestCheck.rows.length === 0) {
                errors.push('Beneficiary request not found');
            } else if (requestCheck.rows[0].status !== 'Approved') {
                errors.push('Can only create distribution plans for approved beneficiary requests');
            }

            // Check for existing plans
            const existingPlan = await query(
                'SELECT plan_id FROM DistributionPlans WHERE request_id = $1',
                [planData.request_id]
            );

            if (existingPlan.rows.length > 0) {
                errors.push('A distribution plan already exists for this request');
            }
        } catch (error) {
            errors.push('Error validating request status');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate individual distribution plan item
 */
export const validateDistributionPlanItem = (item, index = 0) => {
    const errors = [];
    const warnings = [];
    const itemPrefix = `Item ${index + 1}:`;

    // Required fields
    if (!item.inventory_id) {
        errors.push(`${itemPrefix} Inventory ID is required`);
    }

    if (!item.quantity || item.quantity <= 0) {
        errors.push(`${itemPrefix} Quantity must be a positive number`);
    }

    // Type validation
    if (item.quantity && !Number.isInteger(Number(item.quantity))) {
        errors.push(`${itemPrefix} Quantity must be a whole number`);
    }

    if (item.allocated_value && item.allocated_value < 0) {
        errors.push(`${itemPrefix} Allocated value cannot be negative`);
    }

    // Range validation
    if (item.quantity && item.quantity > 10000) {
        warnings.push(`${itemPrefix} Very large quantity (${item.quantity}). Please verify.`);
    }

    if (item.allocated_value && item.allocated_value > 100000) {
        warnings.push(`${itemPrefix} Very high allocated value (₱${item.allocated_value}). Please verify.`);
    }

    // Notes length validation
    if (item.notes && item.notes.length > 500) {
        errors.push(`${itemPrefix} Notes cannot exceed 500 characters`);
    }

    return {
        errors,
        warnings
    };
};

/**
 * Validate distribution execution data
 */
export const validateDistributionExecution = async (planId, executionData) => {
    const errors = [];
    const warnings = [];

    // Check plan exists and is in valid state
    try {
        const planCheck = await query(
            'SELECT status FROM DistributionPlans WHERE plan_id = $1',
            [planId]
        );

        if (planCheck.rows.length === 0) {
            errors.push('Distribution plan not found');
        } else {
            const planStatus = planCheck.rows[0].status;
            if (planStatus !== 'Approved') {
                errors.push(`Cannot execute plan with status: ${planStatus}. Plan must be approved.`);
            }
        }
    } catch (error) {
        errors.push('Error validating plan status');
    }

    // Validate distribution date
    if (executionData.distribution_date) {
        const distributionDate = new Date(executionData.distribution_date);
        const now = new Date();

        if (distributionDate > now) {
            errors.push('Distribution date cannot be in the future');
        }

        // Check if date is too far in the past (more than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (distributionDate < oneYearAgo) {
            warnings.push('Distribution date is more than one year ago');
        }
    }

    // Validate distributed_by if provided
    if (executionData.distributed_by_override) {
        try {
            const userCheck = await query(
                'SELECT user_id FROM Users WHERE user_id = $1 AND status = $2',
                [executionData.distributed_by_override, 'active']
            );

            if (userCheck.rows.length === 0) {
                errors.push('Specified user for distribution not found or inactive');
            }
        } catch (error) {
            errors.push('Error validating distribution user');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate inventory availability for distribution
 */
export const validateInventoryAvailability = async (items) => {
    const validations = [];
    const overallValid = true;

    for (const item of items) {
        const validation = {
            inventoryId: item.inventory_id,
            requestedQuantity: item.quantity,
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            const inventoryCheck = await query(
                `SELECT i.*, it.itemtype_name 
                 FROM Inventory i 
                 JOIN ItemType it ON i.itemtype_id = it.itemtype_id 
                 WHERE i.inventory_id = $1`,
                [item.inventory_id]
            );

            if (inventoryCheck.rows.length === 0) {
                validation.isValid = false;
                validation.errors.push('Inventory item not found');
            } else {
                const inventory = inventoryCheck.rows[0];
                validation.itemName = inventory.itemtype_name;
                validation.availableQuantity = inventory.quantity_available;

                // Check status
                if (inventory.status !== 'Available') {
                    validation.isValid = false;
                    validation.errors.push(`Inventory status is ${inventory.status}, not Available`);
                }

                // Check quantity
                if (inventory.quantity_available < item.quantity) {
                    validation.isValid = false;
                    validation.errors.push(
                        `Insufficient quantity. Available: ${inventory.quantity_available}, Requested: ${item.quantity}`
                    );
                }

                // Warnings for high allocation
                const allocationPercentage = (item.quantity / inventory.quantity_available) * 100;
                if (allocationPercentage > 80) {
                    validation.warnings.push(
                        `High allocation: ${allocationPercentage.toFixed(1)}% of available stock`
                    );
                }

                if (inventory.quantity_available - item.quantity <= 5) {
                    validation.warnings.push('This allocation will result in very low stock levels');
                }
            }
        } catch (error) {
            validation.isValid = false;
            validation.errors.push('Error checking inventory availability');
        }

        validations.push(validation);
    }

    return {
        isValid: validations.every(v => v.isValid),
        itemValidations: validations,
        summary: {
            total: validations.length,
            valid: validations.filter(v => v.isValid).length,
            invalid: validations.filter(v => !v.isValid).length,
            warnings: validations.reduce((sum, v) => sum + v.warnings.length, 0)
        }
    };
};

/**
 * Business rule validation for distribution operations
 */
export const validateBusinessRules = async (operationType, data) => {
    const errors = [];
    const warnings = [];

    switch (operationType) {
        case 'CREATE_PLAN':
            // Rule: Cannot create more than 10 plans per day per user
            const plansToday = await query(
                `SELECT COUNT(*) as count FROM DistributionPlans 
                 WHERE created_by = $1 AND DATE(created_at) = CURRENT_DATE`,
                [data.created_by]
            );

            if (parseInt(plansToday.rows[0].count) >= 10) {
                warnings.push('You have created many plans today. Consider reviewing existing plans.');
            }
            break;

        case 'EXECUTE_PLAN':
            // Rule: Cannot execute multiple plans for same beneficiary on same day
            const sameDayExecution = await query(
                `SELECT COUNT(*) as count FROM DistributionLogs dl
                 JOIN DistributionPlans dp ON dl.plan_id = dp.plan_id
                 JOIN BeneficiaryRequests br ON dp.request_id = br.request_id
                 WHERE br.beneficiary_id = $1 AND DATE(dl.distribution_date) = $2`,
                [data.beneficiary_id, data.distribution_date || new Date().toISOString().split('T')[0]]
            );

            if (parseInt(sameDayExecution.rows[0].count) > 0) {
                warnings.push('This beneficiary has already received distributions today');
            }
            break;

        case 'APPROVE_PLAN':
            // Rule: Plans above certain value need executive approval
            const planValue = await query(
                `SELECT SUM(allocated_value) as total_value 
                 FROM DistributionPlanItems WHERE plan_id = $1`,
                [data.plan_id]
            );

            const totalValue = parseFloat(planValue.rows[0].total_value || 0);
            if (totalValue > 50000 && !data.is_executive) {
                errors.push('Plans with total value exceeding ₱50,000 require Executive Admin approval');
            }
            break;
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Helper functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
    // Basic Philippines phone number validation
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

export {
    isValidEmail,
    isValidPhoneNumber
};