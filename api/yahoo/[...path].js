// Vercel Serverless Function - Yahoo Finance API Proxy
// Handles all /api/yahoo/* routes

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Get the path from the URL
  // Vercel passes the catch-all path segments as an array in req.query.path
  const { path, ...queryParams } = req.query;

  // Build the Yahoo path from the path array
  const yahooPath = Array.isArray(path) ? path.join('/') : (path || '');

  // Build query string from remaining params
  const queryString = new URLSearchParams(queryParams).toString();

  // Build the full Yahoo Finance URL
  const yahooUrl = `https://query2.finance.yahoo.com/${yahooPath}${queryString ? '?' + queryString : ''}`;

  console.log('Proxying to Yahoo Finance:', yahooUrl);

  try {
    const response = await fetch(yahooUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://finance.yahoo.com',
        'Referer': 'https://finance.yahoo.com/',
      },
    });

    // Get the response data
    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    // Set content type
    res.setHeader('Content-Type', 'application/json');

    // Return the response
    return res.status(response.status).send(data);

  } catch (error) {
    console.error('Yahoo Finance API proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Failed to fetch from Yahoo Finance',
      message: error.message,
      url: yahooUrl
    });
  }
}
