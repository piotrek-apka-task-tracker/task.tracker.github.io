// ================================
// AUTHENTICATION SYSTEM
// ================================
const Auth = {
    init() {
        this.bindEvents();
        this.checkSession();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const tabName = tab.dataset.tab;
                document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
                document.getElementById('register-form').classList.toggle('hidden', tabName !== 'register');
            });
        });

        // Class selection
        document.querySelectorAll('.class-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
    },

    checkSession() {
        const username = Storage.getCurrentUsername();
        if (username && Storage.getUserData(username)) {
            App.login(username);
        }
    },

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!username || !password) {
            errorEl.textContent = 'Please fill in all fields.';
            errorEl.classList.remove('hidden');
            return;
        }

        if (Storage.validateLogin(username, password)) {
            Storage.setCurrentUser(username);
            errorEl.classList.add('hidden');
            App.login(username);
        } else {
            errorEl.textContent = 'Invalid username or password.';
            errorEl.classList.remove('hidden');
        }
    },

    handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-password-confirm').value;
        const heroName = document.getElementById('reg-heroname').value.trim();
        const selectedClass = document.querySelector('.class-option.selected');
        const errorEl = document.getElementById('register-error');

        if (!username || !password || !heroName) {
            errorEl.textContent = 'Please fill in all fields.';
            errorEl.classList.remove('hidden');
            return;
        }

        if (username.length < 3) {
            errorEl.textContent = 'Username must be at least 3 characters.';
            errorEl.classList.remove('hidden');
            return;
        }

        if (password.length < 4) {
            errorEl.textContent = 'Password must be at least 4 characters.';
            errorEl.classList.remove('hidden');
            return;
        }

        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match.';
            errorEl.classList.remove('hidden');
            return;
        }

        const heroClass = selectedClass ? selectedClass.dataset.class : 'warrior';
        const passwordHash = Storage.hashPassword(password);

        if (Storage.createUser(username, passwordHash, heroName, heroClass)) {
            Storage.setCurrentUser(username);
            errorEl.classList.add('hidden');
            App.login(username);
        } else {
            errorEl.textContent = 'Username already exists.';
            errorEl.classList.remove('hidden');
        }
    },

    handleLogout() {
        Storage.clearCurrentUser();
        App.logout();
    }
};
