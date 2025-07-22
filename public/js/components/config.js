export const CONFIG = {
    // API Configuration
    API_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : '',
    
    // File Upload t
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FILE_TYPES: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip', 'application/x-rar-compressed',
        'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml',
        'application/octet-stream'
    ],
    
    // Storage
    STORAGE_LIMIT: 1073741824, // 1GB
    
    // Encryption
    ENCRYPTION_KEY_MESSAGE: 'SolStore Encryption Key',
    
    // UI
    TOAST_DURATION: 3000,
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    
    // Solana
    QUICKNODE_RPC: 'https://lively-black-telescope.solana-mainnet.quiknode.pro/84fc4dcebe15afcc2b02f1d0cdb4e9ec2db7920b/'
};