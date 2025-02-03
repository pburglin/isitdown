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
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error('Server error');
    }
    
    return await response.json();
  } catch (error) {
    return {
      up: false,
      status: 0,
      timestamp: Date.now(),
      responseTime: null,
      error: error.message
    };
  }
}

export function persistChecks(checks) {
  const limitedChecks = checks.slice(-10); // Keep last 10 checks
  sessionStorage.setItem('recentChecks', JSON.stringify(limitedChecks));
}
