const { fileRegistry, sanitizeWallet } = require('../lib/registry');

const config = {
  api: {
    cors: {
      origin: '*',
      methods: ['GET', 'DELETE']
    }
  }
};

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { wallet } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    const walletAddress = sanitizeWallet(wallet);
    
    // If we have Pinata JWT, fetch from Pinata
    if (process.env.PINATA_JWT) {
      try {
        const response = await fetch(`https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"wallet":{"value":"${walletAddress}","op":"eq"}}`, {
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const files = data.rows.map(row => ({
            id: row.id,
            name: row.metadata.name,
            ipfsHash: row.ipfs_pin_hash,
            url: `https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`,
            size: row.size,
            uploadDate: row.date_pinned,
            owner: walletAddress,
            encrypted: row.metadata.keyvalues?.encrypted === 'true',
            type: row.metadata.keyvalues?.originalType || 'application/octet-stream'
          }));
          
          return res.status(200).json({ files });
        }
      } catch (error) {
        console.error('Pinata fetch error:', error);
      }
    }
    
    // Fallback to in-memory registry
    const files = fileRegistry.get(walletAddress) || [];
    return res.status(200).json({ files });
  }

  if (req.method === 'DELETE') {
    const { wallet } = req.query;
    const { fileId } = req.body;
    
    if (!wallet || !fileId) {
      return res.status(400).json({ error: 'Wallet address and file ID required' });
    }
    
    const walletAddress = sanitizeWallet(wallet);
    
    // If we have Pinata JWT, unpin from Pinata
    if (process.env.PINATA_JWT) {
      try {
        // First get the file to find its IPFS hash
        const files = fileRegistry.get(walletAddress) || [];
        const file = files.find(f => f.id === fileId);
        
        if (file && file.ipfsHash) {
          // Unpin from Pinata
          const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${file.ipfsHash}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${process.env.PINATA_JWT}`
            }
          });
          
          if (!response.ok) {
            console.error('Failed to unpin from Pinata');
          }
        }
      } catch (error) {
        console.error('Pinata unpin error:', error);
      }
    }
    
    // Remove from local registry
    const files = fileRegistry.get(walletAddress) || [];
    const updatedFiles = files.filter(file => file.id !== fileId);
    fileRegistry.set(walletAddress, updatedFiles);
    
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
module.exports.config = config;