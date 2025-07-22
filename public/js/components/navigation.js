import { EventEmitter } from '../utils/events.js';

export class Navigation extends EventEmitter {
    constructor() {
        super();
        this.walletConnected = false;
        this.publicKey = null;
    }

    render() {
        return `
            <div class="nav-container container">
                <a href="/" class="logo">
                    <div class="logo-icon">💾</div>
                    <span>SolStore</span>
                </a>
                <ul class="nav-links">
                    <li><a href="#dashboard">Dashboard</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#docs">Docs</a></li>
                </ul>
                <button class="btn btn-primary connect-wallet" id="connectWalletBtn">
                    Connect Wallet
                </button>
            </div>
        `;
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                if (this.walletConnected) {
                    this.emit('disconnectWallet');
                } else {
                    this.emit('connectWallet');
                }
            });
        }

        // Smooth scrolling for nav links
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    updateWalletStatus(publicKey) {
        this.walletConnected = true;
        this.publicKey = publicKey;
        const btn = document.getElementById('connectWalletBtn');
        if (btn) {
            const shortAddress = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
            btn.textContent = shortAddress;
            btn.title = publicKey; // Show full address on hover
        }
    }

    clearWalletStatus() {
        this.walletConnected = false;
        this.publicKey = null;
        const btn = document.getElementById('connectWalletBtn');
        if (btn) {
            btn.textContent = 'Connect Wallet';
            btn.title = '';
        }
    }
}