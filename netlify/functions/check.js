const fetch = require('node-fetch');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const checkURLStatus = async (url) => {
  try {
    console.log('Checking URL:', url);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 
        'User-Agent': 'URLStatusChecker/1.0'
      },
      timeout: 10000
    });
    
    const responseTime = Date.now() - startTime;
    console.log('Response received:', response.status);
    
    return {
      up: response.ok,
      status: response.status,
      timestamp: Date.now(),
      responseTime,
      error: null
    };
  } catch (error) {
    console.log('Error occurred:', error.message);
    return {
      up: false,
      status: 0,
      timestamp: Date.now(),
      responseTime: null,
      error: error.message
    };
  }
};

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content needed for preflight
      headers: corsHeaders
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Request body:', event.body);
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    const status = await checkURLStatus(url);
    console.log('Check completed:', status);
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(status)
    };
  } catch (error) {
    console.log('Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};