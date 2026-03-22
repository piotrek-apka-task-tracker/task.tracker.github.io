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
    // Placeholder for XP - will be fully implemented in Segment 4
    addExperience(xp) {
        if (!this.data) {
            console.log(`Would add ${xp} XP, but no character exists`);
            return;
        }
        
        if (!this.data.experience) this.data.experience = 0;
        if (!this.data.level) this.data.level = 1;
        
        this.data.experience += xp;
        console.log(`Added ${xp} XP. Total: ${this.data.experience}`);
        
        // Simple level up check
        const xpNeeded = this.data.level * 100;
        while (this.data.experience >= xpNeeded) {
            this.data.experience -= xpNeeded;
            this.data.level++;
            App.notify(`🎉 Level Up! You are now level ${this.data.level}!`, 'success');
        }
        
        Auth.saveUserData();
    },

    // Placeholder for stat XP - will be fully implemented in Segment 4
    addStatExperience(stat, xp) {
        if (!this.data) return;
        
        if (!this.data.statXP) this.data.statXP = {};
        if (!this.data.statXP[stat]) this.data.statXP[stat] = 0;
        
        this.data.statXP[stat] += xp;
        console.log(`Added ${xp} ${stat} XP. Total: ${this.data.statXP[stat]}`);
        
        Auth.saveUserData();
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
