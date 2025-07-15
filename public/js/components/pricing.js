export class Pricing {
    constructor() {
        this.plans = [
            {
                name: 'Basic',
                price: 'Free',
                features: [
                    '1 GB Storage',
                    'Basic Encryption',
                    '10 Files/Month',
                    'Community Support'
                ],
                cta: 'Get Started',
                featured: false
            },
            {
                name: 'Pro',
                price: '$9.99',
                period: '/month',
                features: [
                    '100 GB Storage',
                    'Advanced Encryption',
                    'Unlimited Files',
                    'Priority Support',
                    'Version History',
                    'Advanced Sharing'
                ],
                cta: 'Choose Pro',
                featured: true
            },
            {
                name: 'Enterprise',
                price: '$49.99',
                period: '/month',
                features: [
                    'Unlimited Storage',
                    'Military-Grade Encryption',
                    'Unlimited Files',
                    '24/7 Support',
                    'Custom Integration',
                    'Team Collaboration',
                    'API Access'
                ],
                cta: 'Contact Sales',
                featured: false
            }
        ];
    }

    render() {
        return `
            <div class="container">
                <h2 class="text-center">Simple, Transparent Pricing</h2>
                <div class="pricing-grid">
                    ${this.plans.map(plan => this.renderPricingCard(plan)).join('')}
                </div>
            </div>
        `;
    }

    renderPricingCard(plan) {
        return `
            <div class="pricing-card ${plan.featured ? 'featured' : ''}">
                <h3 class="plan-name">${plan.name}</h3>
                <div class="plan-price">
                    ${plan.price}
                    ${plan.period ? `<span>${plan.period}</span>` : ''}
                </div>
                <ul class="plan-features">
                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} w-full">
                    ${plan.cta}
                </button>
            </div>
        `;
    }

    init() {
        // Add click handlers for pricing buttons
        document.querySelectorAll('.pricing-card button').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const plan = this.plans[index];
                if (plan.name === 'Enterprise') {
                    window.location.href = 'mailto:sales@solstore.io?subject=Enterprise Plan Inquiry';
                } else {
                    // Handle plan selection
                    console.log('Selected plan:', plan.name);
                }
            });
        });
    }
}