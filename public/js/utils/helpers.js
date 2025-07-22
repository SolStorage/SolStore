export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType) {
    if (!fileType) return '📎';
    
    const iconMap = {
        'image': '🖼️',
        'video': '🎥',
        'audio': '🎵',
        'pdf': '📄',
        'spreadsheet': '📊',
        'excel': '📊',
        'document': '📝',
        'word': '📝',
        'zip': '📦',
        'rar': '📦'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
        if (fileType.includes(key)) return icon;
    }
    
    return '📎';
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}