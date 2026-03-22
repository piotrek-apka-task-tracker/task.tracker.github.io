// ================================
// Tasks System (Placeholder)
// Will be fully implemented in Segment 3
// ================================

const Tasks = {
    data: [],

    init() {
        // Placeholder - will be implemented later
        console.log('Tasks module initialized (placeholder)');
    },

    render() {
        const container = document.getElementById('tasks-list');
        if (!container) return;

        if (this.data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <p>No quests yet. Task system coming soon!</p>
                </div>
            `;
        } else {
            container.innerHTML = this.data.map(task => `
                <div style="padding: 1rem; background: var(--bg-medium); border-radius: 8px; margin-bottom: 0.5rem;">
                    ${task.name}
                </div>
            `).join('');
        }
    },

    getTodaysTasks() {
        // Placeholder - returns empty array
        return this.data.filter(t => !t.completed);
    },

    getHabits() {
        // Placeholder - returns empty array
        return this.data.filter(t => t.isHabit);
    },

    getTaskPreview(task) {
        return `
            <div style="padding: 0.5rem; background: var(--bg-medium); border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.9rem;">
                ${task.name || 'Task'}
            </div>
        `;
    },

    getHabitPreview(habit) {
        return `
            <div style="padding: 0.5rem; background: var(--bg-medium); border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.9rem;">
                ${habit.name || 'Habit'}
            </div>
        `;
    }
};
