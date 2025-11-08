import { useState } from 'react';

// Import organized components
import { FormHeader } from './donation/DonationFormHeader';
import { DonationModal } from './donation/DonationModal';
import { DonationItemsDisplay } from './donation/DonationItemsDisplay';
import { ProhibitedDonations } from './donation/ProhibitedDonations';
import { DonationDetails } from './donation/DonationDetails';
import { SubmitSection } from './donation/SubmitSection';

export default function DonorDonationForm() {
    const [formData, setFormData] = useState({
        deliveryMethod: 'pickup',
        description: '',
        scheduleDate: ''
    });

    const [donationItems, setDonationItems] = useState([]);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Food Items');
    const [selectedItems, setSelectedItems] = useState([]);

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
        setActiveCategory('Food Items');
    };

    const updateDonationItem = (itemId, field, value) => {
        setDonationItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const removeDonationItem = (itemId) => {
        setDonationItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (donationItems.length === 0) {
            alert('Please add at least one donation item.');
            return;
        }
        
        // Check if all items have required fields
        const incompleteItems = donationItems.filter(item => !item.quantity || !item.value);
        if (incompleteItems.length > 0) {
            alert('Please fill in quantity and value for all donation items.');
            return;
        }
        
        const donationData = {
            items: donationItems.map(item => ({
                ...item,
                quantity: parseInt(item.quantity),
                value: parseFloat(item.value)
            })),
            deliveryMethod: formData.deliveryMethod,
            description: formData.description,
            scheduleDate: formData.scheduleDate,
            submittedAt: new Date().toISOString()
        };
        
        console.log('Donation submitted:', donationData);
        alert('Donation submitted successfully!');
        
        // Reset form
        setDonationItems([]);
        setSelectedItems([]);
        setFormData({
            deliveryMethod: 'pickup',
            description: '',
            scheduleDate: ''
        });
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
                />
            </form>
        </div>
    );
}