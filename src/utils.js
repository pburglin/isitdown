export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function checkURLStatus(url) {
  try {
    const response = await fetch('/.netlify/functions/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(errorData.error || 'Server error');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('URL check error:', error);
    return {
      up: false,
      status: 0,
      timestamp: Date.now(),
      responseTime: null,
      error: error.message || 'Failed to check URL status'
    };
  }
}

export function persistChecks(checks) {
  const limitedChecks = checks.slice(-10); // Keep last 10 checks
  sessionStorage.setItem('recentChecks', JSON.stringify(limitedChecks));
}
