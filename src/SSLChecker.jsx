import React, { useState } from 'react'
import URLInput from './URLInput'
import StatusDisplay from './StatusDisplay'

const SSLChecker = () => {
  const [url, setUrl] = useState('')
  const [certInfo, setCertInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleURLChange = (newUrl) => {
    setUrl(newUrl)
  }

  const checkSSL = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setCertInfo(null)
    
    try {
      const response = await fetch('/.netlify/functions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type: 'ssl' }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check SSL certificate')
      }
      
      setCertInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checker-container">
      <div className="input-group">
        <URLInput 
          value={url}
          onChange={handleURLChange}
          onEnter={checkSSL}
          placeholder="Enter website URL (e.g., https://example.com)"
        />
        <button onClick={checkSSL} disabled={loading}>
          {loading ? 'Checking...' : 'Check SSL'}
        </button>
      </div>
      
      {loading && <div className="status-message">Checking SSL certificate...</div>}
      
      {error && (
        <div className="status-message error">
          Error: {error}
        </div>
      )}
      
      {certInfo && !error && (
        <div className="cert-info">
          <h3>SSL Certificate Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Valid:</strong> 
              <span className={certInfo.valid ? 'status-ok' : 'status-error'}>
                {certInfo.valid ? 'Yes' : 'No'}
              </span>
            </div>
            {certInfo.validTo && (
              <div className="info-item">
                <strong>Expires:</strong> {new Date(certInfo.validTo).toLocaleDateString()}
              </div>
            )}
            {certInfo.subject && (
              <div className="info-item">
                <strong>Issued To:</strong> {certInfo.subject}
              </div>
            )}
            {certInfo.issuer && (
              <div className="info-item">
                <strong>Issuer:</strong> {certInfo.issuer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SSLChecker