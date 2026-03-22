// ==========================================
// Authentication System (localStorage-based)
// ==========================================

const Auth = {
    currentUser: null,

    init() {
        // Check for existing session
        const session = localStorage.getItem('questforge_session');
        if (session) {
            const username = JSON.parse(session);
            const userData = this.getUserData(username);
            if (userData) {
                this.currentUser = username;
                return true;
            }
        }
        return false;
    },

    getAllUsers() {
        const users = localStorage.getItem('questforge_users');
        return users ? JSON.parse(users) : {};
    },

    saveAllUsers(users) {
        localStorage.setItem('questforge_users', JSON.stringify(users));
    },

    getUserData(username) {
        const users = this.getAllUsers();
        return users[username] || null;
    },

    saveUserData(username, data) {
        const users = this.getAllUsers();
        users[username] = data;
        this.saveAllUsers(users);
    },

    register(username, password, heroName, heroClass) {
        const users = this.getAllUsers();

        if (users[username]) {
            return { success: false, error: 'Username already exists!' };
        }

        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters!' };
        }

        if (password.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters!' };
        }

        // Create new user
        const newUser = {
            username: username,
            password: this.hashPassword(password),
            createdAt: Date.now(),
            character: Character.createNew(heroName, heroClass),
            tasks: [],
            habits: [],
            dungeon: {
                currentFloor: 1,
                deepestFloor: 0,
                bossesDefeated: [],
                artifacts: [],
                loreUnlocked: []
            },
            stats: {
                tasksCompleted: 0,
                habitsCompleted: 0,
                totalXpEarned: 0,
                monstersSlain: 0,
                bossesSlain: 0,
                daysActive: 1,
                longestStreak: 0,
                lastActiveDate: new Date().toDateString()
            }
        };

        users[username] = newUser;
        this.saveAllUsers(users);
        this.currentUser = username;
        localStorage.setItem('questforge_session', JSON.stringify(username));

        return { success: true };
    },

    login(username, password) {
        const users = this.getAllUsers();
        const user = users[username];

        if (!user) {
            return { success: false, error: 'User not found!' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, error: 'Invalid password!' };
        }

        this.currentUser = username;
        localStorage.setItem('questforge_session', JSON.stringify(username));

        // Update last active date
        const today = new Date().toDateString();
        if (user.stats.lastActiveDate !== today) {
            user.stats.daysActive++;
            user.stats.lastActiveDate = today;
            this.saveUserData(username, user);
        }

        return { success: true };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('questforge_session');
    },

    getData() {
        if (!this.currentUser) return null;
        return this.getUserData(this.currentUser);
    },

    saveData(data) {
        if (!this.currentUser) return;
        this.saveUserData(this.currentUser, data);
    },

    // Simple hash (NOT secure - for demo/local use only)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
};
