export class Features {
    constructor() {
        this.features = [
            {
                icon: '🔒',
                title: 'End-to-End Encryption',
                description: 'Your files are encrypted before upload and only you have the keys. Complete privacy guaranteed.'
            },
            {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Powered by Solana\'s high-speed blockchain. Upload and access files in milliseconds.'
            },
            {
                icon: '🌍',
                title: 'Globally Distributed',
                description: 'Files are replicated across multiple nodes worldwide for maximum availability.'
            },
            {
                icon: '💎',
                title: 'Permanent Storage',
                description: 'Once uploaded, your files are stored permanently on the blockchain. No deletion, no censorship.'
            },
            {
                icon: '🔄',
                title: 'Version Control',
                description: 'Track all changes and access previous versions of your files anytime.'
            },
            {
                icon: '🤝',
                title: 'Easy Sharing',
                description: 'Share files securely with encrypted links. Control access with time limits and permissions.'
            }
        ];
    }

    render() {
        return `
            <div class="features-container container">
                <h2 class="text-center">Why Choose SolStore?</h2>
                <div class="features-grid">
                    ${this.features.map(feature => this.renderFeature(feature)).join('')}
                </div>
            </div>
        `;
    }

    renderFeature(feature) {
        return `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `;
    }

    init() {
        // Add intersection observer for fade-in animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });
    }
}