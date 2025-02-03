export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://imaginative-peony-1093fd.netlify.app'
  : '';

export async function checkURLStatus(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error('Server error');
    }

    const result = await response.json();
    return result;
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
