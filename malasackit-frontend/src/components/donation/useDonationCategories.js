import { useState, useEffect } from 'react';
import { fetchDonationCategories } from './donationCategoriesAPI';

/**
 * Custom hook to manage donation categories data
 * @returns {Object} Categories state and loading information
 */
export const useDonationCategories = () => {
    const [categories, setCategories] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const result = await fetchDonationCategories();
            
            if (result.success) {
                setCategories(result.data);
                setUsingFallback(false);
            } else {
                // Use fallback data if API call fails
                setCategories(result.fallback || {});
                setUsingFallback(true);
                setError(result.error || 'Failed to load categories from database');
            }
        } catch (err) {
            console.error('Error loading donation categories:', err);
            setError(err.message);
            setUsingFallback(true);
            
            // Set minimal fallback categories
            setCategories({
                'Food Items': {
                    icon: '🍲',
                    description: 'Canned goods, rice, noodles, etc.',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    items: ['Canned Goods', 'Rice', 'Noodles', 'Other Food Items']
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const refreshCategories = () => {
        loadCategories();
    };

    return {
        categories,
        isLoading,
        error,
        usingFallback,
        refreshCategories
    };
};