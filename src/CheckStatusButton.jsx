import React from 'react';

const CheckStatusButton = ({ onClick, isLoading }) => {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      style={{
        padding: '0.5rem 1rem',
        background: isLoading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading ? 'Checking...' : 'Check Status'}
    </button>
  );
};

export default CheckStatusButton;
