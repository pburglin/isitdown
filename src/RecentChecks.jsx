import React from 'react';

const RecentChecks = ({ checks }) => {
  return (
    <div>
      <h2>Recent Checks</h2>
      <ul>
        {checks.map((check, index) => (
          <li key={index}>
            {check.url}: {check.status.up ? 'Up' : 'Down'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentChecks;
