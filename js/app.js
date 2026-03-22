// ================================
// Main Application Controller
// ================================

const App = {
    currentUser: null,
    currentView: 'dashboard',

    init() {
        this.checkAuth();
        this.bindEvents();
        this.setupAutoSave();
    },

    checkAuth() {
        const savedUser = localStorage.getItem('questforge_current_user');
        if (savedUser) {
            this.currentUser = savedUser;
            Auth.loadUserData(this.currentUser);
            this.showGameScreen();
        }
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            Auth.showAccountSettings();
        });

        // Leaderboard button
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            Auth.showLeaderboard();
        });

        // Modal close on overlay click
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    setupAutoSave() {
        // Save every 30 seconds
        setInterval(() => {
            Auth.saveUserData();
        }, 30000);

        // Save when leaving page
        window.addEventListener('beforeunload', () => {
            Auth.saveUserData();
        });
    },

    switchView(view) {
        // Save data when switching views
        Auth.saveUserData();
        
        this.currentView = view;

        // Update nav buttons
        document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        document.getElementById(`${view}-view`).classList.add('active');

        // Refresh view content
        this.refreshView(view);
    },

    refreshView(view) {
        switch(view) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'tasks':
                Tasks.render();
                break;
            case 'character':
                Character.render();
                break;
            case 'dungeon':
                Dungeon.render();
                break;
        }
    },

    renderDashboard() {
        // Quick character display
        const charQuick = document.getElementById('quick-character-display');
        if (Character.data) {
            charQuick.innerHTML = Character.getQuickView();
        } else {
            charQuick.innerHTML = '<p class="text-muted">Create your hero in the Character tab!</p>';
        }

        // Today's tasks
        const todayTasks = document.getElementById('today-tasks-list');
        const tasks = Tasks.getTodaysTasks();
        if (tasks.length > 0) {
            todayTasks.innerHTML = tasks.slice(0, 5).map(t => Tasks.getTaskPreview(t)).join('');
        } else {
            todayTasks.innerHTML = '<p class="text-muted">No quests for today. Add some!</p>';
        }

        // Daily habits
        const habitsDiv = document.getElementById('daily-habits-list');
        const habits = Tasks.getHabits();
        if (habits.length > 0) {
            habitsDiv.innerHTML = habits.map(h => Tasks.getHabitPreview(h)).join('');
        } else {
            habitsDiv.innerHTML = '<p class="text-muted">No habits tracked yet.</p>';
        }

        // Dungeon progress
        const dungeonQuick = document.getElementById('dungeon-quick-display');
        dungeonQuick.innerHTML = Dungeon.getQuickView();
    },

    showGameScreen() {
    console.log('showGameScreen() called');
    
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    
    console.log('Login screen element:', loginScreen);
    console.log('Game screen element:', gameScreen);
    
    if (!loginScreen) {
        console.error('ERROR: login-screen element not found!');
        return;
    }
    if (!gameScreen) {
        console.error('ERROR: game-screen element not found!');
        return;
    }
    
    loginScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    console.log('Login screen classes:', loginScreen.className);
    console.log('Game screen classes:', gameScreen.className);
    
    // Get display name from users
    const users = Auth.getUsers();
    const displayName = users[this.currentUser]?.username || this.currentUser;
    
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.textContent = displayName;
    }
    
    console.log('Initializing modules...');
    
    // Initialize all modules
    Character.init();
    Tasks.init();
    Dungeon.init();
    
    console.log('Rendering dashboard...');
    this.renderDashboard();
    
    console.log('showGameScreen() complete');
},

    showLoginScreen() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
    },

    logout() {
        Auth.saveUserData();
        localStorage.removeItem('questforge_current_user');
        this.currentUser = null;
        this.showLoginScreen();
    },

    // Modal System
    openModal(content) {
        document.getElementById('modal-content').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    // Utility: Show notification
    notify(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--secondary)'};
            color: ${type === 'success' ? 'var(--bg-dark)' : 'var(--text-primary)'};
            border-radius: var(--radius-md);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Save all data
    saveAllData() {
        Auth.saveUserData();
    }
};

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
