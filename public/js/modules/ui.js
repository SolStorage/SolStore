import { EventEmitter } from '../utils/events.js';
import { Navigation } from '../components/navigation.js';
import { Hero } from '../components/hero.js';
import { Dashboard } from '../components/dashboard.js';
import { Features } from '../components/features.js';
import { Pricing } from '../components/pricing.js';
import { Footer } from '../components/footer.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { FileUpload } from '../components/file-upload.js';

export class UIManager extends EventEmitter {
    constructor() {
        super();
        this.components = {};
    }

    async init() {
        // Initialize components
        this.components.navigation = new Navigation();
        this.components.hero = new Hero();
        this.components.dashboard = new Dashboard();
        this.components.features = new Features();
        this.components.pricing = new Pricing();
        this.components.footer = new Footer();
        this.components.toast = new Toast();
        this.components.modal = new Modal();
        this.components.fileUpload = new FileUpload();

        // Render components
        await this.renderComponents();
        
        // Set up component event listeners
        this.setupComponentListeners();
    }

    async renderComponents() {
        // Render each component to its container
        const mainNav = document.getElementById('main-nav');
        const heroSection = document.getElementById('hero-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const featuresSection = document.getElementById('features-section');
        const pricingSection = document.getElementById('pricing-section');
        const mainFooter = document.getElementById('main-footer');
        
        if (mainNav) mainNav.innerHTML = this.components.navigation.render();
        if (heroSection) heroSection.innerHTML = this.components.hero.render();
        if (dashboardSection) dashboardSection.innerHTML = this.components.dashboard.render();
        if (featuresSection) featuresSection.innerHTML = this.components.features.render();
        if (pricingSection) pricingSection.innerHTML = this.components.pricing.render();
        if (mainFooter) mainFooter.innerHTML = this.components.footer.render();
        
        // Initialize component behaviors
        Object.values(this.components).forEach(component => {
            if (component.init) {
                try {
                    component.init();
                } catch (error) {
                    console.error('Component init error:', error);
                }
            }
        });
    }

    setupComponentListeners() {
        // Navigation events
        this.components.navigation.on('connectWallet', () => {
            this.emit('connectWallet');
        });

        this.components.navigation.on('disconnectWallet', () => {
            this.emit('disconnectWallet');
        });

        // Dashboard file upload events - FIXED: Listen to dashboard for file uploads
        this.components.dashboard.on('filesSelected', (files) => {
            this.emit('uploadFiles', files);
        });

        // Dashboard events
        this.components.dashboard.on('deleteFile', (fileId) => {
            this.emit('deleteFile', fileId);
        });

        this.components.dashboard.on('downloadFile', (fileData) => {
            this.emit('downloadFile', fileData);
        });

        this.components.dashboard.on('shareFile', (fileData) => {
            this.emit('shareFile', fileData);
        });

        // FileUpload component events (if any)
        this.components.fileUpload.on('cancelUpload', () => {
            this.emit('cancelUpload');
        });
    }

    updateWalletUI(publicKey) {
        this.components.navigation.updateWalletStatus(publicKey);
        this.components.dashboard.show();
    }

    clearWalletUI() {
        this.components.navigation.clearWalletStatus();
        this.components.dashboard.hide();
    }

    displayFiles(files) {
        this.components.dashboard.displayFiles(files);
    }

    addFileToGrid(file) {
        this.components.dashboard.addFile(file);
    }

    removeFileFromGrid(fileId) {
        this.components.dashboard.removeFile(fileId);
    }

    updateStorageStats(stats) {
        this.components.dashboard.updateStats(stats);
    }

    showToast(message, type = 'info') {
        // Debug logging
        console.log(`Toast: [${type}] ${message}`);
        
        // Make sure toast component exists and has the show method
        if (this.components.toast && this.components.toast.show) {
            this.components.toast.show(message, type);
        } else {
            console.error('Toast component not properly initialized');
            // Fallback to alert for critical errors
            if (type === 'error') {
                alert(`Error: ${message}`);
            }
        }
    }

    showShareModal(shareUrl, fileData) {
        if (this.components.modal && this.components.modal.showShare) {
            this.components.modal.showShare(shareUrl, fileData);
        } else {
            console.error('Modal component not properly initialized');
        }
    }

    showUploadProgress(fileName) {
        if (this.components.fileUpload && this.components.fileUpload.showProgress) {
            this.components.fileUpload.showProgress(fileName);
        }
    }

    updateUploadProgress(progress) {
        if (this.components.fileUpload && this.components.fileUpload.updateProgress) {
            this.components.fileUpload.updateProgress(progress);
        }
    }

    hideUploadProgress() {
        if (this.components.fileUpload && this.components.fileUpload.hideProgress) {
            this.components.fileUpload.hideProgress();
        }
    }

    clearDashboard() {
        if (this.components.dashboard && this.components.dashboard.clear) {
            this.components.dashboard.clear();
        }
    }
}