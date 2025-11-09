import React from 'react';
import { HiX } from 'react-icons/hi';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-4xl',
  headerColor = 'bg-red-600',
  showHeader = true
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg ${maxWidth} w-full ${showHeader ? 'max-h-[90vh] overflow-hidden' : ''}`}>
        {/* Header */}
        {showHeader && (
          <div className={`${headerColor} text-white p-4 flex justify-between items-center`}>
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-red-200">
              <HiX className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={showHeader ? "p-6 overflow-y-auto max-h-[calc(90vh-120px)]" : "p-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;