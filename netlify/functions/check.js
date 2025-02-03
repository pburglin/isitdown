const fetch = require('node-fetch');

const checkURLStatus = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'HEAD',
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
};

module.exports = async (req, context) => {
  // Add CORS headers for preflight requests
  if (req.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (req.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(req.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    const status = await checkURLStatus(url);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(status)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};