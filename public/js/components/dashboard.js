import { EventEmitter } from '../utils/events.js';
import { formatFileSize, getFileIcon, formatDate } from '../utils/helpers.js';

export class Dashboard extends EventEmitter {
    constructor() {
        super();
        this.files = [];
        this.currentView = 'grid';
    }

    render() {
        return `
            <div class="container">
                <div class="dashboard-header">
                    <h2>My Storage</h2>
                    <div class="storage-info">
                        <div class="storage-stat">
                            <h3>Used Storage</h3>
                            <p id="used-storage">0 Bytes</p>
                            <div class="progress-bar">
                                <div class="progress-fill" id="storage-progress" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="storage-stat">
                            <h3>Total Files</h3>
                            <p id="total-files">0</p>
                        </div>
                        <div class="storage-stat">
                            <h3>Storage Limit</h3>
                            <p id="storage-limit">1 GB</p>
                        </div>
                    </div>
                </div>
                
                <div class="upload-section" id="uploadArea">
                    <div class="upload-icon">📤</div>
                    <h2>Upload Files</h2>
                    <p>Drag and drop files here or click to browse (Max: 100MB per file)</p>
                    <input type="file" id="fileInput" class="file-input" multiple>
                    <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                        Choose Files
                    </button>
                </div>
                
                <div class="files-section">
                    <div class="files-header">
                        <h2>Your Files</h2>
                        <div class="view-toggle">
                            <button class="view-btn active" data-view="grid">Grid</button>
                            <button class="view-btn" data-view="list">List</button>
                        </div>
                    </div>
                    <div class="files-grid" id="filesGrid">
                        <div class="empty-state">
                            Connect your wallet to see your files
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        this.setupUploadArea();
        this.setupViewToggle();
    }

    setupUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.emit('filesSelected', Array.from(e.dataTransfer.files));
        });

        fileInput.addEventListener('change', (e) => {
            this.emit('filesSelected', Array.from(e.target.files));
        });
    }

    setupViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.updateView();
            });
        });
    }

    updateView() {
        const filesGrid = document.getElementById('filesGrid');
        if (this.currentView === 'list') {
            filesGrid.classList.add('list-view');
        } else {
            filesGrid.classList.remove('list-view');
        }
    }

    displayFiles(files) {
        this.files = files;
        const filesGrid = document.getElementById('filesGrid');
        
        if (files.length === 0) {
            filesGrid.innerHTML = '<div class="empty-state">No files uploaded yet</div>';
            return;
        }

        filesGrid.innerHTML = files.map(file => this.createFileCard(file)).join('');
        this.attachFileListeners();
    }

    createFileCard(file) {
        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-icon">${getFileIcon(file.type)}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-info">
                    <span>${formatFileSize(file.size)}</span>
                    <span>${formatDate(file.uploadDate)}</span>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn download-btn" data-file-id="${file.id}">
                        Download
                    </button>
                    <button class="file-action-btn share-btn" data-file-id="${file.id}">
                        Share
                    </button>
                    <button class="file-action-btn delete-btn" data-file-id="${file.id}">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    attachFileListeners() {
        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = btn.dataset.fileId;
                const file = this.files.find(f => f.id === fileId);
                if (file) this.emit('downloadFile', file);
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = btn.dataset.fileId;
                const file = this.files.find(f => f.id === fileId);
                if (file) this.emit('shareFile', file);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = btn.dataset.fileId;
                const file = this.files.find(f => f.id === fileId);
                if (file && confirm(`Delete ${file.name}?`)) {
                    this.emit('deleteFile', fileId);
                }
            });
        });
    }

    addFile(file) {
        this.files.unshift(file);
        this.displayFiles(this.files);
    }

    removeFile(fileId) {
        this.files = this.files.filter(f => f.id !== fileId);
        this.displayFiles(this.files);
    }

    updateStats(stats) {
        document.getElementById('used-storage').textContent = formatFileSize(stats.totalSize);
        document.getElementById('total-files').textContent = stats.fileCount;
        document.getElementById('storage-limit').textContent = formatFileSize(stats.storageLimit);
        document.getElementById('storage-progress').style.width = `${stats.percentUsed}%`;
    }

    show() {
        document.getElementById('dashboard-section').style.display = 'block';
    }

    hide() {
        document.getElementById('dashboard-section').style.display = 'none';
    }

    clear() {
        this.files = [];
        this.displayFiles([]);
        this.updateStats({
            totalSize: 0,
            fileCount: 0,
            storageLimit: 1073741824,
            percentUsed: 0
        });
    }
}