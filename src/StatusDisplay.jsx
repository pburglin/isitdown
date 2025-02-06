import React from 'react';

const HTTP_STATUS_CODES = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  206: "Partial Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout"
};

const StatusDisplay = ({ result, error }) => {
  if (error) {
    return (
      <div className="status-message error">
        ⚠️ {error}
      </div>
    );
  }
  
  if (!result) return null;

  const getMDNLink = (code) => `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${code}`;

  return (
    <div className={`status-message ${result.up ? 'up' : 'down'}`}>
      {result.up ? (
        <span>
          ✅ Online (HTTP{' '}
          <a 
            href={getMDNLink(result.status)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {result.status}
          </a>
          {HTTP_STATUS_CODES[result.status] && (
            <>
              {' • '}
              <a 
                href={getMDNLink(result.status)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {HTTP_STATUS_CODES[result.status]}
              </a>
            </>
          )}
          {' • '}{result.responseTime}ms)
        </span>
      ) : (
        <span>❌ Offline • {result.error || '(HTTP{' '}
          <a 
            href={getMDNLink(result.status)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {result.status}
          </a>
          {HTTP_STATUS_CODES[result.status] && (
            <>
              {' • '}
              <a 
                href={getMDNLink(result.status)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {HTTP_STATUS_CODES[result.status]}
              </a>
            </>
          )}
          {' • '}{result.responseTime}ms)'}</span>
      )}
      <div className="timestamp">
        Last checked: {new Date(result.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StatusDisplay;
