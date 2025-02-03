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
  const [protocol, setProtocol] = useState('https://');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  const handleCheckStatus = async () => {
    const fullURL = protocol + inputURL;
    if (!validateURL(fullURL)) {
      setErrorMessage('Please enter a valid URL (e.g., www.example.com)');
      return;
    }
    
    setErrorMessage('');
    setIsChecking(true);
    
    try {
      const status = await checkURLStatus(fullURL);
      setStatusResult(status);
      
      setRecentChecks(prev => {
        const newChecks = [...prev, {
          url: fullURL,
          ...status,
          timestamp: Date.now()
        }].slice(-10); // Keep only the last 10 checks
        persistChecks(newChecks);
        return newChecks;
      });
    } finally {
      setIsChecking(false);
    }
  };

  const clearHistory = () => {
    setRecentChecks([]);
    sessionStorage.removeItem('recentChecks');
  };

  const handleCheckAgain = async (url) => {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    const protocolFromUrl = url.startsWith('https://') ? 'https://' : 'http://';
    setProtocol(protocolFromUrl);
    setInputURL(urlWithoutProtocol);
    
    setErrorMessage('');
    setIsChecking(true);
    
    try {
      const status = await checkURLStatus(url);
      setStatusResult(status);
      
      setRecentChecks(prev => {
        const newChecks = [...prev, {
          url: url,
          ...status,
          timestamp: Date.now()
        }].slice(-10); // Keep only the last 10 checks
        persistChecks(newChecks);
        return newChecks;
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!statusResult || !autoRefresh) {
      setNextRefreshTime(null);
      return;
    }
    
    const interval = setInterval(() => {
      handleCheckStatus();
      setNextRefreshTime(Date.now() + 60000);
    }, 60000);

    setNextRefreshTime(Date.now() + 60000);
    return () => clearInterval(interval);
  }, [statusResult?.url, autoRefresh]); // Re-run when URL or autoRefresh changes
// Update countdown timer
useEffect(() => {
  if (!autoRefresh || !nextRefreshTime) {
    setCountdown(null);
    return;
  }
  
  const updateCountdown = () => {
    const remaining = Math.max(0, Math.round((nextRefreshTime - Date.now()) / 1000));
    setCountdown(remaining);
  };
  
  updateCountdown(); // Initial update
  const timerInterval = setInterval(updateCountdown, 1000);
  
  return () => clearInterval(timerInterval);
}, [autoRefresh, nextRefreshTime]);


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
      
      {statusResult && (
        <div className="auto-refresh-container">
          <label className="auto-refresh-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every 60 seconds
          </label>
          {autoRefresh && countdown !== null && (
            <span className="countdown">
              Next refresh in {countdown}s
            </span>
          )}
        </div>
      )}
      
      <RecentChecks checks={recentChecks} onCheckAgain={handleCheckAgain} onClearHistory={clearHistory} />
    </div>
  );
};

export default URLChecker;
