import React from 'react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  details = null,
  buttonText = "Continue",
  icon = "check" // check, checkCircle, star, trophy, heart, thumbsUp
}) => {
  if (!isOpen) return null;

  const getIcon = (iconType) => {
    const iconClasses = "h-8 w-8 text-green-600";
    
    switch (iconType) {
      case 'checkCircle':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'star':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        );
      case 'trophy':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10a8.5 8.5 0 01-4.5 7.5A8.5 8.5 0 016 10M12 10V6a6 6 0 016 6 6 6 0 01-6 6V10z"></path>
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
        );
      case 'thumbsUp':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
          </svg>
        );
      default: // check
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
    }
  };

  const renderDetails = () => {
    if (!details) return null;

    // If details is a simple object with key-value pairs
    if (typeof details === 'object' && !Array.isArray(details)) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm space-y-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="text-gray-900">
                  {typeof value === 'number' && key.toLowerCase().includes('value') 
                    ? `₱${parseFloat(value).toFixed(2)}`
                    : value
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // If details is an array of items
    if (Array.isArray(details)) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm space-y-2">
            {details.map((item, index) => (
              <div key={index} className="text-gray-900">
                • {item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // If details is a string or JSX
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <div className="text-sm text-gray-900">
          {details}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-modal-slide-in">
          <div className="p-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              {getIcon(icon)}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {title}
            </h3>
            
            {/* Message */}
            <p className="text-sm text-gray-600 mb-6">
              {message}
            </p>
            
            {/* Details */}
            {renderDetails()}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;