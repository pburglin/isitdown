import React from 'react';

const RecentChecks = ({ checks, onCheckAgain, onClearHistory }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Recent Checks</h2>
        <button
          onClick={onClearHistory}
          style={{ fontSize: '1rem', padding: '0.2rem 0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          X
        </button>
      </div>
      <ul>
        {checks.slice().reverse().map((check, index) => (
          <li key={index}>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCheckAgain(check.url);
              }}
            >
              {check.url}: {check.status.up ? 'Up' : 'Down'} (HTTP {check.status})
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
