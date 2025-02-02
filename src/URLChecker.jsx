import React, { useState, useEffect } from 'react';
import URLInput from './URLInput';
import CheckStatusButton from './CheckStatusButton';
import StatusDisplay from './StatusDisplay';
import RecentChecks from './RecentChecks';
import { validateURL, persistChecks } from './utils';

const URLChecker = () => {
  const [inputURL, setInputURL] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [recentChecks, setRecentChecks] = useState(
    JSON.parse(sessionStorage.getItem('recentChecks') || '[]')
  );
  const [protocol, setProtocol] = useState('https://');

  const handleCheckStatus = async () => {
    const fullURL = protocol + inputURL;
    if (!validateURL(fullURL)) {
      setErrorMessage('Please enter a valid URL (e.g., www.example.com)');
      return;
    }
    
    setErrorMessage('');
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullURL }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check URL status');
      }
      
      const status = await response.json();
      setStatusResult(status);
      
      setRecentChecks(prev => {
        const newChecks = [...prev, { 
          url: fullURL, 
          ...status,
          timestamp: Date.now() 
        }];
        persistChecks(newChecks);
        return newChecks;
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!statusResult) return;
    
    const interval = setInterval(() => {
      handleCheckStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [statusResult?.url]); // Re-run when URL changes

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
          onEnter={handleCheckStatus}
          placeholder="www.example.com"
        />
        <CheckStatusButton 
          onClick={handleCheckStatus} 
          isLoading={isChecking}
        />
      </div>
      
      <StatusDisplay result={statusResult} error={errorMessage} />
      <RecentChecks checks={recentChecks} />
    </div>
  );
};

export default URLChecker;
