export function FormHeader() {
    return (
        <div className="mb-4 sm:mb-5 md:mb-6">
            <FormTitle />
            <FormDescription />
        </div>
    );
}

// Form Title Component
function FormTitle() {
    return (
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1.5 sm:mb-2">
            What are you donating?
        </h1>
    );
}

// Form Description Component
function FormDescription() {
    return (
        <p className="text-gray-600 text-xs sm:text-sm">
            Every donation is important to us. However, due to logistical considerations, 
            we have limited the items we may receive. Beyond the items indicated, you may 
            contact the SWDA or LGU directly. Thank you for your understanding.
        </p>
    );
}