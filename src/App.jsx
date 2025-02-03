import React from 'react'
import URLChecker from './URLChecker'
import ErrorBoundary from './ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <div className="app-container">
      <h1 style={{ textAlign: 'center' }}>URL Status Checker</h1>
      <p style={{ textAlign: 'center', margin: '1rem 0' }}>
        Did you ever see a website down and wondered if the problem is on their side or with your internet connection? Use this tool and wonder no more. Just enter the website's address to perform a fresh site status test in real time.
      </p>
      <URLChecker />
    </div>
  </ErrorBoundary>
)

export default App
