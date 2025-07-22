import { CONFIG } from '../config.js';

export class EncryptionManager {
    async generateKey(wallet) {
        const signature = await wallet.signMessage(CONFIG.ENCRYPTION_KEY_MESSAGE);
        return signature.slice(0, 32);
    }

    async encryptFile(file, wallet) {
        const key = await this.generateKey(wallet);
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const fileBuffer = await file.arrayBuffer();
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            'AES-GCM',
            false,
            ['encrypt']
        );
        
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            fileBuffer
        );
        
        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        return new Blob([combined], { type: 'application/octet-stream' });
    }

    async decryptFile(encryptedBlob, wallet) {
        const key = await this.generateKey(wallet);
        const encryptedBuffer = await encryptedBlob.arrayBuffer();
        
        // Extract IV and data
        const iv = new Uint8Array(encryptedBuffer, 0, 16);
        const data = new Uint8Array(encryptedBuffer, 16);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            'AES-GCM',
            false,
            ['decrypt']
        );
        
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            data
        );
        
        return new Blob([decryptedData]);
    }
}