import { useState } from 'react';
import { performWhoisLookup, validateURL } from './utils';
import URLInput from './URLInput';

export default function WhoisChecker({ inputURL, setInputURL, protocol, setProtocol }) {
  const [loading, setLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(null);
  const [error, setError] = useState(null);

  const checkWhois = async () => {
    const fullURL = protocol + inputURL;
    if (!validateURL(fullURL)) {
      setError('Please enter a valid URL (e.g., www.example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setWhoisData(null);

    try {
      const result = await performWhoisLookup(fullURL);
      if (result.success) {
        setWhoisData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="checker-container">
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
          onEnter={checkWhois}
          placeholder="www.example.com"
        />
        <button
          onClick={checkWhois}
          disabled={loading || !inputURL.trim()}
          className="check-button"
        >
          {loading ? 'Checking...' : 'Check WHOIS'}
        </button>
      </div>

      {error && (
        <div className="status-message error">
          Error: {error}
        </div>
      )}

      {whoisData && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Domain Information</h3>
              <div className="bg-gray-100 p-4 rounded-lg text-sm space-y-1">
                {Object.entries(JSON.parse(whoisData.rawWhois)).map(([key, value], index) => (
                  <div key={index}>
                    <strong>{key}</strong>: {String(value)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}