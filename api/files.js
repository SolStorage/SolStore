const { fileRegistry, sanitizeWallet } = require('../lib/registry');

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const wallet = sanitizeWallet(req.query.wallet);
  
  if (!wallet) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }
  
  if (req.method === 'GET') {
    const files = fileRegistry.get(wallet) || [];
    
    // Add cache control
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    
    res.status(200).json({ 
      files,
      count: files.length 
    });
    
  } else if (req.method === 'DELETE') {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID required' });
    }
    
    const files = fileRegistry.get(wallet) || [];
    const fileToDelete = files.find(f => f.id === fileId);
    
    if (!fileToDelete) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Unpin from Pinata
    if (fileToDelete.ipfsHash) {
      try {
        const unpinResponse = await fetch(
          `https://api.pinata.cloud/pinning/unpin/${fileToDelete.ipfsHash}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${process.env.PINATA_JWT}`
            }
          }
        );
        
        if (!unpinResponse.ok) {
          console.error('Failed to unpin from Pinata:', await unpinResponse.text());
        }
      } catch (error) {
        console.error('Unpin error:', error);
        // Continue with deletion even if unpin fails
      }
    }
    
    // Remove from registry
    const filtered = files.filter(f => f.id !== fileId);
    fileRegistry.set(wallet, filtered);
    
    res.status(200).json({ 
      success: true,
      message: 'File deleted successfully' 
    });
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = handler;