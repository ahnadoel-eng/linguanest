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
            console.warn(`⚠️ API Error [${endpoint}]:`, err.message);
            console.warn(`🚀 Switching to HACKATHON MOCK MODE for this request.`);
            return getHackathonMockData(endpoint, options);
        }
    }

    // ========================
    // HACKATHON MOCK DATA GENERATOR
    // ========================
    function getHackathonMockData(endpoint, options) {
        // Auth mocks — use stored user if available 
        if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
            const body = options.body ? JSON.parse(options.body) : {};
            const email = body.email || 'demo@alem.plus';
            const name = body.name || email.split('@')[0];
            const role = email.includes('teacher') ? 'teacher' : (body.role || 'student');
            return {
                success: true,
                token: 'mock-jwt-token-for-hackathon',
                user: { id: 'mock-id-123', name, email, role, avatar_url: getRandomAvatar(), created_at: new Date().toISOString() }
            };
        }
        if (endpoint.includes('/auth/me')) return { success: true, user: getUser() };
        
        // Stats mocks
        if (endpoint.includes('/lessons/stats')) {
            return { stats: { total_lessons: 12, upcoming_lessons: 3, completed_lessons: 9, total_students: 8, avg_score: 92 } };
        }
        
        // Lessons mocks
        if (endpoint.includes('/lessons/upcoming')) {
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
            return { lessons: [
                { id: '1', title: 'English B2 - Speaking Club', scheduled_time: tomorrow.toISOString(), duration_minutes: 60, status: 'scheduled', teacher_name: 'Alex T.', student_name: 'Demo Student' },
                { id: '2', title: 'Grammar Practice', scheduled_time: new Date(new Date().getTime() + 86400000 * 2).toISOString(), duration_minutes: 45, status: 'scheduled', teacher_name: 'Maria S.', student_name: 'Demo Student' }
            ] };
        }
        if (endpoint.includes('/lessons/completed')) {
            const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
            return { lessons: [{ id: '3', title: 'English B1 Review', scheduled_time: lastWeek.toISOString(), duration_minutes: 60, partner_name: 'Alex T.', status: 'completed' }] };
        }
        
        // Progress mocks
        if (endpoint.includes('/users/progress')) {
            const date = new Date(); date.setDate(date.getDate() - 2);
            return { progress: [
                { score: 95, lesson_title: 'English B2 Mock Test', notes: 'Great vocabulary usage!', completed_at: date.toISOString() },
                { score: 80, lesson_title: 'Grammar Basics', notes: 'Needs some review on past tense.', completed_at: new Date(date.getTime() - 86400000).toISOString() }
            ] };
        }

        // Students & Teachers mocks
        if (endpoint.includes('/users/students')) {
            return { students: [
                { id: 's1', name: 'John Doe', email: 'john@example.com', language: 'english', created_at: new Date() },
                { id: 's2', name: 'Sarah Connor', email: 'sarah@example.com', language: 'english', created_at: new Date() }
            ] };
        }
        if (endpoint.includes('/users/teachers')) {
            return { teachers: [
                { id: 't1', name: 'Alice Walker' },
                { id: 't2', name: 'Bob Smith' }
            ] };
        }

        // Create Lesson Mock
        if (options.method === 'POST' && endpoint.includes('/lessons')) {
            return { success: true, lesson: { id: 'mock-123' } };
        }

        // AI Features (If backend server entirely fails)
        if (endpoint.includes('/ai/generate-lesson')) {
            return { lesson: { title: "AI Generated Plan", description: "Fallback Mock Lesson", vocabulary: ["Hackathon", "Demo", "Mock"], exercises: ["Discuss...", "Explain..."] } };
        }
        if (endpoint.includes('/ai/chat')) {
            return { reply: "Hi! I am the mock fallback buddy, running offline because your server couldn't connect." };
        }
        if (endpoint.includes('/ai/chat-audio')) {
            return { success: true, userText: "This is a mock transcribed text.", reply: "That is interesting! (Mock fallback text)" };
        }

        // Default generic success
        return { success: true, message: "Mock success" };
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
    // AI API (alem.plus features)
    // ========================
    async function generateLesson(topic, level) {
        return await request('/ai/generate-lesson', {
            method: 'POST',
            body: JSON.stringify({ topic, level })
        });
    }

    async function chatWithBuddy(message, history = []) {
        return await request('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history })
        });
    }

    async function chatAudioWithBuddy(audioBase64, history = []) {
        return await request('/ai/chat-audio', {
            method: 'POST',
            body: JSON.stringify({ audioBase64, history })
        });
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

        // AI Features
        generateLesson, chatWithBuddy, chatAudioWithBuddy,

        // Navigation
        redirectToDashboard, requireAuth, requireRole,

        // Helpers
        getInitials, formatDate, formatTime, formatTimeRange,
        isToday, getGreeting, getRandomAvatar
    };
})();
