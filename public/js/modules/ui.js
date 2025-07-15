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
        document.getElementById('main-nav').innerHTML = this.components.navigation.render();
        document.getElementById('hero-section').innerHTML = this.components.hero.render();
        document.getElementById('dashboard-section').innerHTML = this.components.dashboard.render();
        document.getElementById('features-section').innerHTML = this.components.features.render();
        document.getElementById('pricing-section').innerHTML = this.components.pricing.render();
        document.getElementById('main-footer').innerHTML = this.components.footer.render();
        
        // Initialize component behaviors
        Object.values(this.components).forEach(component => {
            if (component.init) component.init();
        });
    }

    setupComponentListeners() {
        // Navigation events
        this.components.navigation.on('connectWallet', () => {
            this.emit('connectWallet');
        });

        // File upload events
        this.components.fileUpload.on('filesSelected', (files) => {
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
        this.components.toast.show(message, type);
    }

    showShareModal(shareUrl, fileData) {
        this.components.modal.showShare(shareUrl, fileData);
    }

    showUploadProgress(fileName) {
        this.components.fileUpload.showProgress(fileName);
    }

    updateUploadProgress(progress) {
        this.components.fileUpload.updateProgress(progress);
    }

    hideUploadProgress() {
        this.components.fileUpload.hideProgress();
    }

    clearDashboard() {
        this.components.dashboard.clear();
    }
}