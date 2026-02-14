export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get endpoint from query
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  try {
    const apiUrl = `https://www.sankavollerei.com/novel/sakuranovel${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
}
