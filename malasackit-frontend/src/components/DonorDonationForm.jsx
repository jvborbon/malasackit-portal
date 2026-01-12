import { useState, useEffect } from 'react';
import { HiCheckCircle, HiX, HiCalendar, HiTruck, HiHome, HiLocationMarker } from 'react-icons/hi';
import { useAuth } from '../auth/Authentication';
import api from '../utils/api';

// Import organized components
import { FormHeader } from './donation/donor/DonationFormHeader';
import { DonationModal } from './donation/donor/DonationModal';
import { DonationItemsDisplay } from './donation/donor/DonationItemsDisplay';
import { ProhibitedDonations } from './donation/donor/ProhibitedDonations';
import { DonationDetails } from './donation/donor/DonationDetails';
import { SubmitSection } from './donation/donor/SubmitSection';
import { useDonationCategories } from './donation/useDonationCategories';
import { submitDonationRequest } from '../services/donationService';
import { sanitizeInput, sanitizeText } from '../utils/sanitization';

export default function DonorDonationForm() {
    const { categories, isLoading } = useDonationCategories();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        deliveryMethod: 'pickup',
        description: '',
        scheduleDate: '',
        appointmentTime: '',
        pickupAddress: '',
        useExistingAddress: false,
        address: ''
    });

    const [userProfile, setUserProfile] = useState(null);

    const [donationItems, setDonationItems] = useState([]);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successDetails, setSuccessDetails] = useState(null);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data.success) {
                    setUserProfile(response.data.data.user);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    // Set the first available category as active when categories are loaded
    useEffect(() => {
        if (!isLoading && categories && Object.keys(categories).length > 0 && !activeCategory) {
            setActiveCategory(Object.keys(categories)[0]);
        }
    }, [categories, isLoading, activeCategory]);

    // Event Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle checkbox for useExistingAddress
        if (name === 'useExistingAddress') {
            const useExisting = checked;
            const savedAddress = userProfile ? 
                [userProfile.streetaddress, userProfile.barangay_id, userProfile.municipality_id, userProfile.province_id]
                    .filter(Boolean).join(', ') : '';
            
            setFormData(prev => ({
                ...prev,
                useExistingAddress: useExisting,
                pickupAddress: useExisting ? '' : prev.pickupAddress,
                address: useExisting ? savedAddress : prev.pickupAddress
            }));
            return;
        }
        
        // Sanitize input based on field type
        let sanitizedValue = value;
        if (name === 'description') {
            sanitizedValue = sanitizeText(value);
        } else if (['pickupAddress', 'address'].includes(name)) {
            sanitizedValue = sanitizeInput(value);
        }
        
        // If pickupAddress is being changed, update address and uncheck existing
        if (name === 'pickupAddress') {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
                address: sanitizedValue,
                useExistingAddress: false
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
        }
    };

    const confirmSelectedItems = () => {
        // Add selected items to donation items with unique IDs and default values
        const newDonationItems = selectedItems.map(item => {
            // Determine appropriate initial condition
            let initialCondition = 'good';
            let conditionFactor = 0.75;
            
            if (item.itemData) {
                // Check if this is a fixed condition item
                if (item.itemData.has_fixed_condition && item.itemData.fixed_condition) {
                    initialCondition = item.itemData.fixed_condition;
                    // Get condition factor based on fixed condition
                    switch (item.itemData.fixed_condition) {
                        case 'new': conditionFactor = item.itemData.condition_factor_new || 1.00; break;
                        case 'good': conditionFactor = item.itemData.condition_factor_good || 0.75; break;
                        case 'fair': conditionFactor = item.itemData.condition_factor_fair || 0.50; break;
                        case 'poor': conditionFactor = item.itemData.condition_factor_poor || 0.25; break;
                    }
                } else {
                    conditionFactor = item.itemData.condition_factor_good || 0.75;
                }
            }
            
            // Auto-calculate initial FMV
            let initialValue = '';
            if (item.itemData && item.itemData.avg_retail_price) {
                initialValue = (item.itemData.avg_retail_price * conditionFactor).toFixed(2);
            }
            
            return {
                id: Date.now() + Math.random(),
                category: item.category,
                itemType: item.itemType,
                itemTypeId: item.itemTypeId,
                itemData: item.itemData,
                quantity: '',
                value: initialValue,
                condition: initialCondition,
                description: ''
            };
        });
        
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

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setSuccessDetails(null);
        
        // Reset form after successful submission
        setDonationItems([]);
        setSelectedItems([]);
        setFormData({
            deliveryMethod: 'pickup',
            description: '',
            scheduleDate: '',
            appointmentTime: '',
            pickupAddress: '',
            address: ''
        });
        
        // Reset to first available category
        if (categories && Object.keys(categories).length > 0) {
            setActiveCategory(Object.keys(categories)[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset previous states
        setSubmitError(null);
        
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

        // Validate pickup address if pickup is selected
        if (formData.deliveryMethod === 'pickup' && !formData.pickupAddress.trim()) {
            setSubmitError('Please enter your address for pickup delivery.');
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
                    condition: item.condition || 'good',
                    description: item.description || null
                })),
                deliveryMethod: formData.deliveryMethod,
                description: formData.description || null,
                scheduleDate: formData.scheduleDate || null,
                appointmentTime: formData.appointmentTime || null,
                pickupAddress: formData.deliveryMethod === 'pickup' ? formData.pickupAddress : null,
                address: formData.address || null // Include synced address
            };
            
            console.log('Submitting donation:', donationData);
            
            // Submit to API
            const response = await submitDonationRequest(donationData);
            
            console.log('Donation response:', response);
            
            if (response.success) {
                // Set success details for the modal
                setSuccessDetails({
                    donationId: response.data?.donationId,
                    appointmentId: response.data?.appointmentId,
                    itemCount: donationItems.length,
                    totalItems: donationItems.reduce((sum, item) => sum + parseInt(item.quantity), 0),
                    totalValue: donationItems.reduce((sum, item) => sum + (parseFloat(item.value) * parseInt(item.quantity)), 0),
                    deliveryMethod: formData.deliveryMethod,
                    hasAppointment: !!formData.scheduleDate,
                    pickupAddress: formData.deliveryMethod === 'pickup' ? formData.pickupAddress : null
                });
                
                // Show success modal
                setShowSuccessModal(true);
                
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

    // Success Modal Component
    const SuccessModal = ({ isOpen, onClose, details }) => {
        if (!isOpen || !details) return null;

        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-3 sm:p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-5 md:p-6 relative max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center min-w-0">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Donation Submitted!</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-medium text-green-800 mb-1.5 sm:mb-2">
                                Success! Your donation request has been submitted.
                            </h4>
                            <p className="text-xs sm:text-sm text-green-700">
                                Your request is now pending approval. You'll receive a notification when it's reviewed.
                            </p>
                        </div>

                        {/* Donation Details */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Donation Summary</h4>
                            
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div>
                                    <span className="text-gray-600">Request ID:</span>
                                    <p className="font-medium text-gray-900">#{details.donationId}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Delivery Method:</span>
                                    <div className="flex items-center">
                                        {details.deliveryMethod === 'pickup' ? (
                                            <HiTruck className="w-4 h-4 text-gray-600 mr-1" />
                                        ) : (
                                            <HiHome className="w-4 h-4 text-gray-600 mr-1" />
                                        )}
                                        <span className="font-medium text-gray-900 capitalize">{details.deliveryMethod}</span>
                                    </div>
                                </div>
                                
                                {/* Display pickup address if delivery method is pickup */}
                                {details.deliveryMethod === 'pickup' && details.pickupAddress && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Pickup Address:</span>
                                        <div className="flex items-start mt-1">
                                            <HiLocationMarker className="w-4 h-4 text-gray-600 mr-1 mt-0.5 flex-shrink-0" />
                                            <p className="font-medium text-gray-900">{details.pickupAddress}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <span className="text-gray-600">Item Types:</span>
                                    <p className="font-medium text-gray-900">{details.itemCount}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Items:</span>
                                    <p className="font-medium text-gray-900">{details.totalItems}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600">Total Value:</span>
                                    <p className="font-medium text-gray-900">₱{details.totalValue.toLocaleString()}</p>
                                </div>
                            </div>

                            {details.hasAppointment && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-blue-600">
                                        <HiCalendar className="w-4 h-4 mr-1" />
                                        <span>Appointment scheduled - you'll receive confirmation details soon.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Staff will review your donation request</li>
                                <li>• You'll receive an email notification with the decision</li>
                                <li>• Check your donation history for updates</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-xs sm:text-sm font-medium transition-colors order-2 sm:order-1"
                        >
                            Submit Another
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                // You could add navigation to donation history here
                            }}
                            className="px-3 sm:px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-md text-xs sm:text-sm font-medium transition-colors order-1 sm:order-2"
                        >
                            View History
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
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

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                details={successDetails}
            />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
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
                    userProfile={userProfile}
                />

                {/* Submit Section */}
                <SubmitSection
                    donationItems={donationItems}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            </form>
        </div>
    );
}