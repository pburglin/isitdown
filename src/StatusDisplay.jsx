import React from 'react';

const StatusDisplay = ({ result, error }) => {
  if (error) {
    return (
      <div className="status-message error">
        ⚠️ {error}
      </div>
    );
  }
  
  if (!result) return null;

  return (
    <div className={`status-message ${result.up ? 'up' : 'down'}`}>
      {result.up ? (
        <span>✅ Online (HTTP {result.status} • {result.responseTime}ms)</span>
      ) : (
        <span>❌ Offline • {result.error || 'Connection failed'}</span>
      )}
      <div className="timestamp">
        Last checked: {new Date(result.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StatusDisplay;
