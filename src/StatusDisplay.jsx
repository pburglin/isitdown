import React from 'react';

const StatusDisplay = ({ result, error }) => {
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }
  if (result) {
    return <div style={{ color: result.up ? 'green' : 'red' }}>
      {result.up ? 'Site is up!' : 'Site is down!'}
    </div>;
  }
  return null;
};

export default StatusDisplay;
