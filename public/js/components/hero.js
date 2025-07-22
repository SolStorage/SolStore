export class Hero {
    render() {
        return `
            <div class="container text-center">
                <h1 class="hero-title">Decentralized Storage</h1>
                <p class="hero-description">
                    Store your files securely on the Solana blockchain. 
                    Fast, reliable, and truly decentralized.
                </p>
                <div class="hero-buttons">
                    <a href="#dashboard" class="btn btn-primary">
                        <span>Start Storing</span>
                        <span>→</span>
                    </a>
                    <a href="#features" class="btn btn-secondary">
                        <span>Learn More</span>
                    </a>
                </div>
                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-value" id="totalUsers">0</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="totalFiles">0</div>
                        <div class="stat-label">Files Stored</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="totalStorage">0 GB</div>
                        <div class="stat-label">Total Storage</div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        // Animate stats on scroll
        this.animateStats();
    }

    animateStats() {
        // Simple counter animation (you can enhance this)
        const animateValue = (element, start, end, duration) => {
            const range = end - start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                element.textContent = current;
                if (current === end) {
                    clearInterval(timer);
                }
            }, stepTime);
        };

        // Example animations (replace with real data)
        setTimeout(() => {
            const users = document.getElementById('totalUsers');
            const files = document.getElementById('totalFiles');
            if (users) animateValue(users, 0, 1234, 2000);
            if (files) animateValue(files, 0, 5678, 2000);
        }, 500);
    }
}