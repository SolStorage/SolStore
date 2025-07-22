import { EventEmitter } from '../utils/events.js';

export class Modal extends EventEmitter {
    constructor() {
        super();
        this.currentModal = null;
    }

    render() {
        return `
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-content" id="modalContent">
                    <!-- Content will be injected here -->
                </div>
            </div>
        `;
    }

    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('share-modal')) {
            const modalDiv = document.createElement('div');
            modalDiv.id = 'share-modal';
            modalDiv.className = 'modal';
            modalDiv.innerHTML = this.render();
            document.body.appendChild(modalDiv);
        }

        // Click outside to close
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    }

    showShare(shareUrl, fileData) {
        const content = `
            <div class="modal-header">
                <h2>Share File</h2>
                <button class="modal-close" onclick="window.app.ui.components.modal.close()">×</button>
            </div>
            <div class="modal-body">
                <div class="file-preview">
                    <div class="file-icon">${this.getFileIcon(fileData.type)}</div>
                    <div class="file-name">${fileData.name}</div>
                </div>
                
                <p>Share this file with a secure link:</p>
                
                <div class="share-link-container">
                    <input type="text" id="shareLink" value="${shareUrl}" readonly 
                           class="share-link-input">
                    <button class="btn btn-primary" onclick="window.app.ui.components.modal.copyShareLink()">
                        Copy
                    </button>
                </div>
                
                <div class="share-options">
                    <label>Link expires in:</label>
                    <select id="linkExpiry" class="form-select">
                        <option value="never">Never</option>
                        <option value="1h">1 hour</option>
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                        <option value="30d">30 days</option>
                    </select>
                </div>
                
                <div class="share-actions">
                    <button class="btn btn-secondary" onclick="window.app.ui.components.modal.close()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="window.app.ui.components.modal.generateShareLink()">
                        Generate Link
                    </button>
                </div>
            </div>
        `;

        this.show(content);
        this.currentModal = 'share';
    }

    show(content) {
        const modal = document.getElementById('share-modal');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = content;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.currentModal = null;
            this.emit('close');
        }
    }

    async copyShareLink() {
        const shareLink = document.getElementById('shareLink');
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink.value);
            
            // Visual feedback
            const copyBtn = event.target;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('success');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('success');
            }, 2000);
            
            // Show toast
            if (window.app?.ui?.showToast) {
                window.app.ui.showToast('Link copied to clipboard!', 'success');
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            if (window.app?.ui?.showToast) {
                window.app.ui.showToast('Failed to copy link', 'error');
            }
        }
    }

    generateShareLink() {
        const expiry = document.getElementById('linkExpiry').value;
        console.log('Generating share link with expiry:', expiry);
        
        // Here you would generate the actual share link with expiry
        // For now, just show a success message
        if (window.app?.ui?.showToast) {
            window.app.ui.showToast('Share link generated!', 'success');
        }
        
        this.close();
    }

    getFileIcon(fileType) {
        if (!fileType) return '📎';
        
        const iconMap = {
            'image': '🖼️',
            'video': '🎥',
            'audio': '🎵',
            'pdf': '📄',
            'document': '📝',
            'spreadsheet': '📊',
            'zip': '📦'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (fileType.includes(key)) return icon;
        }
        
        return '📎';
    }
}