const { formidable } = require('formidable'); // FIX: Use destructuring
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const {
  fileRegistry,
  checkRateLimit,
  sanitizeWallet
} = require('../lib/registry');

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
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
  'application/json', 'application/xml',
  'application/octet-stream' // For encrypted files
];

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // parse form
  const form = formidable({ maxFileSize: 100 * 1024 * 1024 }); // 100MB
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error('Form parse error:', err);
    return res.status(400).json({ error: 'Invalid form data' });
  }

  // extract file + wallet
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  const walletAddress = sanitizeWallet(
    Array.isArray(fields.walletAddress)
      ? fields.walletAddress[0]
      : fields.walletAddress
  );

  if (!file || !walletAddress) {
    return res.status(400).json({ error: 'Missing file or wallet address' });
  }

  // rate‑limit
  try {
    checkRateLimit(walletAddress);
  } catch (rateLimitError) {
    return res.status(429).json({ error: rateLimitError.message });
  }

  // validate MIME
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const isEncrypted = fields.encrypted && fields.encrypted[0] === 'true';
    if (!isEncrypted) {
      return res.status(400).json({ error: `File type ${file.mimetype} is not allowed` });
    }
  }

  // size re-check
  if (file.size > 100 * 1024 * 1024) {
    return res.status(413).json({ error: 'File too large. Maximum size is 100MB.' });
  }

  // read buffer
  let fileBuffer;
  try {
    fileBuffer = await fs.promises.readFile(file.filepath);
  } catch (err) {
    console.error('File read error:', err);
    return res.status(500).json({ error: 'Could not read uploaded file' });
  }

  // DEMO MODE if no JWT
  if (!process.env.PINATA_JWT) {
    console.warn('PINATA_JWT not set, demo mode');
    const demoFile = {
      id: Date.now().toString(),
      name: file.originalFilename,
      size: file.size,
      type: fields.originalType ? fields.originalType[0] : file.mimetype,
      ipfsHash: 'demo-hash-' + Date.now(),
      url: '#',
      owner: walletAddress,
      uploadDate: new Date().toISOString(),
      encrypted: fields.encrypted ? fields.encrypted[0] === 'true' : false
    };
    fileRegistry.set(walletAddress, (fileRegistry.get(walletAddress) || []).concat(demoFile));
    await fs.promises.unlink(file.filepath);
    return res.status(200).json({ success: true, file: demoFile, demo: true });
  }

  // PRODUCTION: upload to Pinata via axios
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, file.originalFilename);

    // Pinata metadata
    const pinataMetadata = {
      name: file.originalFilename,
      keyvalues: {
        wallet: walletAddress,
        uploadDate: new Date().toISOString(),
        encrypted: fields.encrypted ? fields.encrypted[0] : 'false',
        originalType: fields.originalType ? fields.originalType[0] : file.mimetype
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    // axios POST
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const { IpfsHash } = pinataRes.data;
    const savedFile = {
      id: Date.now().toString(),
      name: file.originalFilename,
      size: file.size,
      type: fields.originalType ? fields.originalType[0] : file.mimetype,
      ipfsHash: IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
      owner: walletAddress,
      uploadDate: new Date().toISOString(),
      encrypted: fields.encrypted ? fields.encrypted[0] === 'true' : false
    };

    // register + cleanup
    fileRegistry.set(walletAddress, (fileRegistry.get(walletAddress) || []).concat(savedFile));
    await fs.promises.unlink(file.filepath);

    // no-cache & respond
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({ success: true, file: savedFile });

  } catch (pinErr) {
    console.error('Pinata upload error:', pinErr.response?.data || pinErr.message);
    // cleanup temp file
    await fs.promises.unlink(file.filepath).catch(() => {});
    return res.status(500).json({ error: 'Pinata upload failed' });
  }
}

module.exports = handler;
module.exports.config = config;