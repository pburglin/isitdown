import React from 'react';

const RecentChecks = ({ checks, onCheckAgain, onClearHistory }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Recent Checks</h2>
        <button
          onClick={onClearHistory}
          style={{
            fontSize: '1rem',
            padding: '0.2rem 0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          X
        </button>
      </div>
      <ul>
        {checks.slice().reverse().map((check, index) => (
          <li key={index}>
            <span style={{ 
              color: check.up ? '#22c55e' : '#ef4444',
              marginRight: '8px',
              fontWeight: 'bold'
            }}>
              {check.up ? '✓' : '✗'}
            </span>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCheckAgain(check.url);
              }}
            >
              {check.url}: {check.up ? 'Up' : 'Down'} (HTTP {check.status})
            </a>
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#777' }}>
              {new Date(check.timestamp).toLocaleDateString()}   {new Date(check.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentChecks;
