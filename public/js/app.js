import { WalletManager } from './modules/wallet.js';
import { StorageManager } from './modules/storage.js';
import { EncryptionManager } from './modules/encryption.js';
import { UIManager } from './modules/ui.js';
import { CONFIG } from './config.js';

class SolStoreApp {
    constructor() {
        this.config = CONFIG;
        this.wallet = new WalletManager();
        this.storage = new StorageManager(this.config);
        this.encryption = new EncryptionManager();
        this.ui = new UIManager();
        
        this.init();
    }

    async init() {
        console.log('SolStore initializing...');
        
        // Initialize UI components
        await this.ui.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Auto-connect wallet if previously connected
        await this.autoConnectWallet();
        
        console.log('SolStore ready!');
    }

    setupEventListeners() {
        // Wallet events
        this.wallet.on('connect', (publicKey) => {
            this.ui.updateWalletUI(publicKey);
            this.loadUserData();
        });

        this.wallet.on('disconnect', () => {
            this.ui.clearWalletUI();
            this.ui.clearDashboard();
        });

        // UI events
        this.ui.on('connectWallet', () => this.connectWallet());
        this.ui.on('uploadFiles', (files) => this.handleFileUpload(files));
        this.ui.on('deleteFile', (fileId) => this.deleteFile(fileId));
        this.ui.on('downloadFile', (fileData) => this.downloadFile(fileData));
        this.ui.on('shareFile', (fileData) => this.shareFile(fileData));
    }

    async autoConnectWallet() {
        try {
            const connected = await this.wallet.autoConnect();
            if (connected) {
                console.log('Auto-connected to wallet');
            }
        } catch (error) {
            console.log('No previous wallet connection');
        }
    }

    async connectWallet() {
        try {
            await this.wallet.connect();
        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }

    async loadUserData() {
        try {
            // Load files
            const files = await this.storage.getUserFiles(this.wallet.publicKey);
            this.ui.displayFiles(files);
            
            // Load stats
            const stats = await this.storage.getUserStats(this.wallet.publicKey);
            this.ui.updateStorageStats(stats);
        } catch (error) {
            console.error('Load user data error:', error);
            // Don't show error toast on initial load
        }
    }

    async handleFileUpload(files) {
        for (const file of files) {
            try {
                // Validate file
                if (file.size > this.config.MAX_FILE_SIZE) {
                    throw new Error(`${file.name} is too large. Max size: ${this.config.MAX_FILE_SIZE / 1024 / 1024}MB`);
                }

                // Show upload progress (no encryption)
                this.ui.showToast('Uploading file...', 'info');
                
                // Skip encryption - use original file
                // const encryptedBlob = await this.encryption.encryptFile(file, this.wallet);
                
                // Upload file directly
                this.ui.showUploadProgress(file.name);
                const result = await this.storage.uploadFile(file, {
                    originalName: file.name,
                    originalType: file.type,
                    walletAddress: this.wallet.publicKey,  // Fixed: using walletAddress
                    encrypted: 'false'  // Fixed: string 'false' instead of boolean
                }, (progress) => {
                    this.ui.updateUploadProgress(progress);
                });

                // Update UI
                this.ui.hideUploadProgress();
                this.ui.addFileToGrid(result.file);
                this.ui.showToast(`${file.name} uploaded successfully!`, 'success');
                
                // Refresh stats
                const stats = await this.storage.getUserStats(this.wallet.publicKey);
                this.ui.updateStorageStats(stats);
                
            } catch (error) {
                this.ui.hideUploadProgress();
                this.ui.showToast(error.message, 'error');
                console.error('Upload error:', error);
            }
        }
    }

    async downloadFile(fileData) {
        try {
            this.ui.showToast('Downloading file...', 'info');
            
            // Fetch file directly (no decryption needed)
            const response = await fetch(fileData.url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }
            
            const blob = await response.blob();
            
            // Download directly
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileData.name;
            link.click();
            
            URL.revokeObjectURL(url);
            this.ui.showToast('File downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.ui.showToast('Failed to download file', 'error');
        }
    }

    async deleteFile(fileId) {
        try {
            await this.storage.deleteFile(fileId, this.wallet.publicKey);
            this.ui.removeFileFromGrid(fileId);
            this.ui.showToast('File deleted successfully', 'success');
            
            // Refresh stats
            const stats = await this.storage.getUserStats(this.wallet.publicKey);
            this.ui.updateStorageStats(stats);
            
        } catch (error) {
            console.error('Delete error:', error);
            this.ui.showToast('Failed to delete file', 'error');
        }
    }

    shareFile(fileData) {
        const shareUrl = `${window.location.origin}/share?file=${encodeURIComponent(fileData.name)}&url=${encodeURIComponent(fileData.url)}`;
        this.ui.showShareModal(shareUrl, fileData);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SolStoreApp();
});