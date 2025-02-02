import React from 'react';

const RecentChecks = ({ checks }) => {
  return (
    <div>
      <h2>Recent Checks</h2>
      <ul>
        {checks.map((check, index) => (
          <li key={index}>
            {check.url}: {check.status.up ? 'Up' : 'Down'} (HTTP {check.status})
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
