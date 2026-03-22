console.log('CHARACTER.JS LOADED');
// ================================
// Character System (Placeholder)
// Will be fully implemented in Segment 4
// ================================

const Character = {
    data: null,

    init() {
        // Placeholder - will be implemented later
        console.log('Character module initialized (placeholder)');
    },

    render() {
        const container = document.getElementById('character-display');
        if (!container) return;

        if (!this.data) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: var(--accent); margin-bottom: 1rem;">🛡️ No Hero Yet</h2>
                    <p style="color: var(--text-secondary);">Character creation coming soon!</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: var(--accent);">${this.data.name || 'Hero'}</h2>
                    <p style="color: var(--text-secondary);">Level ${this.data.level || 1}</p>
                </div>
            `;
        }
    },

    getQuickView() {
        if (!this.data) {
            return `
                <div style="text-align: center;">
                    <p style="color: var(--text-muted);">No hero created yet.</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Go to Hero tab to begin!</p>
                </div>
            `;
        }
        return `
            <div style="text-align: center;">
                <p style="color: var(--accent); font-size: 1.2rem;">${this.data.name || 'Hero'}</p>
                <p style="color: var(--text-secondary);">Level ${this.data.level || 1}</p>
            </div>
        `;
    }
};
