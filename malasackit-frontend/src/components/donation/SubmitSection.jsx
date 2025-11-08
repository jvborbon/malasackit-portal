import { HiCalendar } from 'react-icons/hi';

export function SubmitSection({ donationItems, onSubmit }) {
    return (
        <div className="flex justify-end">
            <SubmitButton 
                donationItems={donationItems}
                onSubmit={onSubmit}
            />
        </div>
    );
}

// Submit Button Component
function SubmitButton({ donationItems, onSubmit }) {
    const isDisabled = donationItems.length === 0;

    return (
        <button
            type="submit"
            onClick={onSubmit}
            disabled={isDisabled}
            className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
            <HiCalendar className="w-5 h-5 mr-2" />
            Confirm Donation
        </button>
    );
}