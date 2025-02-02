import React, { useState, useEffect } from 'react';
import URLInput from './URLInput';
import CheckStatusButton from './CheckStatusButton';
import StatusDisplay from './StatusDisplay';
import RecentChecks from './RecentChecks';
import { validateURL, checkURLStatus } from './utils';

const URLChecker = () => {
  const [inputURL, setInputURL] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentChecks, setRecentChecks] = useState(() => {
    const savedChecks = sessionStorage.getItem('recentChecks');
    return savedChecks ? JSON.parse(savedChecks) : [];
  });

  const handleCheckStatus = async () => {
    if (!validateURL(inputURL)) {
      setErrorMessage('Invalid URL format. Please correct it.');
      return;
    }
    setErrorMessage('');
    const status = await checkURLStatus(inputURL);
    setStatusResult(status);
    const newCheck = { url: inputURL, status };
    setRecentChecks((prevChecks) => {
      const updatedChecks = [...prevChecks, newCheck];
      sessionStorage.setItem('recentChecks', JSON.stringify(updatedChecks));
      return updatedChecks;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (statusResult) {
        handleCheckStatus();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [statusResult]);

  return (
    <div>
      <URLInput value={inputURL} onChange={setInputURL} />
      <CheckStatusButton onClick={handleCheckStatus} />
      <StatusDisplay result={statusResult} error={errorMessage} />
      <RecentChecks checks={recentChecks} />
    </div>
  );
};

export default URLChecker;
