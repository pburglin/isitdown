import React from 'react';

const URLInput = ({ value, onChange, onEnter }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
  };

  return (
    <input
      type="text"
      placeholder="https://example.com"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={handleKeyPress}
      aria-label="Enter URL to check status"
    />
  );
};

export default URLInput;
