import React from 'react';

const URLInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    let url = e.target.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url; // Prepend http:// if missing
    }
    onChange(url);
  };

  return (
    <input
      type="text"
      placeholder="Enter URL"
      value={value}
      onChange={handleChange}
    />
  );
};

export default URLInput;
