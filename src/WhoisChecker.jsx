import { useState } from 'react';
import { performWhoisLookup } from './utils';
import URLInput from './URLInput';

export default function WhoisChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(null);
  const [error, setError] = useState(null);

  const checkWhois = async () => {
    setLoading(true);
    setError(null);
    setWhoisData(null);

    try {
      const result = await performWhoisLookup(url);
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
        <URLInput
          value={url}
          onChange={setUrl}
          onEnter={checkWhois}
          placeholder="Enter website URL (e.g., https://example.com)"
        />
        <button
          onClick={checkWhois}
          disabled={loading || !url.trim()}
          className={`px-4 py-2 rounded ${
            loading || !url.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Checking...' : 'Check WHOIS'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {whoisData && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Domain Information</h3>
              <ul className="mt-2 space-y-2 pl-4">
                <li><span className="text-gray-600">Domain Name:</span> {whoisData.domainName}</li>
                <li><span className="text-gray-600">Registrar:</span> {whoisData.registrar || 'Not available'}</li>
                <li><span className="text-gray-600">Creation Date:</span> {formatDate(whoisData.creationDate)}</li>
                <li><span className="text-gray-600">Expiration Date:</span> {formatDate(whoisData.expirationDate)}</li>
                <li><span className="text-gray-600">Last Updated:</span> {formatDate(whoisData.updatedDate)}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700">Registrant Information</h3>
              <ul className="mt-2 space-y-2 pl-4">
                <li><span className="text-gray-600">Organization:</span> {whoisData.registrant.organization}</li>
                <li><span className="text-gray-600">Country:</span> {whoisData.registrant.country}</li>
              </ul>
            </div>
          </div>

          {whoisData.nameServers && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Name Servers</h3>
              <ul className="mt-2 list-disc list-inside pl-4">
                {Array.isArray(whoisData.nameServers) 
                  ? whoisData.nameServers.map((ns, index) => (
                      <li key={index} className="text-gray-600">{ns}</li>
                    ))
                  : <li className="text-gray-600">{whoisData.nameServers}</li>
                }
              </ul>
            </div>
          )}

          {whoisData.status && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Domain Status</h3>
              <ul className="mt-2 list-disc list-inside pl-4">
                {Array.isArray(whoisData.status)
                  ? whoisData.status.map((status, index) => (
                      <li key={index} className="text-gray-600">{status}</li>
                    ))
                  : <li className="text-gray-600">{whoisData.status}</li>
                }
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}