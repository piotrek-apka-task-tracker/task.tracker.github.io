// ==========================================
// UI Manager
// ==========================================

const UI = {
    currentView: 'dashboard',
    currentTaskFilter: 'all',

    init() {
        this.bindNavigation();
        this.bindAuthForms();
        this.bindTaskForm();
        this.bindHabitForm();
        this.bindDungeonControls();
    },

    // ---- Navigation ----
    bindNavigation() {
        // Top nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Bottom nav buttons
        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            this.showScreen('login-screen');
        });
    },

    switchView(viewName) {
        this.currentView = viewName;

        // Update nav buttons
        document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Show view
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(`view-${viewName}`);
        if (view) view.classList.add('active');

        // Refresh view data
        this.refreshView(viewName);
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    refreshView(viewName) {
        const data = Auth.getData();
        if (!data) return;

        switch (viewName) {
            case 'dashboard': this.updateDashboard(data); break;
            case 'tasks': this.updateTasksView(data); break;
            case 'habits': this.updateHabitsView(data); break;
            case 'character': this.updateCharacterView(data); break;
            case 'dungeon': this.updateDungeonView(data); break;
            case 'lore': this.updateLoreView(data); break;
        }
    },

    refreshAll() {
        const data = Auth.getData();
        if (!data) return;

        document.getElementById('nav-hero-name').textContent = data.character.name;
        this.refreshView(this.currentView);
    },

    // ---- Auth Forms ----
    bindAuthForms() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
            });
        });

        // Class selection
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            const result = Auth.login(username, password);
            if (result.success) {
                this.showScreen('main-app');
                this.refreshAll();
                this.switchView('dashboard');
            } else {
                document.getElementById('login-error').textContent = result.error;
            }
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-password-confirm').value;
            const heroName = document.getElementById('reg-heroname').value.trim();
            const selectedClass = document.querySelector('.class-btn.selected');

            if (password !== confirm) {
                document.getElementById('register-error').textContent = 'Passwords do not match!';
                return;
            }

            if (!selectedClass) {
                document.getElementById('register-error').textContent = 'Please select a class!';
                return;
            }

            const heroClass = selectedClass.dataset.class;
            const result = Auth.register(username, password, heroName, heroClass);

            if (result.success) {
                this.showScreen('main-app');
                this.refreshAll();
                this.switchView('dashboard');
                this.showToast('🎮 Welcome to QuestForge! Your adventure begins!', 'success');
            } else {
                document.getElementById('register-error').textContent = result.error;
            }
        });
    },

    // ---- Dashboard ----
    updateDashboard(data) {
        if (!data) data = Auth.getData();
        const char = data.character;
        const classIcon = Character.classIcons[char.class] || '⚔️';

        // Hero summary
        document.getElementById('dash-hero-avatar').textContent = classIcon;
        document.getElementById('dash-hero-name').textContent = char.name;
        document.getElementById('dash-hero-class').textContent = `${classIcon} ${char.class}`;
        document.getElementById('dash-hero-level').textContent = `Lv. ${char.level}`;

        // XP bar
        const xpPercent = (char.xp / char.xpToNext) * 100;
        document.getElementById('dash-xp-fill').style.width = xpPercent + '%';
        document.getElementById('dash-xp-text').textContent = `${char.xp} / ${char.xpToNext} XP`;

        // Stats mini
        const statsHtml = Object.entries(char.stats).map(([stat, val]) => {
            const icons = { strength: '💪', dexterity: '🏃', constitution: '🛡️', intelligence: '🧠', wisdom: '👁️', charisma: '✨' };
            return `
                <div class="stat-mini">
                    <div class="stat-mini-icon">${icons[stat]}</div>
                    <span class="stat-mini-val">${val}</span>
                    <span class="stat-mini-name">${stat.substring(0, 3)}</span>
                </div>
            `;
        }).join('');
        document.getElementById('dash-stats-mini').innerHTML = statsHtml;

        // Today's tasks
        Tasks.resetDailyRecurring(data);
        const todayTasks = Tasks.getTodaysTasks(data);
        if (todayTasks.length === 0) {
            document.getElementById('dash-today-tasks').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No quests yet. Create some to start earning XP!</p>
                </div>
            `;
        } else {
            document.getElementById('dash-today-tasks').innerHTML = todayTasks.slice(0, 6).map(t => `
                <div class="today-task-item ${t.completed ? 'completed' : ''}" onclick="UI.quickCompleteTask('${t.id}')">
                    <div class="task-check ${t.completed ? 'checked' : ''}">${t.completed ? '✓' : ''}</div>
                    <span class="task-title">${this.escapeHtml(t.name)}</span>
                    <span class="task-xp-badge">${Tasks.difficultyXp[t.difficulty]} XP</span>
                </div>
            `).join('');
        }

        // Streaks
        const habitsWithStreaks = data.habits.filter(h => h.streak > 0).sort((a, b) => b.streak - a.streak);
        if (habitsWithStreaks.length === 0) {
            document.getElementById('dash-streaks').innerHTML = `
                <div class="empty-state">
                    <p>Build habits to start streaks! 🔥</p>
                </div>
            `;
        } else {
            document.getElementById('dash-streaks').innerHTML = habitsWithStreaks.slice(0, 5).map(h => `
                <div class="streak-item">
                    <span class="streak-name">${this.escapeHtml(h.name)}</span>
                    <span class="streak-count"><span class="streak-fire">🔥</span> ${h.streak} days</span>
                </div>
            `).join('');
        }

        // Dungeon info
        document.getElementById('dash-dungeon-info').innerHTML = `
            <span class="floor-label">Next Floor</span>
            <span class="floor-number">${data.dungeon.currentFloor}</span>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">
                Deepest: Floor ${data.dungeon.deepestFloor} | Bosses slain: ${data.dungeon.bossesDefeated.length}
            </p>
        `;

        // Recent artifacts
        const artifacts = data.dungeon.artifacts || [];
        if (artifacts.length === 0) {
            document.getElementById('dash-artifacts').innerHTML = `
                <div class="empty-state">
                    <p>Defeat bosses to earn artifacts! ⚔️</p>
                </div>
            `;
        } else {
            document.getElementById('dash-artifacts').innerHTML = artifacts.slice(-3).reverse().map(a => `
                <div class="artifact-mini">
                    <span class="artifact-mini-icon">${a.icon}</span>
                    <div>
                        <div class="artifact-mini-name">${a.name}</div>
                        <div class="artifact-mini-desc">${a.description}</div>
                    </div>
                </div>
            `).join('');
        }

        // Daily quote
        const quotes = LoreSystem.getQuotes();
        const dayIndex = Math.floor(Date.now() / 86400000) % quotes.length;
        document.getElementById('daily-quote').textContent = quotes[dayIndex];
    },

    quickCompleteTask(taskId) {
        const data = Auth.getData();
        const task = data.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.completed) {
            Tasks.uncompleteTask(data, taskId);
        } else {
            const result = Tasks.completeTask(data, taskId);
            if (result) {
                this.showToast(`✅ Quest complete! +${result.xpGained} XP (${result.stat})`, 'xp');
                if (result.leveledUp) {
                    this.showLevelUp(result.newLevel);
                }
                if (result.statLeveledUp) {
                    this.showStatUp(result.statLeveledName, result.statNewValue);
                }
            }
        }

        this.updateDashboard();
    },

    // ---- Tasks View ----
    bindTaskForm() {
        document.getElementById('add-task-btn').addEventListener('click', () => {
            document.getElementById('task-edit-id').value = '';
            document.getElementById('task-form').reset();
            document.getElementById('task-modal-title').textContent = 'Create New Quest';
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.diff-btn[data-diff="easy"]').classList.add('active');
            this.openModal('task-modal');
        });

        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Auth.getData();
            const editId = document.getElementById('task-edit-id').value;

            const taskData = {
                name: document.getElementById('task-name').value.trim(),
                description: document.getElementById('task-desc').value.trim(),
                category: document.getElementById('task-category').value,
                difficulty: document.querySelector('.diff-btn.active')?.dataset.diff || 'easy',
                stat: document.getElementById('task-stat').value,
                dueDate: document.getElementById('task-due').value || null,
                recurring: document.getElementById('task-recurring').checked
            };

            if (editId) {
                Tasks.updateTask(data, editId, taskData);
                this.showToast('📝 Quest updated!', 'info');
            } else {
                Tasks.addTask(data, taskData);
                this.showToast('📋 New quest added!', 'success');
            }

            this.closeModal('task-modal');
            this.updateTasksView();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTaskFilter = btn.dataset.filter;
                this.updateTasksView();
            });
        });
    },

    updateTasksView(data) {
        if (!data) data = Auth.getData();
        const tasks = Tasks.getFilteredTasks(data, this.currentTaskFilter);

        if (tasks.length === 0) {
            document.getElementById('task-list').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No quests found. Create your first quest to begin!</p>
                </div>
            `;
            return;
        }

        document.getElementById('task-list').innerHTML = tasks.map(t => {
            const categoryIcon = Tasks.categoryIcons[t.category] || '⭐';
            const statIcons = { strength: '💪', dexterity: '🏃', constitution: '🛡️', intelligence: '🧠', wisdom: '👁️', charisma: '✨' };

            return `
                <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                    <div class="task-checkbox ${t.completed ? 'checked' : ''}" onclick="UI.toggleTask('${t.id}')">
                        ${t.completed ? '✓' : ''}
                    </div>
                    <div class="task-info">
                        <div class="task-info-title">${this.escapeHtml(t.name)}</div>
                        ${t.description ? `<div class="task-info-desc">${this.escapeHtml(t.description)}</div>` : ''}
                    </div>
                    <div class="task-meta">
                        <span class="task-category-badge ${t.category}">${categoryIcon} ${t.category}</span>
                        <span class="task-stat-badge">${statIcons[t.stat] || ''} ${Tasks.difficultyXp[t.difficulty]} XP</span>
                        ${t.recurring ? '<span class="task-stat-badge">🔄</span>' : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn" onclick="UI.editTask('${t.id}')" title="Edit">✏️</button>
                        <button class="task-action-btn" onclick="UI.deleteTask('${t.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    toggleTask(taskId) {
        const data = Auth.getData();
        const task = data.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.completed) {
            Tasks.uncompleteTask(data, taskId);
            this.updateTasksView();
        } else {
            const result = Tasks.completeTask(data, taskId);
            if (result) {
                this.showToast(`✅ Quest complete! +${result.xpGained} XP (${result.stat})`, 'xp');
                if (result.leveledUp) {
                    this.showLevelUp(result.newLevel);
                }
                if (result.statLeveledUp) {
                    this.showStatUp(result.statLeveledName, result.statNewValue);
                }
            }
            this.updateTasksView();
        }
    },

    editTask(taskId) {
        const data = Auth.getData();
        const task = data.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('task-edit-id').value = task.id;
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-desc').value = task.description || '';
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-stat').value = task.stat;
        document.getElementById('task-due').value = task.dueDate || '';
        document.getElementById('task-recurring').checked = task.recurring;
        document.getElementById('task-modal-title').textContent = 'Edit Quest';

        document.querySelectorAll('.diff-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.diff === task.difficulty);
        });

        this.openModal('task-modal');
    },

    deleteTask(taskId) {
        if (!confirm('Delete this quest?')) return;
        const data = Auth.getData();
        Tasks.deleteTask(data, taskId);
        this.updateTasksView();
        this.showToast('🗑️ Quest deleted.', 'info');
    },

    // ---- Habits View ----
    bindHabitForm() {
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            document.getElementById('habit-form').reset();
            document.querySelectorAll('.habit-type-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.habit-type-btn[data-type="good"]').classList.add('active');
            this.openModal('habit-modal');
        });

        // Habit type buttons
        document.querySelectorAll('.habit-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.habit-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Habit form
        document.getElementById('habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Auth.getData();

            const habit = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                name: document.getElementById('habit-name').value.trim(),
                type: document.querySelector('.habit-type-btn.active')?.dataset.type || 'good',
                stat: document.getElementById('habit-stat').value,
                xp: parseInt(document.getElementById('habit-xp').value),
                streak: 0,
                bestStreak: 0,
                lastCompleted: null,
                totalCompletions: 0,
                createdAt: Date.now()
            };

            data.habits.push(habit);
            Auth.saveData(data);

            this.closeModal('habit-modal');
            this.updateHabitsView();
            this.showToast(`🔄 New habit "${habit.name}" created!`, 'success');
        });
    },

    updateHabitsView(data) {
        if (!data) data = Auth.getData();

        // Check and update streaks for bad habits
        this.updateHabitStreaks(data);

        const goodHabits = data.habits.filter(h => h.type === 'good');
        const badHabits = data.habits.filter(h => h.type === 'bad');

        const renderHabit = (h) => {
            const statIcons = { strength: '💪', dexterity: '🏃', constitution: '🛡️', intelligence: '🧠', wisdom: '👁️', charisma: '✨' };
            const today = new Date().toDateString();
            const completedToday = h.lastCompleted && new Date(h.lastCompleted).toDateString() === today;

            return `
                <div class="habit-item">
                    <button class="habit-action-btn ${h.type === 'bad' ? 'bad-habit' : ''} ${completedToday ? 'checked' : ''}"
                            onclick="UI.completeHabit('${h.id}')"
                            ${completedToday ? 'style="background: var(--accent-green); color: white; border-color: var(--accent-green);"' : ''}>
                        ${completedToday ? '✓' : (h.type === 'good' ? '+' : '✓')}
                    </button>
                    <div class="habit-info">
                        <div class="habit-name">${this.escapeHtml(h.name)}</div>
                        <div class="habit-streak">
                            🔥 ${h.streak} day streak ${h.bestStreak > 0 ? `(best: ${h.bestStreak})` : ''}
                            <span style="margin-left: 8px; color: var(--text-muted);">${statIcons[h.stat]} ${h.xp} XP</span>
                        </div>
                    </div>
                    ${h.type === 'bad' ? `
                        <button class="habit-reset-btn" onclick="UI.resetHabitStreak('${h.id}')" title="I gave in...">
                            😔 Reset
                        </button>
                    ` : ''}
                    <button class="habit-delete-btn" onclick="UI.deleteHabit('${h.id}')" title="Delete">🗑️</button>
                </div>
            `;
        };

        document.getElementById('good-habits-list').innerHTML = goodHabits.length > 0
            ? goodHabits.map(renderHabit).join('')
            : '<div class="empty-state"><p>Add good habits to build! 💪</p></div>';

        document.getElementById('bad-habits-list').innerHTML = badHabits.length > 0
            ? badHabits.map(renderHabit).join('')
            : '<div class="empty-state"><p>Add bad habits you want to break! 🚫</p></div>';
    },

    updateHabitStreaks(data) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        data.habits.forEach(habit => {
            if (habit.lastCompleted) {
                const lastDate = new Date(habit.lastCompleted).toDateString();
                // If more than 1 day has passed without completion (for good habits), reset streak
                if (habit.type === 'good' && lastDate !== today && lastDate !== yesterday) {
                    habit.streak = 0;
                }
            }
        });

        Auth.saveData(data);
    },

    completeHabit(habitId) {
        const data = Auth.getData();
        const habit = data.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toDateString();
        const completedToday = habit.lastCompleted && new Date(habit.lastCompleted).toDateString() === today;

        if (completedToday) {
            this.showToast('Already completed today! Come back tomorrow.', 'info');
            return;
        }

        habit.streak++;
        habit.totalCompletions++;
        habit.lastCompleted = Date.now();
        if (habit.streak > habit.bestStreak) {
            habit.bestStreak = habit.streak;
        }
        if (habit.streak > data.stats.longestStreak) {
            data.stats.longestStreak = habit.streak;
        }
        data.stats.habitsCompleted++;

        // Award XP
        const bonusXp = Math.floor(habit.streak / 7) * 5; // Bonus XP for streak milestones
        const totalXp = habit.xp + bonusXp;
        const result = Character.addXp(data, totalXp, habit.stat);

        Auth.saveData(data);

        this.showToast(`🔥 ${habit.name} — Streak: ${habit.streak}! +${totalXp} XP`, 'xp');

        if (result.leveledUp) {
            this.showLevelUp(result.newLevel);
        }
        if (result.statLeveledUp) {
            this.showStatUp(result.statLeveledName, result.statNewValue);
        }

        this.updateHabitsView();
    },

    resetHabitStreak(habitId) {
        if (!confirm('Reset this streak? (You gave in to the bad habit)')) return;
        const data = Auth.getData();
        
