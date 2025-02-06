const whois = require('whois-json');
const { URL } = require('url');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const extractDomain = (url) => {
  const parsedUrl = new URL(url);
  // Remove 'www.' if present and get the base domain
  return parsedUrl.hostname.replace(/^www\./, '');
};

const getValueFromMultipleKeys = (obj, keys) => {
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
  return null;
};

const performWhoisLookup = async (url) => {
  try {
    const domain = extractDomain(url);
    console.log('Looking up domain:', domain);

    // Perform WHOIS lookup
    const result = await whois(domain);
    console.log('Raw WHOIS result:', JSON.stringify(result, null, 2));

    // Handle multiple possible property names
    const domainName = getValueFromMultipleKeys(result, ['domainName', 'domain_name', 'name']) || domain;
    const registrar = getValueFromMultipleKeys(result, ['registrar', 'registrarName', 'registrar_name']);
    const creationDate = getValueFromMultipleKeys(result, ['creationDate', 'created', 'creation_date']);
    const expirationDate = getValueFromMultipleKeys(result, ['expirationDate', 'expires', 'expiration_date']);
    const updatedDate = getValueFromMultipleKeys(result, ['updatedDate', 'updated', 'update_date']);
    const organization = getValueFromMultipleKeys(result, ['registrantOrganization', 'registrant_organization', 'org']);
    const country = getValueFromMultipleKeys(result, ['registrantCountry', 'registrant_country', 'country']);
    const nameServers = result.nameServers || result.name_servers || [];
    const status = result.status || result.domain_status || [];

    // Validate that we have at least some basic data
    if (!registrar && !creationDate && !expirationDate) {
      throw new Error('No WHOIS data available for this domain');
    }

    return {
      success: true,
      timestamp: Date.now(),
      data: {
        domainName,
        registrar: registrar || 'Not available',
        creationDate: creationDate || null,
        expirationDate: expirationDate || null,
        updatedDate: updatedDate || null,
        nameServers: Array.isArray(nameServers) ? nameServers : [nameServers].filter(Boolean),
        registrant: {
          organization: organization || 'Private',
          country: country || 'Not available'
        },
        status: Array.isArray(status) ? status : [status].filter(Boolean)
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