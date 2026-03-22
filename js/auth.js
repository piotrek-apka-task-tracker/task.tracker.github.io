// ================================
// Authentication System
// ================================

const Auth = {
    // Simple hash function for passwords (client-side only)
    // Note: For production, use a proper backend with bcrypt
    hashPassword(password) {
        let hash = 0;
        const salt = 'questforge_salt_2024';
        const salted = salt + password + salt;
        
        for (let i = 0; i < salted.length; i++) {
            const char = salted.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convert to positive hex string
        return Math.abs(hash).toString(16).padStart(8, '0');
    },

    // Get all users from storage
    getUsers() {
        const users = localStorage.getItem('questforge_users');
        return users ? JSON.parse(users) : {};
    },

    // Save users to storage
    saveUsers(users) {
        localStorage.setItem('questforge_users', JSON.stringify(users));
    },

    // Check if username exists
    userExists(username) {
        const users = this.getUsers();
        return username.toLowerCase() in users;
    },

    // Register new user
    register(username, password) {
        const users = this.getUsers();
        const userKey = username.toLowerCase();

        if (this.userExists(username)) {
            return { success: false, message: 'Username already exists!' };
        }

        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters!' };
        }

        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters!' };
        }

        // Create new user
        users[userKey] = {
            username: username, // Store original case
            passwordHash: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        this.saveUsers(users);

        // Initialize empty user data
        this.initializeUserData(userKey);

        return { success: true, message: 'Account created successfully!' };
    },

    // Login user
    login(username, password) {
        const users = this.getUsers();
        const userKey = username.toLowerCase();

        if (!this.userExists(username)) {
            return { success: false, message: 'User not found!' };
        }

        const user = users[userKey];
        const passwordHash = this.hashPassword(password);

        if (user.passwordHash !== passwordHash) {
            return { success: false, message: 'Incorrect password!' };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);

        // Set current user
        localStorage.setItem('questforge_current_user', userKey);

        return { success: true, message: 'Login successful!', username: user.username };
    },

    // Initialize new user data
    initializeUserData(userKey) {
        const initialData = {
            character: null,
            tasks: [],
            dungeon: {
                currentLevel: 1,
                highestLevel: 1,
                bossesDefeated: [],
                artifacts: [],
                loreUnlocked: []
            }
        };

        localStorage.setItem(`questforge_data_${userKey}`, JSON.stringify(initialData));
    },

    // Load user data
    loadUserData(userKey) {
        const dataStr = localStorage.getItem(`questforge_data_${userKey}`);
        
        if (!dataStr) {
            this.initializeUserData(userKey);
            return this.loadUserData(userKey);
        }

        const data = JSON.parse(dataStr);

        // Load into respective modules
        Character.data = data.character;
        Tasks.data = data.tasks || [];
        Dungeon.data = data.dungeon || {
            currentLevel: 1,
            highestLevel: 1,
            bossesDefeated: [],
            artifacts: [],
            loreUnlocked: []
        };

        return data;
    },

    // Save current user data
    saveUserData() {
        const userKey = localStorage.getItem('questforge_current_user');
        if (!userKey) return;

        const data = {
            character: Character.data,
            tasks: Tasks.data,
            dungeon: Dungeon.data
        };

        localStorage.setItem(`questforge_data_${userKey}`, JSON.stringify(data));
    },

    // Delete user account
    deleteAccount(username, password) {
        const users = this.getUsers();
        const userKey = username.toLowerCase();

        if (!this.userExists(username)) {
            return { success: false, message: 'User not found!' };
        }

        const user = users[userKey];
        const passwordHash = this.hashPassword(password);

        if (user.passwordHash !== passwordHash) {
            return { success: false, message: 'Incorrect password!' };
        }

        // Remove user
        delete users[userKey];
        this.saveUsers(users);

        // Remove user data
        localStorage.removeItem(`questforge_data_${userKey}`);

        // Logout if current user
        if (localStorage.getItem('questforge_current_user') === userKey) {
            localStorage.removeItem('questforge_current_user');
        }

        return { success: true, message: 'Account deleted successfully!' };
    },

    // Change password
    changePassword(username, oldPassword, newPassword) {
        const users = this.getUsers();
        const userKey = username.toLowerCase();

        if (!this.userExists(username)) {
            return { success: false, message: 'User not found!' };
        }

        const user = users[userKey];
        const oldHash = this.hashPassword(oldPassword);

        if (user.passwordHash !== oldHash) {
            return { success: false, message: 'Current password is incorrect!' };
        }

        if (newPassword.length < 4) {
            return { success: false, message: 'New password must be at least 4 characters!' };
        }

        user.passwordHash = this.hashPassword(newPassword);
        this.saveUsers(users);

        return { success: true, message: 'Password changed successfully!' };
    },

    // Get user stats (for potential leaderboard)
    getUserStats(userKey) {
        const dataStr = localStorage.getItem(`questforge_data_${userKey}`);
        if (!dataStr) return null;

        const data = JSON.parse(dataStr);
        
        return {
            username: userKey,
            characterLevel: data.character ? data.character.level : 0,
            tasksCompleted: data.tasks ? data.tasks.filter(t => t.completed).length : 0,
            highestDungeonLevel: data.dungeon ? data.dungeon.highestLevel : 1,
            artifactsCollected: data.dungeon ? data.dungeon.artifacts.length : 0
        };
    },

    // Get all users for leaderboard
    getLeaderboard() {
        const users = this.getUsers();
        const leaderboard = [];

        for (const userKey in users) {
            const stats = this.getUserStats(userKey);
            if (stats && stats.characterLevel > 0) {
                leaderboard.push(stats);
            }
        }

        // Sort by character level, then by dungeon level
        return leaderboard.sort((a, b) => {
            if (b.characterLevel !== a.characterLevel) {
                return b.characterLevel - a.characterLevel;
            }
            return b.highestDungeonLevel - a.highestDungeonLevel;
        });
    },

    // Initialize auth UI bindings
    init() {
        this.bindAuthForms();
        this.bindAuthTabs();
    },

    bindAuthTabs() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;

                // Update tabs
                document.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.tab === tabName);
                });

                // Update forms
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                document.getElementById(`${tabName}-form`).classList.add('active');

                // Clear messages
                this.clearMessages();
            });
        });
    },

    bindAuthForms() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            const result = this.login(username, password);

            if (result.success) {
                App.currentUser = username.toLowerCase();
                this.loadUserData(App.currentUser);
                App.showGameScreen();
                App.notify(`Welcome back, ${result.username}!`, 'success');
            } else {
                document.getElementById('login-error').textContent = result.message;
            }
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;

            // Clear previous messages
            this.clearMessages();

            // Validate password confirmation
            if (password !== confirm) {
                document.getElementById('register-error').textContent = 'Passwords do not match!';
                return;
            }

            const result = this.register(username, password);

            if (result.success) {
                document.getElementById('register-success').textContent = result.message + ' You can now login.';
                
                // Clear form
                document.getElementById('register-form').reset();

                // Switch to login tab after 2 seconds
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                    document.getElementById('login-username').value = username;
                }, 2000);
            } else {
                document.getElementById('register-error').textContent = result.message;
            }
        });
    },

    clearMessages() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
        document.getElementById('register-success').textContent = '';
    }
};

// Initialize Auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
