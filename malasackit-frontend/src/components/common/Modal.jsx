import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ 
        zIndex: 99999, 
        position: 'fixed', 
        width: '100vw', 
        height: '100vh', 
        top: 0, 
        left: 0 
      }}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full my-8 ${showHeader ? 'max-h-[calc(100vh-4rem)] overflow-hidden' : ''}`}
        style={{ position: 'relative', zIndex: 100000 }}
      >
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
        <div className={showHeader ? "p-6 overflow-y-auto max-h-[calc(100vh-10rem)]" : "p-6"}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;