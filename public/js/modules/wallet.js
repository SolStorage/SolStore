import { EventEmitter } from '../utils/events.js';

export class WalletManager extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
        this.publicKey = null;
        this.setupPhantomListeners();
    }

    async checkPhantomAvailability() {
        return new Promise((resolve) => {
            if (window.solana?.isPhantom) {
                resolve(true);
                return;
            }

            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.solana?.isPhantom) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (attempts >= 20) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 100);
        });
    }

    setupPhantomListeners() {
        if (window.solana?.isPhantom) {
            window.solana.on('connect', () => {
                console.log('Phantom connected event');
            });
            
            window.solana.on('disconnect', () => {
                console.log('Phantom disconnected event');
                this.disconnect();
            });
            
            window.solana.on('accountChanged', (newPublicKey) => {
                if (newPublicKey) {
                    console.log('Account changed:', newPublicKey.toString());
                    location.reload();
                }
            });
        }
    }

    async connect() {
        const isAvailable = await this.checkPhantomAvailability();
        
        if (!isAvailable) {
            throw new Error('Phantom wallet not found. Please install it first.');
        }

        try {
            const response = await window.solana.connect();
            this.publicKey = response.publicKey.toString();
            this.connected = true;
            
            this.emit('connect', this.publicKey);
            return this.publicKey;
        } catch (error) {
            if (error.message.includes('User rejected')) {
                throw new Error('Connection cancelled by user');
            }
            throw error;
        }
    }

    async disconnect() {
        if (this.connected) {
            await window.solana.disconnect();
            this.connected = false;
            this.publicKey = null;
            this.emit('disconnect');
        }
    }

    async autoConnect() {
        const isAvailable = await this.checkPhantomAvailability();
        
        if (isAvailable) {
            try {
                const response = await window.solana.connect({ onlyIfTrusted: true });
                if (response?.publicKey) {
                    this.publicKey = response.publicKey.toString();
                    this.connected = true;
                    this.emit('connect', this.publicKey);
                    return true;
                }
            } catch (error) {
                // User hasn't connected before
            }
        }
        return false;
    }

    async signMessage(message) {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }
        
        const encodedMessage = new TextEncoder().encode(message);
        const signatureResult = await window.solana.signMessage(encodedMessage);
        return new Uint8Array(signatureResult.signature);
    }

    getShortAddress() {
        if (!this.publicKey) return '';
        return `${this.publicKey.slice(0, 4)}...${this.publicKey.slice(-4)}`;
    }
}