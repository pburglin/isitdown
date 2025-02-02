import React from 'react'
import URLChecker from './URLChecker'
import ErrorBoundary from './ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <div className="app-container">
      <h1 style={{ textAlign: 'center' }}>URL Status Checker</h1>
      <URLChecker />
    </div>
  </ErrorBoundary>
)

export default App
