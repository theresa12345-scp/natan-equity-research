// Vercel Serverless Function - Yahoo Finance API Proxy
// Handles all /api/yahoo/* routes

export default async function handler(req, res) {
  // Get the path from the URL (e.g., /api/yahoo/v7/finance/quote -> v7/finance/quote)
  const { path } = req.query;
  const yahooPath = Array.isArray(path) ? path.join('/') : path;

  // Build the Yahoo Finance URL
  const queryString = new URLSearchParams(req.query);
  queryString.delete('path'); // Remove the path parameter

  const yahooUrl = `https://query2.finance.yahoo.com/${yahooPath}${queryString.toString() ? '?' + queryString.toString() : ''}`;

  try {
    const response = await fetch(yahooUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    // Get the response data
    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set content type based on response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Return the response
    res.status(response.status).send(data);

  } catch (error) {
    console.error('Yahoo Finance API proxy error:', error);
    res.status(500).json({
      error: 'Failed to fetch from Yahoo Finance',
      message: error.message
    });
  }
}
