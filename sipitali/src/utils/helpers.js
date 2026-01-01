// Helper functions

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  // Assuming time is in HH:mm format
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    cancelled: '#ef4444',
    completed: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

export const getStatusLabel = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

