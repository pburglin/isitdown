const whois = require('whois-json');
const { URL } = require('url');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const performWhoisLookup = async (url) => {
  try {
    // Extract domain from URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Perform WHOIS lookup
    const result = await whois(domain);
    
    return {
      success: true,
      timestamp: Date.now(),
      data: {
        domainName: result.domainName,
        registrar: result.registrar,
        registrarUrl: result.registrarUrl,
        creationDate: result.creationDate,
        expirationDate: result.expirationDate,
        updatedDate: result.updatedDate,
        nameServers: result.nameServers,
        registrant: {
          organization: result.registrantOrganization || 'Private',
          country: result.registrantCountry || 'Not available'
        },
        status: result.status
      }
    };
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    return {
      success: false,
      timestamp: Date.now(),
      error: error.message || 'Failed to perform WHOIS lookup'
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