import { CONFIG } from '../config.js';

export class Toast {
    constructor() {
        this.container = null;
        this.queue = [];
        this.isShowing = false;
    }

    render() {
        return ''; // Toast container is created dynamically
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        // Add to queue
        this.queue.push({ message, type, duration });
        
        // Process queue if not already showing
        if (!this.isShowing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const { message, type, duration } = this.queue.shift();

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">×</button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });

        // Auto hide after duration
        setTimeout(() => {
            this.hideToast(toast);
        }, duration);
    }

    hideToast(toast) {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            // Process next in queue
            this.processQueue();
        });
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

show(message, type = 'info', duration = CONFIG.TOAST_DURATION || 3000) {
    console.log(`Showing toast: [${type}] ${message}`); // Debug line
    
    // Add to queue
    this.queue.push({ message, type, duration });
    
    // Process queue if not already showing
    if (!this.isShowing) {
        this.processQueue();
    }
}
}