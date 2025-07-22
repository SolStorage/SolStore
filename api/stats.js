const { fileRegistry, sanitizeWallet } = require('../lib/registry');

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = sanitizeWallet(req.query.wallet);
  
  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }
  
  const files = fileRegistry.get(wallet) || [];
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const storageLimit = 1073741824; // 1GB
  
  // Calculate detailed stats
  const stats = {
    totalSize,
    fileCount: files.length,
    storageLimit,
    percentUsed: parseFloat(((totalSize / storageLimit) * 100).toFixed(2)),
    remainingSpace: Math.max(0, storageLimit - totalSize),
    largestFile: files.reduce((max, file) => file.size > max ? file.size : max, 0),
    oldestFile: files.length > 0 ? files.reduce((oldest, file) => 
      new Date(file.uploadDate) < new Date(oldest.uploadDate) ? file : oldest
    ).uploadDate : null,
    fileTypes: files.reduce((types, file) => {
      const type = file.type?.split('/')[0] || 'other';
      types[type] = (types[type] || 0) + 1;
      return types;
    }, {})
  };
  
  // Cache for 30 seconds
  res.setHeader('Cache-Control', 'public, max-age=30');
  
  res.status(200).json(stats);
}

module.exports = handler;