const whois = require('whois-json');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_DIR = '/tmp';

const extractDomain = (url) => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.replace(/^www\./, '');
};

const getCacheFilePath = (domain) => {
  return path.join(CACHE_DIR, `whois-${domain.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
};

const getCachedData = async (domain) => {
  try {
    const cacheFile = getCacheFilePath(domain);
    const data = await fs.readFile(cacheFile, 'utf8');
    const cached = JSON.parse(data);
    
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  } catch (error) {
    // Cache miss or expired
    return null;
  }
  return null;
};

const setCachedData = async (domain, data) => {
  try {
    const cacheFile = getCacheFilePath(domain);
    await fs.writeFile(cacheFile, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

const fetchRDAP = (domain) => {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://rdap.org/domain/${domain}`,
      { timeout: 5000 },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse RDAP response'));
          }
        });
      }
    );
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('RDAP request timeout'));
    });
  });
};

const formatRDAPResponse = (rdapData) => {
  return {
    domain_name: rdapData.handle,
    creation_date: rdapData.events?.find(e => e.eventAction === 'registration')?.eventDate,
    expiration_date: rdapData.events?.find(e => e.eventAction === 'expiration')?.eventDate,
    registrar: rdapData.entities?.[0]?.name,
    status: rdapData.status || []
  };
};

const performWhoisLookup = async (url) => {
  try {
    const domain = extractDomain(url);
    console.log('Looking up domain:', domain);

    // Check cache first
    const cachedData = await getCachedData(domain);
    if (cachedData) {
      return {
        success: true,
        timestamp: Date.now(),
        data: cachedData,
        source: 'cache'
      };
    }

    // Try WHOIS first
    try {
      const result = await whois(domain);
      const processedResult = {
        rawWhois: JSON.stringify(result, null, 2),
        status: Array.isArray(result.status) ? result.status : 
               (result.status ? [result.status] : []).filter(Boolean)
      };
      
      await setCachedData(domain, processedResult);
      
      return {
        success: true,
        timestamp: Date.now(),
        data: processedResult,
        source: 'whois'
      };
    } catch (whoisError) {
      // If we hit rate limit, try RDAP
      if (whoisError.message && whoisError.message.includes('rateLimitExceeded')) {
        console.log('WHOIS rate limit hit, trying RDAP...');
        const rdapResult = await fetchRDAP(domain);
        const processedResult = {
          rawWhois: JSON.stringify(formatRDAPResponse(rdapResult), null, 2),
          status: rdapResult.status || []
        };
        
        await setCachedData(domain, processedResult);
        
        return {
          success: true,
          timestamp: Date.now(),
          data: processedResult,
          source: 'rdap'
        };
      }
      throw whoisError;
    }
  } catch (error) {
    console.error('Lookup error:', error);
    return {
      success: false,
      timestamp: Date.now(),
      error: error.message || 'Failed to perform lookup',
      source: error.message.includes('rateLimitExceeded') ? 'rate_limited' : 'error'
    };
  }
};

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
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

    const result = await performWhoisLookup(url);
    
    return {
      statusCode: result.success ? 200 : 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Handler error:', error);
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