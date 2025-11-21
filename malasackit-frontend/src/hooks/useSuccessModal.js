import { useState } from 'react';

export const useSuccessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    details: null,
    buttonText: 'Continue',
    icon: 'check'
  });

  const showSuccess = ({
    title,
    message,
    details = null,
    buttonText = 'Continue',
    icon = 'check'
  }) => {
    setModalData({
      title,
      message,
      details,
      buttonText,
      icon
    });
    setIsOpen(true);
  };

  const hideSuccess = () => {
    console.log('🔵 hideSuccess called - closing modal');
    setIsOpen(false);
  };

  const reset = () => {
    setIsOpen(false);
    setModalData({
      title: '',
      message: '',
      details: null,
      buttonText: 'Continue',
      icon: 'check'
    });
  };

  return {
    isOpen,
    modalData,
    showSuccess,
    hideSuccess,
    reset
  };
};