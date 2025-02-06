import React, { useState } from 'react'
import { validateURL } from './utils'
import URLInput from './URLInput'

const DNSChecker = () => {
  const [inputURL, setInputURL] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState(null)
  const [error, setError] = useState(null)
  const [protocol, setProtocol] = useState('https://')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullURL = protocol + inputURL
    
    if (!validateURL(fullURL)) {
      setError('Please enter a valid URL (e.g., www.example.com)')
      return
    }

    setLoading(true)
    setError(null)
    setRecords(null)

    try {
      const hostname = new URL(fullURL).hostname
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
        <div className="input-group">
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            aria-label="Select URL protocol"
          >
            <option value="http://">http://</option>
            <option value="https://">https://</option>
          </select>
          <URLInput
            value={inputURL}
            onChange={setInputURL}
            onEnter={handleSubmit}
            placeholder="www.example.com"
          />
          <button type="submit" disabled={loading} className="check-button">
            {loading ? 'Checking...' : 'Check DNS Records'}
          </button>
        </div>
      </form>

      {error &&
      <div className="status-message error">
        Error: {error}
      </div>
      }

      {records && (
        <div className="results-container">
          <br/>
          <h3>DNS Records for {new URL(protocol + inputURL).hostname}</h3>
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