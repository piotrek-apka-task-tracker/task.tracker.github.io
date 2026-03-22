// ================================
// Task & Habit Management System
// ================================

const Tasks = {
    data: [],
    currentFilter: 'all',

    init() {
        console.log('Tasks module initialized');
        this.checkDailyReset();
        this.bindEvents();
    },

    bindEvents() {
        // Add task button
        const addBtn = document.getElementById('add-task-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showTaskModal();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                this.render();
            });
        });
    },

    // Check if we need to reset daily habits
    checkDailyReset() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('questforge_last_reset');

        if (lastReset !== today) {
            this.performDailyReset();
            localStorage.setItem('questforge_last_reset', today);
        }
    },

    performDailyReset() {
        console.log('Performing daily reset...');
        
        this.data.forEach(task => {
            if (task.isHabit) {
                // Check if habit was completed yesterday
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                if (task.lastCompleted === yesterdayStr) {
                    // Streak continues, just reset completion for today
                    task.completedToday = false;
                } else if (task.lastCompleted !== new Date().toDateString()) {
                    // Streak broken - reset it
                    if (task.streak > 0) {
                        console.log(`Streak broken for habit: ${task.name}`);
                    }
                    task.streak = 0;
                    task.completedToday = false;
                }
            }
        });

        Auth.saveUserData();
    },

    // Generate unique ID
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Create new task
    createTask(taskData) {
        const task = {
            id: this.generateId(),
            name: taskData.name,
            description: taskData.description || '',
            category: taskData.category || 'other',
            difficulty: taskData.difficulty || 'medium',
            isHabit: taskData.isHabit || false,
            completed: false,
            completedToday: false,
            streak: 0,
            totalCompletions: 0,
            xpReward: this.calculateXP(taskData.difficulty, taskData.category),
            statReward: this.getStatReward(taskData.category),
            createdAt: new Date().toISOString(),
            lastCompleted: null,
            dueDate: taskData.dueDate || null
        };

        this.data.push(task);
        Auth.saveUserData();
        this.render();
        
        App.notify(`Quest "${task.name}" created!`, 'success');
        return task;
    },

    // Calculate XP based on difficulty
    calculateXP(difficulty, category) {
        const baseXP = GameData.taskXP[difficulty] || 30;
        return baseXP;
    },

    // Get stat reward based on category
    getStatReward(category) {
        const cat = GameData.taskCategories[category];
        if (!cat) return { primary: 'wisdom', secondary: 'constitution' };
        
        return {
            primary: cat.primaryStat,
            secondary: cat.secondaryStat
        };
    },

    // Complete a task
    completeTask(taskId) {
        const task = this.data.find(t => t.id === taskId);
        if (!task) return;

        const today = new Date().toDateString();

        if (task.isHabit) {
            if (task.completedToday) {
                App.notify('Already completed today!', 'info');
                return;
            }
            
            task.completedToday = true;
            task.streak++;
            task.totalCompletions++;
            task.lastCompleted = today;
            
            // Calculate streak bonus
            let streakMultiplier = 1;
            for (const [days, bonus] of Object.entries(GameData.streakBonuses)) {
                if (task.streak >= parseInt(days)) {
                    streakMultiplier = bonus;
                }
            }
            
            const bonusXP = Math.floor(task.xpReward * streakMultiplier);
            this.grantRewards(task, bonusXP, streakMultiplier);
            
        } else {
            task.completed = true;
            task.lastCompleted = today;
            task.totalCompletions++;
            
            this.grantRewards(task, task.xpReward, 1);
        }

        Auth.saveUserData();
        this.render();
        App.renderDashboard();
    },

    // Grant XP and stat rewards
    grantRewards(task, xp, multiplier) {
        if (!Character.data) {
            App.notify(`Quest completed! Create a hero to earn XP.`, 'info');
            return;
        }

        // Grant XP
        Character.addExperience(xp);

        // Grant stat experience
        const primaryStatXP = Math.floor(xp * 0.6);
        const secondaryStatXP = Math.floor(xp * 0.3);

        Character.addStatExperience(task.statReward.primary, primaryStatXP);
        Character.addStatExperience(task.statReward.secondary, secondaryStatXP);

        // Build notification message
        let message = `+${xp} XP`;
        if (multiplier > 1) {
            message += ` (${Math.floor((multiplier - 1) * 100)}% streak bonus!)`;
        }
        if (task.isHabit && task.streak > 1) {
            message += ` 🔥 ${task.streak} day streak!`;
        }

        App.notify(message, 'success');
    },

    // Uncomplete a habit (undo today's completion)
    uncompleteHabit(taskId) {
        const task = this.data.find(t => t.id === taskId);
        if (!task || !task.isHabit || !task.completedToday) return;

        task.completedToday = false;
        task.streak = Math.max(0, task.streak - 1);
        task.totalCompletions = Math.max(0, task.totalCompletions - 1);

        // Note: We don't remove XP - that would be too punishing
        App.notify('Habit unmarked for today.', 'info');

        Auth.saveUserData();
        this.render();
    },

    // Delete a task
    deleteTask(taskId) {
        const taskIndex = this.data.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.data[taskIndex];
        this.data.splice(taskIndex, 1);

        Auth.saveUserData();
        this.render();
        App.closeModal();
        
        App.notify(`"${task.name}" deleted.`, 'info');
    },

    // Edit a task
    updateTask(taskId, updates) {
        const task = this.data.find(t => t.id === taskId);
        if (!task) return;

        Object.assign(task, updates);
        
        // Recalculate rewards if difficulty or category changed
        if (updates.difficulty || updates.category) {
            task.xpReward = this.calculateXP(task.difficulty, task.category);
            task.statReward = this.getStatReward(task.category);
        }

        Auth.saveUserData();
        this.render();
        App.closeModal();
        
        App.notify('Quest updated!', 'success');
    },

    // Get filtered tasks
    getFilteredTasks() {
        let filtered = [...this.data];

        if (this.currentFilter === 'habits') {
            filtered = filtered.filter(t => t.isHabit);
        } else if (this.currentFilter !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentFilter && !t.isHabit);
        }

        // Sort: incomplete first, then by creation date
        filtered.sort((a, b) => {
            // Habits: incomplete today first
            if (a.isHabit && b.isHabit) {
                if (a.completedToday !== b.completedToday) {
                    return a.completedToday ? 1 : -1;
                }
            }
            // Regular tasks: incomplete first
            if (!a.isHabit && !b.isHabit) {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
            }
            // Then by date
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return filtered;
    },

    // Get today's tasks (for dashboard)
    getTodaysTasks() {
        return this.data.filter(t => !t.isHabit && !t.completed);
    },

    // Get habits (for dashboard)
    getHabits() {
        return this.data.filter(t => t.isHabit);
    },

    // Show task creation/edit modal
    showTaskModal(taskId = null) {
        const isEdit = taskId !== null;
        const task = isEdit ? this.data.find(t => t.id === taskId) : null;

        const categoryOptions = Object.entries(GameData.taskCategories).map(([key, cat]) => `
            <option value="${key}" ${task && task.category === key ? 'selected' : ''}>
                ${cat.icon} ${cat.name}
            </option>
        `).join('');

        const difficultyOptions = ['trivial', 'easy', 'medium', 'hard', 'epic'].map(diff => `
            <option value="${diff}" ${task && task.difficulty === diff ? 'selected' : ''}>
                ${diff.charAt(0).toUpperCase() + diff.slice(1)} (+${GameData.taskXP[diff]} XP)
            </option>
        `).join('');

        const content = `
            <div class="modal-header">
                <h2>${isEdit ? '✏️ Edit Quest' : '📜 New Quest'}</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>

            <form id="task-form">
                <div class="form-group">
                    <label for="task-name">Quest Name *</label>
                    <input type="text" id="task-name" required maxlength="100"
                           value="${task ? task.name : ''}"
                           placeholder="Enter quest name...">
                </div>

                <div class="form-group">
                    <label for="task-description">Description</label>
                    <textarea id="task-description" rows="3" maxlength="500"
                              placeholder="Optional details...">${task ? task.description : ''}</textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="task-category">Category</label>
                        <select id="task-category">
                            ${categoryOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="task-difficulty">Difficulty</label>
                        <select id="task-difficulty">
                            ${difficultyOptions}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="task-due-date">Due Date (optional)</label>
                    <input type="date" id="task-due-date" 
                           value="${task && task.dueDate ? task.dueDate : ''}">
                </div>

                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="task-is-habit" 
                               ${task && task.isHabit ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        <span>🔄 This is a daily habit</span>
                    </label>
                    <p class="form-hint">Habits reset daily and build streaks for bonus XP!</p>
                </div>

                <div class="form-actions">
                    ${isEdit ? `
                        <button type="button" class="btn btn-danger" onclick="Tasks.confirmDelete('${taskId}')">
                            🗑️ Delete
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${isEdit ? 'Save Changes' : 'Create Quest'}
                    </button>
                </div>
            </form>

            <div class="category-info" id="category-info">
                ${this.getCategoryInfo(task ? task.category : 'work')}
            </div>
        `;

        App.openModal(content);

        // Bind form submit
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('task-name').value.trim(),
                description: document.getElementById('task-description').value.trim(),
                category: document.getElementById('task-category').value,
                difficulty: document.getElementById('task-difficulty').value,
                isHabit: document.getElementById('task-is-habit').checked,
                dueDate: document.getElementById('task-due-date').value || null
            };

            if (isEdit) {
                this.updateTask(taskId, formData);
            } else {
                this.createTask(formData);
            }

            App.closeModal();
        });

        // Update category info when selection changes
        document.getElementById('task-category').addEventListener('change', (e) => {
            document.getElementById('category-info').innerHTML = this.getCategoryInfo(e.target.value);
        });
    },

    // Get category info HTML
    getCategoryInfo(category) {
        const cat = GameData.taskCategories[category];
        if (!cat) return '';

        const primaryStat = GameData.stats[cat.primaryStat];
        const secondaryStat = GameData.stats[cat.secondaryStat];

        return `
            <div class="category-stats">
                <p class="category-description">${cat.description}</p>
                <p class="stat-rewards">
                    <span>Rewards:</span>
                    <span class="stat-badge" style="background: ${primaryStat.color}20; color: ${primaryStat.color};">
                        ${primaryStat.icon} ${primaryStat.name} (Primary)
                    </span>
                    <span class="stat-badge" style="background: ${secondaryStat.color}20; color: ${secondaryStat.color};">
                        ${secondaryStat.icon} ${secondaryStat.name} (Secondary)
                    </span>
                </p>
            </div>
        `;
    },

    // Confirm delete dialog
    confirmDelete(taskId) {
        const task = this.data.find(t => t.id === taskId);
        if (!task) return;

        const content = `
            <div class="modal-header">
                <h2 style="color: var(--danger);">⚠️ Delete Quest</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>

            <p style="margin-bottom: var(--space-lg);">
                Are you sure you want to delete "<strong>${task.name}</strong>"?
                ${task.isHabit && task.streak > 0 ? `<br><br>⚠️ This will lose your ${task.streak} day streak!` : ''}
            </p>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="Tasks.showTaskModal('${taskId}')">
                    Cancel
                </button>
                <button class="btn btn-danger" onclick="Tasks.deleteTask('${taskId}')">
                    Delete Forever
                </button>
            </div>
        `;

        App.openModal(content);
    },

    // Render task list
    render() {
        const container = document.getElementById('tasks-list');
        if (!container) return;

        const tasks = this.getFilteredTasks();

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-icon">📜</p>
                    <p class="empty-text">No quests found</p>
                    <p class="empty-hint">
                        ${this.currentFilter === 'all' 
                            ? 'Click "+ New Quest" to begin your adventure!' 
                            : 'No quests in this category yet.'}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');

        // Bind click events for task cards
        container.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;
            
            // Complete button
            const completeBtn = card.querySelector('.task-complete-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.completeTask(taskId);
                });
            }

            // Undo button (for habits)
            const undoBtn = card.querySelector('.task-undo-btn');
            if (undoBtn) {
                undoBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.uncompleteHabit(taskId);
                });
            }

            // Edit on card click
            card.addEventListener('click', () => {
                this.showTaskModal(taskId);
            });
        });
    },

    // Render individual task card
    renderTaskCard(task) {
        const cat = GameData.taskCategories[task.category] || GameData.taskCategories.other;
        const isCompleted = task.isHabit ? task.completedToday : task.completed;
        
        let streakDisplay = '';
        if (task.isHabit) {
            if (task.streak > 0) {
                streakDisplay = `<span class="streak-badge">🔥 ${task.streak}</span>`;
            }
        }

        let statusButton = '';
        if (task.isHabit) {
            if (task.completedToday) {
                statusButton = `
                    <button class="task-undo-btn" title="Undo">
                        ↩️
                    </button>
                `;
            } else {
                statusButton = `
                    <button class="task-complete-btn" title="Complete">
                        ⬜
                    </button>
                `;
            }
        } else {
            if (!task.completed) {
                statusButton = `
                    <button class="task-complete-btn" title="Complete">
                        ⬜
                    </button>
                `;
            } else {
                statusButton = `<span class="task-done">✅</span>`;
            }
        }

        const difficultyClass = `difficulty-${task.difficulty}`;

        return `
            <div class="task-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-status">
                    ${statusButton}
                </div>
                
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-name">${task.name}</span>
                        ${streakDisplay}
                    </div>
                    
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    
                    <div class="task-meta">
                        <span class="task-category" style="background: ${cat.color}20; color: ${cat.color};">
                            ${cat.icon} ${cat.name}
                        </span>
                        <span class="task-difficulty ${difficultyClass}">
                            ${task.difficulty}
                        </span>
                        <span class="task-xp">
                            +${task.xpReward} XP
                        </span>
                        ${task.isHabit ? '<span class="task-habit-badge">🔄 Habit</span>' : ''}
                    </div>
                </div>

                <div class="task-actions">
                    <span class="task-edit-hint">Click to edit</span>
                </div>
            </div>
        `;
    },

    // Get task preview for dashboard
    getTaskPreview(task) {
        const cat = GameData.taskCategories[task.category] || GameData.taskCategories.other;
        
        return `
            <div class="task-preview" onclick="App.switchView('tasks')">
                <span class="preview-category" style="color: ${cat.color};">${cat.icon}</span>
                <span class="preview-name">${task.name}</span>
                <span class="preview-xp">+${task.xpReward}</span>
            </div>
        `;
    },

    // Get habit preview for dashboard
    getHabitPreview(habit) {
        const isCompleted = habit.completedToday;
        
        return `
            <div class="habit-preview ${isCompleted ? 'completed' : ''}" 
                 onclick="Tasks.completeTask('${habit.id}')">
                <span class="preview-status">${isCompleted ? '✅' : '⬜'}</span>
                <span class="preview-name">${habit.name}</span>
                ${habit.streak > 0 ? `<span class="preview-streak">🔥${habit.streak}</span>` : ''}
            </div>
        `;
    }
};
