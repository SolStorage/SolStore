export class Footer {
    render() {
        const currentYear = new Date().getFullYear();
        
        return `
            <div class="footer-content container">
                <div class="footer-section">
                    <h3>SolStore</h3>
                    <p>Decentralized storage solution built on Solana blockchain. Secure, fast, and reliable.</p>
                    <div class="social-links">
                        <a href="#" aria-label="Twitter">🐦</a>
                        <a href="#" aria-label="Discord">💬</a>
                        <a href="#" aria-label="GitHub">🐙</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h3>Product</h3>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#security">Security</a>
                    <a href="#roadmap">Roadmap</a>
                </div>
                <div class="footer-section">
                    <h3>Resources</h3>
                    <a href="#docs">Documentation</a>
                    <a href="#api">API Reference</a>
                    <a href="https://github.com/SolStorage/SolStore">GitHub</a>
                    <a href="#support">Support</a>
                </div>
                <div class="footer-section">
                    <h3>Community</h3>
                    <a href="https://twitter.com/solstorage">Twitter</a>
                    <a href="https://discord.gg/solstore">Discord</a>
                    <a href="https://t.me/solstore">Telegram</a>
                    <a href="#blog">Blog</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${currentYear} SolStore. All rights reserved.</p>
            </div>
        `;
    }

    init() {
        // Footer links smooth scrolling
        document.querySelectorAll('.footer-section a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}