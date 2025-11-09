export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Approved':
      return 'bg-blue-100 text-blue-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatDate = (date, format = 'short') => {
  if (!date) return 'Not scheduled';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (value) => {
  return `₱${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export const formatTime = (timeString) => {
  if (!timeString) return 'Not specified';
  
  // Handle both HH:MM:SS and HH:MM formats
  const timeParts = timeString.split(':');
  let hours = parseInt(timeParts[0]);
  const minutes = timeParts[1] || '00';
  
  // Validate input
  if (isNaN(hours) || hours < 0 || hours > 23) {
    return timeString; // Return original if invalid
  }
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  return `${hours}:${minutes} ${ampm}`;
};