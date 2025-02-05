import React, { useState } from 'react'
import { isValidUrl } from './utils'

const DNSChecker = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRecords(null)

    try {
      if (!isValidUrl(url)) {
        throw new Error('Please enter a valid URL')
      }

      const hostname = new URL(url).hostname
      const response = await fetch('/.netlify/functions/dns', {
        method: 'POST',
        body: JSON.stringify({ hostname }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch DNS records')
      }

      const data = await response.json()
      setRecords(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checker-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to check DNS records"
          className="url-input"
        />
        <button type="submit" disabled={loading} className="check-button">
          {loading ? 'Checking...' : 'Check DNS Records'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {records && (
        <div className="results-container">
          <h3>DNS Records for {new URL(url).hostname}</h3>
          {records.a && records.a.length > 0 && (
            <div className="record-section">
              <h4>A Records</h4>
              <ul>
                {records.a.map((record, i) => (
                  <li key={i}>{record}</li>
                ))}
              </ul>
            </div>
          )}
          {records.aaaa && records.aaaa.length > 0 && (
            <div className="record-section">
              <h4>AAAA Records</h4>
              <ul>
                {records.aaaa.map((record, i) => (
                  <li key={i}>{record}</li>
                ))}
              </ul>
            </div>
          )}
          {records.mx && records.mx.length > 0 && (
            <div className="record-section">
              <h4>MX Records</h4>
              <ul>
                {records.mx.map((record, i) => (
                  <li key={i}>{`Priority: ${record.priority}, Exchange: ${record.exchange}`}</li>
                ))}
              </ul>
            </div>
          )}
          {records.txt && records.txt.length > 0 && (
            <div className="record-section">
              <h4>TXT Records</h4>
              <ul>
                {records.txt.map((record, i) => (
                  <li key={i}>{record}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DNSChecker