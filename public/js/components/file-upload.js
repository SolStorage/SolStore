import { EventEmitter } from '../utils/events.js';
import { CONFIG } from '../config.js';

export class FileUpload extends EventEmitter {
    constructor() {
        super();
        this.uploadProgress = null;
        this.currentUpload = null;
    }

    render() {
        return `
            <div class="upload-progress-content">
                <div class="upload-progress-header">
                    <span class="upload-filename">Uploading...</span>
                    <span class="upload-percentage">0%</span>
                </div>
                <div class="upload-progress-bar">
                    <div class="upload-progress-fill shimmer"></div>
                </div>
                <button class="upload-cancel-btn" onclick="window.app.ui.components.fileUpload.cancelUpload()">
                    Cancel
                </button>
            </div>
        `;
    }

    init() {
        this.uploadProgress = document.getElementById('upload-progress');
        if (!this.uploadProgress) {
            // Create upload progress element if it doesn't exist
            this.uploadProgress = document.createElement('div');
            this.uploadProgress.id = 'upload-progress';
            this.uploadProgress.className = 'upload-progress';
            this.uploadProgress.innerHTML = this.render();
            document.body.appendChild(this.uploadProgress);
        }

        // Setup drag and drop for the upload area
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        }, false);

        // File input change handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFiles(files);
                // Reset input so same file can be selected again
                fileInput.value = '';
            });
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFiles(files) {
        // Validate files
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length > 0) {
            this.emit('filesSelected', validFiles);
        }
    }

    validateFile(file) {
        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            if (window.app?.ui?.showToast) {
                window.app.ui.showToast(
                    `${file.name} is too large. Max size: ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
                    'error'
                );
            }
            return false;
        }

        // Check file type if needed
        const fileType = file.type.toLowerCase();
        if (CONFIG.ALLOWED_FILE_TYPES && CONFIG.ALLOWED_FILE_TYPES.length > 0) {
            if (!CONFIG.ALLOWED_FILE_TYPES.includes(fileType)) {
                // Check if it's an encrypted file (application/octet-stream)
                if (fileType !== 'application/octet-stream') {
                    if (window.app?.ui?.showToast) {
                        window.app.ui.showToast(
                            `${file.name} - File type not allowed`,
                            'error'
                        );
                    }
                    return false;
                }
            }
        }

        return true;
    }

    showProgress(fileName) {
        if (!this.uploadProgress) return;

        const filenameEl = this.uploadProgress.querySelector('.upload-filename');
        const percentageEl = this.uploadProgress.querySelector('.upload-percentage');
        const progressFill = this.uploadProgress.querySelector('.upload-progress-fill');

        if (filenameEl) filenameEl.textContent = `Uploading ${fileName}...`;
        if (percentageEl) percentageEl.textContent = '0%';
        if (progressFill) progressFill.style.width = '0%';

        this.uploadProgress.classList.add('active');
    }

    updateProgress(percentage) {
        const percentageEl = this.uploadProgress.querySelector('.upload-percentage');
        const progressFill = this.uploadProgress.querySelector('.upload-progress-fill');

        if (percentageEl) percentageEl.textContent = `${Math.round(percentage)}%`;
        if (progressFill) progressFill.style.width = `${percentage}%`;
    }

    hideProgress() {
        if (this.uploadProgress) {
            setTimeout(() => {
                this.uploadProgress.classList.remove('active');
            }, 500);
        }
    }

    cancelUpload() {
        if (this.currentUpload) {
            // Implement upload cancellation logic
            console.log('Cancelling upload...');
            this.emit('cancelUpload');
        }
        this.hideProgress();
    }

    setCurrentUpload(upload) {
        this.currentUpload = upload;
    }
}