import React, { useState } from 'react'
import URLChecker from './URLChecker'
import SSLChecker from './SSLChecker'
import WhoisChecker from './WhoisChecker'
import DNSChecker from './DNSChecker'
import ErrorBoundary from './ErrorBoundary'

const App = () => {
  const [activeTab, setActiveTab] = useState('url')
  const [sharedURL, setSharedURL] = useState('')
  const [sharedProtocol, setSharedProtocol] = useState('https://')

  const tabs = [
    { id: 'url', label: 'URL Status Check', component: URLChecker },
    { id: 'ssl', label: 'SSL Certificate Check', component: SSLChecker },
    { id: 'whois', label: 'WHOIS Lookup', component: WhoisChecker },
    { id: 'dns', label: 'DNS Lookup', component: DNSChecker }
  ]

  return (
    <ErrorBoundary>
      <div className="app-container">
        <h1 style={{ textAlign: 'center' }}>Site Check</h1>
        <p style={{ textAlign: 'center', margin: '1rem 0' }}>
          Check website status, SSL certificates, and more. Select a tool below to get started.
        </p>
        
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          {tabs.map(tab => (
            <div
              key={tab.id}
              style={{ display: activeTab === tab.id ? 'block' : 'none' }}
            >
              <tab.component
                inputURL={sharedURL}
                setInputURL={setSharedURL}
                protocol={sharedProtocol}
                setProtocol={setSharedProtocol}
              />
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
