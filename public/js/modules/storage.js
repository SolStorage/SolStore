export class StorageManager {
    constructor(config) {
        this.config = config;
    }

    async uploadFile(file, metadata, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Make sure we're sending walletAddress, not just wallet
        formData.append('walletAddress', metadata.wallet || metadata.walletAddress);
        
        // Add other metadata
        Object.keys(metadata).forEach(key => {
            if (key !== 'wallet' && key !== 'walletAddress') {
                formData.append(key, metadata[key]);
            }
        });

        // Debug logging
        console.log('Sending formData with:');
        console.log('- walletAddress:', metadata.wallet || metadata.walletAddress);
        console.log('- encrypted:', metadata.encrypted);
        console.log('- originalName:', metadata.originalName);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid response from server'));
                    }
                } else if (xhr.status === 400) {
                    // Add better error handling for 400
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.error || 'Bad request'));
                    } catch {
                        reject(new Error('Missing file or wallet address'));
                    }
                } else if (xhr.status === 413) {
                    reject(new Error('File too large. Maximum size is 100MB'));
                } else if (xhr.status === 429) {
                    reject(new Error('Too many uploads. Please wait a moment'));
                } else if (xhr.status === 500) {
                    reject(new Error('Server error. The app is running in demo mode'));
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error - check your connection'));
            });

            xhr.open('POST', `${this.config.API_URL}/api/upload`);
            xhr.send(formData);
        });
    }

    async getUserFiles(walletAddress) {
        try {
            const response = await fetch(`${this.config.API_URL}/api/files?wallet=${walletAddress}`);
            if (!response.ok) {
                if (response.status === 500) {
                    console.log('Running in demo mode - no files stored yet');
                    return [];
                }
                throw new Error('Failed to load files');
            }
            const data = await response.json();
            return data.files || [];
        } catch (error) {
            console.error('Load files error:', error);
            return []; // Return empty array instead of throwing
        }
    }

    async getUserStats(walletAddress) {
        try {
            const response = await fetch(`${this.config.API_URL}/api/stats?wallet=${walletAddress}`);
            if (!response.ok) {
                // Return default stats if API fails
                return {
                    totalSize: 0,
                    fileCount: 0,
                    storageLimit: 1073741824,
                    percentUsed: 0
                };
            }
            return response.json();
        } catch (error) {
            console.error('Load stats error:', error);
            // Return default stats
            return {
                totalSize: 0,
                fileCount: 0,
                storageLimit: 1073741824,
                percentUsed: 0
            };
        }
    }

    async deleteFile(fileId, walletAddress) {
        const response = await fetch(`${this.config.API_URL}/api/files?wallet=${walletAddress}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId })
        });
        
        if (!response.ok) {
            if (response.status === 500) {
                throw new Error('Cannot delete in demo mode');
            }
            throw new Error('Failed to delete file');
        }
        return response.json();
    }
}