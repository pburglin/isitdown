import React from 'react';
import URLChecker from './URLChecker';
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div>
        <h1>URL Status Checker</h1>
        <URLChecker />
      </div>
    </ErrorBoundary>
  );
};

export default App;
