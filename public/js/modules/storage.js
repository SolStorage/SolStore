export class StorageManager {
    constructor(config) {
        this.config = config;
    }

    async uploadFile(file, metadata, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

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
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed - network error'));
            });

            xhr.open('POST', `${this.config.API_URL}/api/upload`);
            xhr.send(formData);
        });
    }

    async getUserFiles(walletAddress) {
        const response = await fetch(`${this.config.API_URL}/api/files?wallet=${walletAddress}`);
        if (!response.ok) throw new Error('Failed to load files');
        const data = await response.json();
        return data.files;
    }

    async getUserStats(walletAddress) {
        const response = await fetch(`${this.config.API_URL}/api/stats?wallet=${walletAddress}`);
        if (!response.ok) throw new Error('Failed to load stats');
        return response.json();
    }

    async deleteFile(fileId, walletAddress) {
        const response = await fetch(`${this.config.API_URL}/api/files?wallet=${walletAddress}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId })
        });
        
        if (!response.ok) throw new Error('Failed to delete file');
        return response.json();
    }
}