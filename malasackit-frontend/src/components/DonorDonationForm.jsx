import { useState, useEffect } from 'react';

// Import organized components
import { FormHeader } from './donation/DonationFormHeader';
import { DonationModal } from './donation/DonationModal';
import { DonationItemsDisplay } from './donation/DonationItemsDisplay';
import { ProhibitedDonations } from './donation/ProhibitedDonations';
import { DonationDetails } from './donation/DonationDetails';
import { SubmitSection } from './donation/SubmitSection';
import { useDonationCategories } from './donation/useDonationCategories';
import { submitDonationRequest } from '../services/donationService';

export default function DonorDonationForm() {
    const { categories, isLoading } = useDonationCategories();
    
    const [formData, setFormData] = useState({
        deliveryMethod: 'pickup',
        description: '',
        scheduleDate: '',
        appointmentTime: ''
    });

    const [donationItems, setDonationItems] = useState([]);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Set the first available category as active when categories are loaded
    useEffect(() => {
        if (!isLoading && categories && Object.keys(categories).length > 0 && !activeCategory) {
            setActiveCategory(Object.keys(categories)[0]);
        }
    }, [categories, isLoading, activeCategory]);

    // Event Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const confirmSelectedItems = () => {
        // Add selected items to donation items with unique IDs and default values
        const newDonationItems = selectedItems.map(item => ({
            id: Date.now() + Math.random(),
            category: item.category,
            itemType: item.itemType,
            quantity: '',
            value: '',
            description: ''
        }));
        
        setDonationItems(prev => [...prev, ...newDonationItems]);
        setSelectedItems([]);
        setShowDonationModal(false);
        // Reset to first available category
        if (categories && Object.keys(categories).length > 0) {
            setActiveCategory(Object.keys(categories)[0]);
        }
    };

    const updateDonationItem = (itemId, field, value) => {
        setDonationItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const removeDonationItem = (itemId) => {
        setDonationItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset previous states
        setSubmitError(null);
        setSubmitSuccess(false);
        
        // Validation
        if (donationItems.length === 0) {
            setSubmitError('Please add at least one donation item.');
            return;
        }
        
        // Check if all items have required fields
        const incompleteItems = donationItems.filter(item => !item.quantity || !item.value);
        if (incompleteItems.length > 0) {
            setSubmitError('Please fill in quantity and value for all donation items.');
            return;
        }

        // Validate schedule date if provided
        if (formData.scheduleDate) {
            const selectedDate = new Date(formData.scheduleDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                setSubmitError('Please select a future date for your appointment.');
                return;
            }
        }
        
        try {
            setIsSubmitting(true);
            
            // Prepare donation data for API
            const donationData = {
                items: donationItems.map(item => ({
                    itemType: item.itemType,
                    quantity: parseInt(item.quantity),
                    value: parseFloat(item.value),
                    description: item.description || null
                })),
                deliveryMethod: formData.deliveryMethod,
                description: formData.description || null,
                scheduleDate: formData.scheduleDate || null,
                appointmentTime: formData.appointmentTime || null
            };
            
            console.log('Submitting donation:', donationData);
            
            // Submit to API
            const response = await submitDonationRequest(donationData);
            
            console.log('Donation response:', response);
            
            if (response.success) {
                setSubmitSuccess(true);
                
                // Reset form after successful submission
                setTimeout(() => {
                    setDonationItems([]);
                    setSelectedItems([]);
                    setFormData({
                        deliveryMethod: 'pickup',
                        description: '',
                        scheduleDate: '',
                        appointmentTime: ''
                    });
                    
                    // Reset to first available category
                    if (categories && Object.keys(categories).length > 0) {
                        setActiveCategory(Object.keys(categories)[0]);
                    }
                    
                    setSubmitSuccess(false);
                }, 3000); // Hide success message after 3 seconds
                
            } else {
                throw new Error(response.message || 'Failed to submit donation request');
            }
            
        } catch (error) {
            console.error('Error submitting donation:', error);
            
            // Handle different types of errors
            if (error.response?.status === 401) {
                setSubmitError('You must be logged in to submit a donation request.');
            } else if (error.response?.status === 400) {
                setSubmitError(error.response.data?.message || 'Invalid donation data provided.');
            } else if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else {
                setSubmitError('Failed to submit donation request. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
            {/* Form Header */}
            <FormHeader />

            {/* Donation Modal */}
            <DonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                onConfirm={confirmSelectedItems}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Donation Items Display */}
                <DonationItemsDisplay
                    donationItems={donationItems}
                    setShowDonationModal={setShowDonationModal}
                    updateDonationItem={updateDonationItem}
                    removeDonationItem={removeDonationItem}
                />

                {/* Prohibited Donations Section */}
                <ProhibitedDonations />

                {/* Donation Details Section */}
                <DonationDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                />

                {/* Submit Section */}
                <SubmitSection
                    donationItems={donationItems}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                />
            </form>
        </div>
    );
}