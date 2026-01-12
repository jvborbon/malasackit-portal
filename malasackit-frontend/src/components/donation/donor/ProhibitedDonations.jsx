import { useState } from 'react';
import { createPortal } from 'react-dom';
import { HiExclamationCircle, HiX } from 'react-icons/hi';

export function ProhibitedDonations() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Clickable Trigger */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-red-900 hover:text-red-950 transition-colors duration-200 group"
            >
                <HiExclamationCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base font-medium underline">
                    Show Prohibited Donations
                </span>
            </button>

            {/* Modal */}
            {isModalOpen && createPortal(
                <ProhibitedDonationsModal onClose={() => setIsModalOpen(false)} />,
                document.body
            )}
        </>
    );
}

// Modal Component
function ProhibitedDonationsModal({ onClose }) {
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col my-auto">
                {/* Modal Header */}
                <div className="flex items-start justify-between p-3 sm:p-4 border-b border-red-200 bg-red-50 rounded-t-xl flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <HiExclamationCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-900 flex-shrink-0" />
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-red-900 truncate">
                                Prohibited Donations
                            </h2>
                            <p className="text-xs sm:text-sm text-red-800 mt-0.5">
                                Items we cannot accept
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                        aria-label="Close modal"
                    >
                        <HiX className="w-5 h-5 sm:w-6 sm:h-6 text-red-900" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 lg:p-6">
                    <ProhibitedDescription />
                    <ProhibitedItemsList />
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-900 hover:bg-red-950 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Description Component
function ProhibitedDescription() {
    return (
        <p className="text-sm sm:text-base text-red-900 mb-4 sm:mb-6 leading-relaxed">
            LASAC reserves the right not to accept a proposed gift for reasons 
            <strong> including, but not limited,</strong> to the following:
        </p>
    );
}

// Prohibited Items List Component
function ProhibitedItemsList() {
    const foodProhibitions = [
        'Food items expiring in less than 6 months (local donations)',
        'Food items expiring in less than 1 year (foreign donations)',
        'Food items that did not pass quality standards',
        'Formula milk not pursuant to Milk Code of the Philippines'
    ];

    const policyProhibitions = [
        'The gift, or gift transaction, involves an illegality.',
        'The gift, or gift transaction, in some manner conflicts with LASAC policies and/or is incompatible with the Social Teachings of the Roman Catholic Church or LASAC Vision, Mission, and Values.',
        'The benefit from the gift is insufficient to offset the extent of administrative and/or legal effort involved in its acceptance.',
        'The gift or transaction inhibits LASAC from seeking gifts from other donors.',
        'The benefit of the gift is outweighed by the potential of negative publicity for LASAC that will result from the transaction.'
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ProhibitionColumn 
                title="Food-Related Restrictions"
                items={foodProhibitions}
            />
            <ProhibitionColumn 
                title="Policy & Legal Restrictions"
                items={policyProhibitions}
            />
        </div>
    );
}

// Individual Column Component
function ProhibitionColumn({ title, items }) {
    return (
        <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-100">
            <h4 className="font-semibold text-red-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                <span className="text-red-900">•</span>
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="text-xs sm:text-sm text-red-900 leading-relaxed pl-4 relative">
                        <span className="absolute left-0 top-1">→</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}