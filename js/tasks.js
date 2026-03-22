// ==========================================
// Tasks System
// ==========================================

const Tasks = {
    difficultyXp: {
        easy: 10,
        medium: 25,
        hard: 50,
        epic: 100
    },

    categoryIcons: {
        work: '💼',
        fitness: '💪',
        music: '🎵',
        learning: '📚',
        health: '❤️',
        social: '👥',
        creativity: '🎨',
        chores: '🏠',
        other: '⭐'
    },

    addTask(data, taskData) {
        const task = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name: taskData.name,
            description: taskData.description || '',
            category: taskData.category || 'other',
            difficulty: taskData.difficulty || 'easy',
            stat: taskData.stat || 'strength',
            dueDate: taskData.dueDate || null,
            recurring: taskData.recurring || false,
            completed: false,
            completedAt: null,
            createdAt: Date.now()
        };

        data.tasks.push(task);
        Auth.saveData(data);
        return task;
    },

    completeTask(data, taskId) {
        const task = data.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return null;

        task.completed = true;
        task.completedAt = Date.now();
        data.stats.tasksCompleted++;

        const xpAmount = this.difficultyXp[task.difficulty] || 10;
        const result = Character.addXp(data, xpAmount, task.stat);

        Auth.saveData(data);

        return {
            task,
            xpGained: xpAmount,
            stat: task.stat,
            ...result
        };
    },

    uncompleteTask(data, taskId) {
        const task = data.tasks.find(t => t.id === taskId);
        if (!task || !task.completed) return;

        task.completed = false;
        task.completedAt = null;
        Auth.saveData(data);
    },

    deleteTask(data, taskId) {
        data.tasks = data.tasks.filter(t => t.id !== taskId);
        Auth.saveData(data);
    },

    updateTask(data, taskId, updates) {
        const task = data.tasks.find(t => t.id === taskId);
        if (!task) return;

        Object.assign(task, updates);
        Auth.saveData(data);
    },

    getTodaysTasks(data) {
        const today = new Date().toDateString();
        return data.tasks.filter(t => {
            if (t.recurring) {
                // Reset recurring tasks daily
                if (t.completedAt) {
                    const completedDate = new Date(t.completedAt).toDateString();
                    if (completedDate !== today) {
                        t.completed = false;
                        t.completedAt = null;
                    }
                }
                return true;
            }
            return !t.completed || (t.completedAt && new Date(t.completedAt).toDateString() === today);
        });
    },

    resetDailyRecurring(data) {
        const today = new Date().toDateString();
        data.tasks.forEach(task => {
            if (task.recurring && task.completed) {
                const completedDate = new Date(task.completedAt).toDateString();
                if (completedDate !== today) {
                    task.completed = false;
                    task.completedAt = null;
                }
            }
        });
        Auth.saveData(data);
    },

    getFilteredTasks(data, filter) {
        let tasks = [...data.tasks];

        // Reset recurring first
        this.resetDailyRecurring(data);

        switch (filter) {
            case 'active':
                tasks = tasks.filter(t => !t.completed);
                break;
            case 'completed':
                tasks = tasks.filter(t => t.completed);
                break;
            case 'work':
            case 'fitness':
            case 'music':
            case 'learning':
            case 'health':
                tasks = tasks.filter(t => t.category === filter);
                break;
        }

        // Sort: active first, then by creation date (newest first)
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return b.createdAt - a.createdAt;
        });

        return tasks;
    }
};
