// ============================================
// AUTHENTICATION SYSTEM
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Generate floating particles
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
        particle.style.animationDelay = (Math.random() * 4) + 's';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }

    // Form switching
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Class selection
    const classOptions = document.querySelectorAll('.class-option');
    const classInput = document.getElementById('reg-class');

    classOptions.forEach(option => {
        option.addEventListener('click', () => {
            classOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            classInput.value = option.dataset.class;
        });
    });

    // Login handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            errorEl.textContent = '';
            await auth.signInWithEmailAndPassword(email, password);
            window.location.href = 'app.html';
        } catch (error) {
            errorEl.textContent = getAuthErrorMessage(error.code);
        }
    });

    // Register handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-password-confirm').value;
        const selectedClass = classInput.value;
        const errorEl = document.getElementById('register-error');

        // Validation
        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match!';
            return;
        }

        if (!selectedClass) {
            errorEl.textContent = 'Please choose a class!';
            return;
        }

        try {
            errorEl.textContent = '';

            // Create auth account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get class bonuses
            const classBonuses = getClassBonuses(selectedClass);

            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                class: selectedClass,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                character: {
                    level: 1,
                    xp: 0,
                    xpToNext: 100,
                    totalXp: 0,
                    hp: 100,
                    maxHp: 100,
                    gold: 0,
                    stats: {
                        strength: 5 + (classBonuses.strength || 0),
                        dexterity: 5 + (classBonuses.dexterity || 0),
                        constitution: 5 + (classBonuses.constitution || 0),
                        intelligence: 5 + (classBonuses.intelligence || 0),
                        wisdom: 5 + (classBonuses.wisdom || 0),
                        charisma: 5 + (classBonuses.charisma || 0)
                    },
                    title: 'Novice Adventurer',
                    artifacts: {
                        weapon: null,
                        armor: null,
                        trinket: null,
                        relic: null
                    }
                },
                dungeon: {
                    currentFloor: 1,
                    highestFloor: 0,
                    bossesDefeated: 0
                },
                streaks: {
                    current: 0,
                    best: 0,
                    lastActiveDate: null
                },
                loreUnlocked: [0], // Prologue
                artifactCollection: []
            });

            window.location.href = 'app.html';
        } catch (error) {
            errorEl.textContent = getAuthErrorMessage(error.code);
        }
    });

    // Check if already logged in
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.includes('index.html') || 
            user && window.location.pathname === '/' ||
            user && window.location.pathname.endsWith('/')) {
            // Only redirect if we're on the login page
            if (!window.location.pathname.includes('app.html')) {
                window.location.href = 'app.html';
            }
        }
    });
});

function getClassBonuses(className) {
    const bonuses = {
        warrior: { strength: 2, constitution: 1 },
        ranger: { dexterity: 2, wisdom: 1 },
        mage: { intelligence: 2, wisdom: 1 },
        bard: { charisma: 2, dexterity: 1 }
    };
    return bonuses[className] || {};
}

function getAuthErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password.'
    };
    return messages[code] || 'An error occurred. Please try again.';
}
