// ================================
// TASK & HABIT SYSTEM
// ================================
const TaskSystem = {
    init() {
        this.bindTaskEvents();
        this.bindHabitEvents();
    },

    // ============ TASKS ============
    bindTaskEvents() {
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            document.getElementById('task-modal').classList.remove('hidden');
        });

        // Close modal
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.close).classList.add('hidden');
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });

        // Difficulty select
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Task form submit
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderTasks(btn.dataset.filter);
            });
        });
    },

    createTask() {
        const name = document.getElementById('task-name').value.trim();
        const desc = document.getElementById('task-desc').value.trim();
        const category = document.getElementById('task-category').value;
        const stat = document.getElementById('task-stat').value;
        const difficulty = document.querySelector('.diff-btn.active').dataset.diff;
        const dueDate = document.getElementById('task-due').value;

        if (!name) return;

        const xpValues = { easy: 5, medium: 15, hard: 30, epic: 50 };

        const task = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name,
            description: desc,
            category,
            stat,
            difficulty,
            xp: xpValues[difficulty],
            dueDate: dueDate || null,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        const userData = Storage.getUserData(App.currentUser);
        userData.tasks.push(task);
        Storage.saveUserData(App.currentUser, userData);

        // Reset form
        document.getElementById('task-form').reset();
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.diff-btn[data-diff="easy"]').classList.add('active');
        document.getElementById('task-modal').classList.add('hidden');

        this.renderTasks();
        App.updateDashboard();
        App.showToast('Quest Created', `"${name}" has been added to your quests!`, 'success');
    },

    completeTask(taskId) {
        const userData = Storage.getUserData(App.currentUser);
        const task = userData.tasks.find(t => t.id === taskId);
        
        if (!task || task.completed) return;

        task.completed = true;
        task.completedAt = new Date().toISOString();
        userData.stats.tasksCompleted++;

        // Award XP
        const result = CharacterSystem.addXP(userData, task.xp, task.stat);
        
        Storage.saveUserData(App.currentUser, userData);

        // Show notifications
        const statEmojis = {
            strength: '💪', dexterity: '🏃', intelligence: '🧠',
            wisdom: '🦉', charisma: '✨', vitality: '❤️'
        };
        
        App.showToast(
            'Quest Complete!', 
            `+${task.xp} XP | ${statEmojis[task.stat]} ${task.stat} +${result.statGain}`, 
            'xp'
        );

        if (result.leveled) {
            setTimeout(() => App.showLevelUp(userData.character.level), 500);
        }

        this.renderTasks();
        App.updateCharacterDisplay();
        App.updateDashboard();
    },

    deleteTask(taskId) {
        const userData = Storage.getUserData(App.currentUser);
        userData.tasks = userData.tasks.filter(t => t.id !== taskId);
        Storage.saveUserData(App.currentUser, userData);
        this.renderTasks();
        App.updateDashboard();
    },

    renderTasks(filter = 'all') {
        const userData = Storage.getUserData(App.currentUser);
        let tasks = userData.tasks || [];

        // Sort: incomplete first, then by creation date
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Apply filter
        if (filter === 'active') tasks = tasks.filter(t => !t.completed);
        else if (filter === 'completed') tasks = tasks.filter(t => t.completed);
        else if (['work', 'fitness', 'music', 'learning', 'health', 'personal'].includes(filter)) {
            tasks = tasks.filter(t => t.category === filter);
        }

        const container = document.getElementById('task-list');
        
        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">No quests found. Create your first quest!</p>';
            return;
        }

        const categoryEmojis = {
            work: '💼', fitness: '💪', music: '🎵',
            learning: '📚', health: '❤️', personal: '🌟'
        };

        const statEmojis = {
            strength: '💪', dexterity: '🏃', intelligence: '🧠',
            wisdom: '🦉', charisma: '✨', vitality: '❤️'
        };

        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-check ${task.completed ? 'checked' : ''}" onclick="TaskSystem.completeTask('${task.id}')">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-info">
                    <div class="task-info-name">${this.escapeHtml(task.name)}</div>
                    <div class="task-info-meta">
                        <span>${categoryEmojis[task.category] || '📋'} ${task.category}</span>
                        <span>${statEmojis[task.stat] || ''} ${task.stat}</span>
                        ${task.dueDate ? `<span>📅 ${task.dueDate}</span>` : ''}
                    </div>
                </div>
                <span class="task-xp">+${task.xp} XP</span>
                <button class="task-delete" onclick="TaskSystem.deleteTask('${task.id}')" title="Delete">🗑️</button>
            </div>
        `).join('');
    },

    // ============ HABITS ============
    bindHabitEvents() {
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            document.getElementById('habit-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createHabit();
        });
    },

    createHabit() {
        const name = document.getElementById('habit-name').value.trim();
        const type = document.querySelector('.type-btn.active').dataset.type;
        const stat = document.getElementById('habit-stat').value;
        const frequency = document.getElementById('habit-frequency').value;

        if (!name) return;

        const habit = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name,
            type,
            stat,
            frequency,
            streak: 0,
            lastCompleted: null,
            lastFailed: null,
            totalCompleted: 0,
            totalFailed: 0,
            createdAt: new Date().toISOString()
        };

        const userData = Storage.getUserData(App.currentUser);
        userData.habits.push(habit);
        Storage.saveUserData(App.currentUser, userData);

        document.getElementById('habit-form').reset();
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.type-btn[data-type="good"]').classList.add('active');
        document.getElementById('habit-modal').classList.add('hidden');

        this.renderHabits();
        App.updateDashboard();
        App.showToast('Habit Created', `"${name}" has been added!`, 'success');
    },

    habitPositive(habitId) {
        const userData = Storage.getUserData(App.currentUser);
        const habit = userData.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toDateString();

        if (habit.type === 'good') {
            // Check if already done today
            if (habit.lastCompleted === today) {
                App.showToast('Already Done', 'You already completed this habit today!', 'error');
                return;
            }
            habit.lastCompleted = today;
            habit.totalCompleted++;
            habit.streak++;

            const xpGain = 10 + Math.min(habit.streak * 2, 20);
            const result = CharacterSystem.addXP(userData, xpGain, habit.stat);
            
            userData.stats.habitsTracked++;
            Storage.saveUserData(App.currentUser, userData);

            App.showToast('Habit Done! 🔥', `+${xpGain} XP | Streak: ${habit.streak}`, 'xp');
            if (result.leveled) {
                setTimeout(() => App.showLevelUp(userData.character.level), 500);
            }
        } else {
            // Bad habit - positive means you RESISTED it
            if (habit.lastCompleted === today) {
                App.showToast('Already Tracked', 'Already marked as resisted today!', 'error');
                return;
            }
            habit.lastCompleted = today;
            habit.totalCompleted++;
            habit.streak++;

            const xpGain = 15 + Math.min(habit.streak * 3, 30);
            const result = CharacterSystem.addXP(userData, xpGain, habit.stat);
            
            userData.stats.habitsTracked++;
            Storage.saveUserData(App.currentUser, userData);

            App.showToast('Resisted! 💪', `+${xpGain} XP | ${habit.streak} days clean!`, 'xp');
            if (result.leveled) {
                setTimeout(() => App.showLevelUp(userData.character.level), 500);
            }
        }

        this.renderHabits();
        App.updateCharacterDisplay();
        App.updateDashboard();
    },

    habitNegative(habitId) {
        const userData = Storage.getUserData(App.currentUser);
        const habit = userData.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toDateString();

        if (habit.type === 'bad') {
            // Failed to resist bad habit
            habit.lastFailed = today;
            habit.totalFailed++;
            habit.streak = 0;

            // Penalty: lose some HP
            const hpLoss = 10;
            userData.character.hp = Math.max(1, userData.character.hp - hpLoss);
            Storage.saveUserData(App.currentUser, userData);

            App.showToast('Gave In... 😔', `Streak reset! -${hpLoss} HP`, 'error');
        } else {
            // Skipped good habit
            habit.lastFailed = today;
            habit.totalFailed++;
            habit.streak = 0;

            const hpLoss = 5;
            userData.character.hp = Math.max(1, userData.character.hp - hpLoss);
            Storage.saveUserData(App.currentUser, userData);

            App.showToast('Skipped... 😞', `Streak reset! -${hpLoss} HP`, 'error');
        }

        this.renderHabits();
        App.updateCharacterDisplay();
        App.updateDashboard();
    },

    deleteHabit(habitId) {
        const userData = Storage.getUserData(App.currentUser);
        userData.habits = userData.habits.filter(h => h.id !== habitId);
        Storage.saveUserData(App.currentUser, userData);
        this.renderHabits();
        App.updateDashboard();
    },

    renderHabits() {
        const userData = Storage.getUserData(App.currentUser);
        const habits = userData.habits || [];

        const goodHabits = habits.filter(h => h.type === 'good');
        const badHabits = habits.filter(h => h.type === 'bad');

        const today = new Date().toDateString();

        const renderHabitItem = (habit) => {
            const doneToday = habit.lastCompleted === today;
            const failedToday = habit.lastFailed === today;
            
            return `
                <div class="habit-item ${habit.type === 'good' ? 'good-habit' : 'bad-habit'}">
                    <div class="habit-actions">
                        <button class="habit-btn positive" onclick="TaskSystem.habitPositive('${habit.id}')" title="${habit.type === 'good' ? 'Done!' : 'Resisted!'}">
                            ${doneToday ? '✅' : '+'}
                        </button>
                        <button class="habit-btn negative" onclick="TaskSystem.habitNegative('${habit.id}')" title="${habit.type === 'good' ? 'Skipped' : 'Gave in'}">
                            ${failedToday ? '❌' : '−'}
                        </button>
                    </div>
                    <div class="habit-info">
                        <div class="habit-info-name">${this.escapeHtml(habit.name)}</div>
                        <div class="habit-streak">
                            🔥 Streak: ${habit.streak} | ✅ ${habit.totalCompleted} | ❌ ${habit.totalFailed}
                        </div>
                    </div>
                    <button class="task-delete" onclick="TaskSystem.deleteHabit('${habit.id}')" title="Delete">🗑️</button>
                </div>
            `;
        };

        const goodContainer = document.getElementById('good-habits-list');
        const badContainer = document.getElementById('bad-habits-list');

        goodContainer.innerHTML = goodHabits.length > 0
            ? goodHabits.map(renderHabitItem).join('')
            : '<p class="empty-state">Add good habits you want to build!</p>';

        badContainer.innerHTML = badHabits.length > 0
            ? badHabits.map(renderHabitItem).join('')
            : '<p class="empty-state">Add bad habits you want to break!</p>';
    },

    // Utility
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
