import React from 'react';

const RecentChecks = ({ checks, onCheckAgain }) => {
  return (
    <div>
      <h2>Recent Checks</h2>
      <ul>
        {checks.map((check, index) => (
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
              {new Date(check.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentChecks;
