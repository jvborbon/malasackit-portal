import { HiCalendar, HiExclamationCircle } from 'react-icons/hi';

export function SubmitSection({ 
    donationItems, 
    onSubmit, 
    isSubmitting, 
    submitError
}) {
    return (
        <div className="space-y-4">
            {/* Error Message */}
            {submitError && (
                <ErrorMessage message={submitError} />
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
                <SubmitButton 
                    donationItems={donationItems}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
}

// Error Message Component
function ErrorMessage({ message }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <HiExclamationCircle className="w-5 h-5 text-red-900 mr-3 mt-0.5 flex-shrink-0" />
            <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">
                    Submission Error
                </h4>
                <p className="text-sm text-red-900">
                    {message}
                </p>
            </div>
        </div>
    );
}



// Submit Button Component
function SubmitButton({ donationItems, onSubmit, isSubmitting, disabled }) {
    const isDisabled = donationItems.length === 0 || disabled;

    return (
        <button
            type="submit"
            onClick={onSubmit}
            disabled={isDisabled}
            className="bg-theme-primary text-white py-3 px-8 rounded-lg hover:bg-theme-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[200px] justify-center"
        >
            {isSubmitting ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                </>
            ) : (
                <>
                    <HiCalendar className="w-5 h-5 mr-2" />
                    Confirm Donation
                </>
            )}
        </button>
    );
}