/**
 * LinguaNest — Auth Page JavaScript
 * Register & Login using the backend API.
 * Includes Google OAuth 2.0 and role-based redirect.
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect
    if (API.isLoggedIn()) {
        const user = API.getUser();
        API.redirectToDashboard(user.role);
        return;
    }

    const registerCard = document.getElementById('registerCard');
    const loginCard = document.getElementById('loginCard');
    const authSuccess = document.getElementById('authSuccess');
    const showLoginLink = document.getElementById('showLoginLink');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // ========================
    // Toggle between Register/Login
    // ========================
    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        registerCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    });

    // ========================
    // REGISTER
    // ========================
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const role = document.querySelector('input[name="role"]:checked')?.value || 'student';
        const language = document.getElementById('language')?.value || '';

        const registerBtn = document.getElementById('registerBtn');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Creating account...';
        registerBtn.disabled = true;

        try {
            const result = await API.register({
                name: `${firstName} ${lastName}`,
                email,
                password,
                role,
                language
            });

            // Show success
            registerCard.style.display = 'none';
            authSuccess.style.display = 'flex';

            // Redirect based on role
            setTimeout(() => {
                API.redirectToDashboard(result.user.role);
            }, 1500);
        } catch (err) {
            showError(registerCard, err.message || 'Registration failed. Please try again.');
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
        }
    });

    // ========================
    // LOGIN
    // ========================
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        try {
            const result = await API.login(email, password);

            // Show success
            loginCard.style.display = 'none';
            authSuccess.style.display = 'flex';
            authSuccess.querySelector('h2').textContent = 'Welcome Back!';
            authSuccess.querySelector('p').textContent = 'Redirecting to your dashboard...';

            // Role-based redirect
            setTimeout(() => {
                API.redirectToDashboard(result.user.role);
            }, 1500);
        } catch (err) {
            showError(loginCard, err.message || 'Invalid email or password.');
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    });

    // ========================
    // GOOGLE OAUTH 2.0
    // ========================
    const googleSignUp = document.getElementById('googleSignUp');
    const googleSignIn = document.getElementById('googleSignIn');

    if (googleSignUp) {
        googleSignUp.addEventListener('click', () => handleGoogleAuth('signup'));
    }

    if (googleSignIn) {
        googleSignIn.addEventListener('click', () => handleGoogleAuth('signin'));
    }

    async function handleGoogleAuth(mode) {
        // Try Google Identity Services (GSI)
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: getGoogleClientId(),
                callback: async (response) => {
                    try {
                        const role = document.querySelector('input[name="role"]:checked')?.value || 'student';
                        const result = await API.googleAuth(response.credential, role);

                        registerCard.style.display = 'none';
                        loginCard.style.display = 'none';
                        authSuccess.style.display = 'flex';
                        authSuccess.querySelector('h2').textContent = mode === 'signup' ? 'Account Created!' : 'Welcome Back!';

                        setTimeout(() => {
                            API.redirectToDashboard(result.user.role);
                        }, 1500);
                    } catch (err) {
                        showError(mode === 'signup' ? registerCard : loginCard, err.message);
                    }
                }
            });

            google.accounts.id.prompt();
        } else {
            // Fallback: show info
            showError(
                mode === 'signup' ? registerCard : loginCard,
                'Google Sign-In requires a valid Google Client ID. Add it in backend/.env as GOOGLE_CLIENT_ID.'
            );
        }
    }

    function getGoogleClientId() {
        // Read from meta tag or use default
        const meta = document.querySelector('meta[name="google-client-id"]');
        return meta ? meta.content : 'YOUR_GOOGLE_CLIENT_ID';
    }

    // ========================
    // PASSWORD STRENGTH
    // ========================
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const pwd = passwordInput.value;
            let score = 0;
            if (pwd.length >= 8) score++;
            if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) score++;
            if (pwd.match(/\d/)) score++;
            if (pwd.match(/[^a-zA-Z0-9]/)) score++;

            const bars = [
                document.getElementById('str1'),
                document.getElementById('str2'),
                document.getElementById('str3'),
                document.getElementById('str4')
            ];

            const colors = ['var(--error)', 'var(--warning)', 'var(--amber-400)', 'var(--success)'];

            bars.forEach((bar, i) => {
                if (i < score) {
                    bar.style.background = colors[score - 1];
                    bar.style.width = '100%';
                } else {
                    bar.style.background = 'rgba(255,255,255,0.1)';
                }
            });
        });
    }

    // ========================
    // ERROR DISPLAY
    // ========================
    function showError(card, message) {
        // Remove existing error
        card.querySelectorAll('.auth-error').forEach(el => el.remove());

        const errorEl = document.createElement('div');
        errorEl.className = 'auth-error';
        errorEl.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            color: var(--error);
            font-size: 0.85rem;
            animation: fadeInUp 0.3s ease-out;
        `;
        errorEl.textContent = '⚠️ ' + message;

        const form = card.querySelector('form');
        if (form) {
            form.insertBefore(errorEl, form.firstChild);
        } else {
            card.insertBefore(errorEl, card.lastElementChild);
        }

        setTimeout(() => errorEl.remove(), 5000);
    }
});
