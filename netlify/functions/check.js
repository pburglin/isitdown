const fetch = require('node-fetch');
const tls = require('tls');
const { URL } = require('url');

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

const checkSSLCertificate = (urlString) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const options = {
        host: url.hostname,
        port: url.port || 443,
        servername: url.hostname
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        
        if (!cert) {
          resolve({
            valid: false,
            error: 'No certificate found'
          });
          return;
        }

        const now = Date.now();
        const validFrom = new Date(cert.valid_from).getTime();
        const validTo = new Date(cert.valid_to).getTime();
        const valid = now > validFrom && now < validTo;

        resolve({
          valid,
          subject: cert.subject.CN,
          issuer: cert.issuer.CN,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          protocol: socket.getProtocol()
        });
      });

      socket.on('error', (error) => {
        socket.end();
        resolve({
          valid: false,
          error: error.message
        });
      });

      // Set timeout for SSL check
      socket.setTimeout(10000, () => {
        socket.end();
        resolve({
          valid: false,
          error: 'Connection timed out'
        });
      });

    } catch (error) {
      resolve({
        valid: false,
        error: error.message
      });
    }
  });
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
    const { url, type } = JSON.parse(event.body);
    
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

    let result;
    if (type === 'ssl') {
      result = await checkSSLCertificate(url);
    } else {
      result = await checkURLStatus(url);
    }
    
    console.log('Check completed:', result);
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
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