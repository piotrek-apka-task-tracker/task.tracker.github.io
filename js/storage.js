// ================================
// LOCAL STORAGE MANAGER
// ================================
const Storage = {
    USERS_KEY: 'qoh_users',
    CURRENT_USER_KEY: 'qoh_current_user',

    // Get all users
    getUsers() {
        const data = localStorage.getItem(this.USERS_KEY);
        return data ? JSON.parse(data) : {};
    },

    // Save all users
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    // Get current logged in username
    getCurrentUsername() {
        return localStorage.getItem(this.CURRENT_USER_KEY);
    },

    // Set current user
    setCurrentUser(username) {
        localStorage.setItem(this.CURRENT_USER_KEY, username);
    },

    // Clear current user
    clearCurrentUser() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    // Get user data
    getUserData(username) {
        const users = this.getUsers();
        return users[username] || null;
    },

    // Save user data
    saveUserData(username, data) {
        const users = this.getUsers();
        users[username] = data;
        this.saveUsers(users);
    },

    // Create new user
    createUser(username, passwordHash, heroName, heroClass) {
        const users = this.getUsers();
        if (users[username]) return false;

        users[username] = {
            password: passwordHash,
            createdAt: new Date().toISOString(),
            character: CharacterSystem.createNewCharacter(heroName, heroClass),
            tasks: [],
            habits: [],
            dungeon: {
                currentFloor: 1,
                currentRoom: 0,
                roomsPerFloor: 5,
                floorsCleared: 0
            },
            loreUnlocked: [],
            artifacts: [],
            stats: {
                tasksCompleted: 0,
                habitsTracked: 0,
                monstersSlain: 0,
                bossesDefeated: 0,
                streak: 0,
                lastActiveDate: null,
                totalXPEarned: 0
            }
        };

        this.saveUsers(users);
        return true;
    },

    // Simple hash for passwords (NOT secure - for demo only)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    // Validate login
    validateLogin(username, password) {
        const users = this.getUsers();
        if (!users[username]) return false;
        return users[username].password === this.hashPassword(password);
    }
};
