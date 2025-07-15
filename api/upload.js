const formidable = require('formidable');
const { fileRegistry, checkRateLimit, sanitizeWallet } = require('../lib/registry');

const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-rar-compressed',
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
  'application/json', 'application/xml',
  'application/octet-stream' // For encrypted files
];

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB
  });
  
  try {
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const walletAddress = sanitizeWallet(
      Array.isArray(fields.walletAddress) ? fields.walletAddress[0] : fields.walletAddress
    );
    
    if (!file || !walletAddress) {
      return res.status(400).json({ error: 'Missing file or wallet address' });
    }

    // Check rate limit
    try {
      checkRateLimit(walletAddress);
    } catch (rateLimitError) {
      return res.status(429).json({ error: rateLimitError.message });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      // Allow if it's marked as encrypted
      const isEncrypted = fields.encrypted && fields.encrypted[0] === 'true';
      if (!isEncrypted) {
        return res.status(400).json({ error: `File type ${file.mimetype} is not allowed` });
      }
    }

    // Additional file size check
    if (file.size > 100 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    
    // Read file
    const fs = require('fs');
    const fileBuffer = await fs.promises.readFile(file.filepath);
    
    // Create FormData for Pinata
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileBuffer, file.originalFilename);
    
    // Add metadata
    const metadata = JSON.stringify({
      name: file.originalFilename,
      keyvalues: {
        wallet: walletAddress,
        uploadDate: new Date().toISOString(),
        encrypted: fields.encrypted ? fields.encrypted[0] : 'false',
        originalType: fields.originalType ? fields.originalType[0] : file.mimetype
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata error:', error);
      throw new Error(`Pinata error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Create file record
    const fileData = {
      id: Date.now().toString(),
      name: file.originalFilename,
      size: file.size,
      type: fields.originalType ? fields.originalType[0] : file.mimetype,
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      owner: walletAddress,
      uploadDate: new Date().toISOString(),
      encrypted: fields.encrypted ? fields.encrypted[0] === 'true' : false
    };
    
    // Store in registry
    if (!fileRegistry.has(walletAddress)) {
      fileRegistry.set(walletAddress, []);
    }
    fileRegistry.get(walletAddress).push(fileData);
    
    // Clean up temp file
    await fs.promises.unlink(file.filepath);
    
    // Cache control for response
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).json({ 
      success: true, 
      file: fileData 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if it exist