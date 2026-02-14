const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Base URL
const API_BASE = 'https://www.sankavollerei.com/novel/sakuranovel';

// Proxy endpoint untuk semua API calls
app.get('/api/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api', '');
    const queryString = req.url.split('?')[1];
    const apiUrl = `${API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log('Fetching:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://sakuranovel.id/',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Serve index.html untuk root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 Sakura Novel Reader running on http://localhost:${PORT}`);
  console.log(`📚 API Proxy: http://localhost:${PORT}/api/*`);
});
