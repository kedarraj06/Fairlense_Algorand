// frontend/src/components/LoadingOverlay.jsx
// Loading overlay component for better UX

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ 
  isLoading, 
  message = 'Loading...', 
  children,
  overlay = true,
  size = 'large'
}) => {
  if (!isLoading) {
    return children;
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content">
          <LoadingSpinner size={size} text={message} />
        </div>
        <div className="loading-overlay-backdrop">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <LoadingSpinner size={size} text={message} />
      {children}
    </div>
  );
};

export default LoadingOverlay;
