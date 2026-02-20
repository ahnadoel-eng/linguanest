/**
 * LinguaNest — API Client
 * Central API communication layer replacing localStorage data store.
 * Handles JWT auth, API calls, and local session management.
 */

const API = (() => {
    const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:3000/api`
        : '/api';

    // ========================
    // TOKEN MANAGEMENT
    // ========================
    function getToken() {
        return localStorage.getItem('ln_token');
    }

    function setToken(token) {
        localStorage.setItem('ln_token', token);
    }

    function clearToken() {
        localStorage.removeItem('ln_token');
        localStorage.removeItem('ln_user');
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('ln_user'));
        } catch { return null; }
    }

    function setUser(user) {
        localStorage.setItem('ln_user', JSON.stringify(user));
    }

    function isLoggedIn() {
        return !!getToken() && !!getUser();
    }

    // ========================
    // FETCH WRAPPER
    // ========================
    async function request(endpoint, options = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err.message);
            throw err;
        }
    }

    // ========================
    // AUTH API
    // ========================
    async function register(data) {
        const result = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            setToken(result.token);
            setUser(result.user);
        }
        return result;
    }

    async function login(email, password) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success) {
            setToken(result.token);
            setUser(result.user);
        }
        return result;
    }

    async function googleAuth(credential, role) {
        const result = await request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential, role })
        });

        if (result.success) {
            setToken(result.token);
            setUser(result.user);
        }
        return result;
    }

    async function getMe() {
        return await request('/auth/me');
    }

    function logout() {
        clearToken();
        window.location.href = 'index.html';
    }

    // ========================
    // LESSONS API
    // ========================
    async function getLessons() {
        return await request('/lessons');
    }

    async function getUpcomingLessons() {
        return await request('/lessons/upcoming');
    }

    async function getCompletedLessons() {
        return await request('/lessons/completed');
    }

    async function createLesson(data) {
        return await request('/lessons', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateLesson(id, data) {
        return await request(`/lessons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteLesson(id) {
        return await request(`/lessons/${id}`, {
            method: 'DELETE'
        });
    }

    async function getLessonStats() {
        return await request('/lessons/stats');
    }

    async function joinLesson(id) {
        return await request(`/lessons/${id}/join`);
    }

    // ========================
    // USERS API
    // ========================
    async function getStudents() {
        return await request('/users/students');
    }

    async function getTeachers() {
        return await request('/users/teachers');
    }

    async function getProfile() {
        return await request('/users/profile');
    }

    async function getProgress() {
        return await request('/users/progress');
    }

    // ========================
    // ROLE-BASED REDIRECT
    // ========================
    function redirectToDashboard(role) {
        if (role === 'admin') window.location.href = 'admin.html';
        else if (role === 'teacher') window.location.href = 'dashboard-teacher.html';
        else window.location.href = 'dashboard-student.html';
    }

    function requireAuth() {
        if (!isLoggedIn()) {
            window.location.href = 'auth.html';
            return null;
        }
        return getUser();
    }

    function requireRole(expectedRole) {
        const user = requireAuth();
        if (user && user.role !== expectedRole) {
            redirectToDashboard(user.role);
            return null;
        }
        return user;
    }

    // ========================
    // HELPERS
    // ========================
    function getInitials(name) {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function formatTime(isoString) {
        const d = new Date(isoString);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    function formatTimeRange(isoString, durationMinutes) {
        const start = new Date(isoString);
        const end = new Date(start.getTime() + durationMinutes * 60000);
        return `${formatTime(isoString)} – ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }

    function isToday(isoString) {
        return new Date(isoString).toDateString() === new Date().toDateString();
    }

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }

    function getRandomAvatar() {
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a18cd1, #fbc2eb)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        // Auth
        register, login, googleAuth, getMe, logout,
        getToken, getUser, setUser, isLoggedIn,

        // Lessons
        getLessons, getUpcomingLessons, getCompletedLessons,
        createLesson, updateLesson, deleteLesson,
        getLessonStats, joinLesson,

        // Users
        getStudents, getTeachers, getProfile, getProgress,

        // Navigation
        redirectToDashboard, requireAuth, requireRole,

        // Helpers
        getInitials, formatDate, formatTime, formatTimeRange,
        isToday, getGreeting, getRandomAvatar
    };
})();
