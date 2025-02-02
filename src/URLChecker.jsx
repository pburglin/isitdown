import React, { useState, useEffect } from 'react';
import URLInput from './URLInput';
import CheckStatusButton from './CheckStatusButton';
import StatusDisplay from './StatusDisplay';
import RecentChecks from './RecentChecks';
import { validateURL, checkURLStatus, persistChecks } from './utils';

const URLChecker = () => {
  const [inputURL, setInputURL] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [recentChecks, setRecentChecks] = useState(
    JSON.parse(sessionStorage.getItem('recentChecks') || '[]')
  );

  const handleCheckStatus = async () => {
    if (!validateURL(inputURL)) {
      setErrorMessage('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    setErrorMessage('');
    setIsChecking(true);
    
    try {
      const status = await checkURLStatus(inputURL);
      setStatusResult(status);
      
      setRecentChecks(prev => {
        const newChecks = [...prev, { 
          url: inputURL, 
          ...status,
          timestamp: Date.now() 
        }];
        persistChecks(newChecks);
        return newChecks;
      });
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
        <URLInput 
          value={inputURL} 
          onChange={setInputURL} 
          onEnter={handleCheckStatus}
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
