// Shared file registry across all API endpoints
// In production, replace this with a database (MongoDB, PostgreSQL, etc.)
const fileRegistry = new Map();
const uploadLimits = new Map();

// Rate limiting helper
function checkRateLimit(wallet) {
  const now = Date.now();
  const userLimits = uploadLimits.get(wallet) || { count: 0, resetTime: now + 60000 };
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + 60000; // Reset every minute
  }
  
  if (userLimits.count >= 10) {
    throw new Error('Rate limit exceeded. Maximum 10 uploads per minute.');
  }
  
  userLimits.count++;
  uploadLimits.set(wallet, userLimits);
}

// Sanitize wallet address
function sanitizeWallet(wallet) {
  if (!wallet || typeof wallet !== 'string') {
    return null;
  }
  // Only allow base58 characters (Solana wallet format)
  return wallet.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
}

module.exports = {
  fileRegistry,
  uploadLimits,
  checkRateLimit,
  sanitizeWallet
};

