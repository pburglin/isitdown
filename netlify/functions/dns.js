const dns = require('dns').promises;

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { hostname } = JSON.parse(event.body);
    if (!hostname) {
      throw new Error('Hostname is required');
    }

    // Fetch different types of DNS records in parallel
    const [aRecords, aaaaRecords, mxRecords, txtRecords] = await Promise.all([
      dns.resolve4(hostname).catch(() => []),
      dns.resolve6(hostname).catch(() => []),
      dns.resolveMx(hostname).catch(() => []),
      dns.resolveTxt(hostname).catch(() => [])
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        a: aRecords,
        aaaa: aaaaRecords,
        mx: mxRecords,
        txt: txtRecords.map(txt => txt.join('')), // TXT records come as arrays of strings
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message || 'Failed to fetch DNS records'
      })
    };
  }
};