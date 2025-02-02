export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function checkURLStatus(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
      headers: { 'User-Agent': 'URLStatusChecker/1.0' }
    });
    const responseTime = Date.now() - startTime;
    
    return {
      up: response.ok,
      status: response.status,
      timestamp: Date.now(),
      responseTime,
      error: null
    };
  } catch (error) {
    return {
      up: false,
      status: 0,
      timestamp: Date.now(),
      responseTime: null,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function persistChecks(checks) {
  const limitedChecks = checks.slice(-10); // Keep last 10 checks
  sessionStorage.setItem('recentChecks', JSON.stringify(limitedChecks));
}
