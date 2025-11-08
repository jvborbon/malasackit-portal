export function ProhibitedDonations() {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ProhibitedHeader />
            <ProhibitedDescription />
            <ProhibitedItemsList />
        </div>
    );
}

// Header Component
function ProhibitedHeader() {
    return (
        <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            🚫 Prohibited Donations
        </h3>
    );
}

// Description Component
function ProhibitedDescription() {
    return (
        <p className="text-sm text-red-700 mb-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700">
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
        <div>
            <h4 className="font-semibold text-red-800 mb-2">{title}</h4>
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index}>• {item}</li>
                ))}
            </ul>
        </div>
    );
}