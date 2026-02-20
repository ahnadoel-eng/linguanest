/**
 * LinguaNest — Teacher Dashboard JavaScript
 * Loads all data from API, no hardcoded/fake data.
 * Includes Jitsi Meet integration for video calls.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verify teacher role
    const user = API.requireRole('teacher');
    if (!user) return;

    // Setup common UI
    setupSidebar();
    setupUserInfo(user);
    setupGreeting(user);
    setupLogout();

    // Load data from API
    loadStats();
    loadUpcomingLessons();
    loadStudents();
    setupCreateLesson();
    setupQuickActions();

    // ========================
    // SIDEBAR
    // ========================
    function setupSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    function setupUserInfo(user) {
        const initials = API.getInitials(user.name);
        const sidebarUser = document.getElementById('sidebarUser');
        if (sidebarUser) {
            sidebarUser.innerHTML = `
                <div class="user-avatar" style="background: ${user.avatar_url || API.getRandomAvatar()}">${initials}</div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">Teacher</div>
                </div>
            `;
        }
    }

    function setupGreeting(user) {
        const greetEl = document.getElementById('greeting');
        if (greetEl) {
            const firstName = user.name.split(' ')[0];
            greetEl.textContent = `${API.getGreeting()}, ${firstName}! 👋`;
        }
    }

    function setupLogout() {
        document.querySelectorAll('.logout-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                API.logout();
            });
        });
    }

    // ========================
    // STATS (FROM API)
    // ========================
    async function loadStats() {
        const container = document.getElementById('statsCards');
        if (!container) return;

        try {
            const data = await API.getLessonStats();
            const stats = data.stats;

            container.innerHTML = `
                <div class="stat-card" style="animation: fadeInUp 0.4s ease-out;">
                    <div class="stat-card-header">
                        <span class="stat-card-icon">📅</span>
                    </div>
                    <div class="stat-card-value">${stats.upcoming_lessons}</div>
                    <div class="stat-card-label">Upcoming Lessons</div>
                </div>
                <div class="stat-card" style="animation: fadeInUp 0.5s ease-out;">
                    <div class="stat-card-header">
                        <span class="stat-card-icon">✅</span>
                    </div>
                    <div class="stat-card-value">${stats.completed_lessons}</div>
                    <div class="stat-card-label">Completed Lessons</div>
                </div>
                <div class="stat-card" style="animation: fadeInUp 0.6s ease-out;">
                    <div class="stat-card-header">
                        <span class="stat-card-icon">👥</span>
                    </div>
                    <div class="stat-card-value">${stats.total_students || 0}</div>
                    <div class="stat-card-label">Total Students</div>
                </div>
                <div class="stat-card" style="animation: fadeInUp 0.7s ease-out;">
                    <div class="stat-card-header">
                        <span class="stat-card-icon">📊</span>
                    </div>
                    <div class="stat-card-value">${stats.total_lessons}</div>
                    <div class="stat-card-label">Total Lessons</div>
                </div>
            `;
        } catch (err) {
            container.innerHTML = `
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">📅</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Upcoming</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">✅</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Completed</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">👥</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Students</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">📊</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Total</div></div>
            `;
        }
    }

    // ========================
    // UPCOMING LESSONS (FROM API)
    // ========================
    async function loadUpcomingLessons() {
        const container = document.getElementById('lessonsList');
        const spinner = document.getElementById('lessonsSpinner');
        const emptyState = document.getElementById('lessonsEmptyState');
        if (!container) return;

        // Show spinner
        if (emptyState) emptyState.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        try {
            const data = await API.getUpcomingLessons();
            if (spinner) spinner.style.display = 'none';

            if (!data.lessons || data.lessons.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            container.innerHTML = data.lessons.map(lesson => {
                const dt = new Date(lesson.scheduled_time);
                const day = dt.getDate();
                const month = dt.toLocaleDateString('en-US', { month: 'short' });
                const time = API.formatTimeRange(lesson.scheduled_time, lesson.duration_minutes);
                const isNow = API.isToday(lesson.scheduled_time);
                const statusClass = isNow ? 'checkin-needed' : 'upcoming';
                const statusText = isNow ? '🔴 Today' : 'Upcoming';

                return `
                    <div class="lesson-item" style="animation: fadeInUp 0.4s ease-out;" data-lesson-id="${lesson.id}">
                        <div class="lesson-date">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                        <div class="lesson-info">
                            <div class="lesson-title">${lesson.title}</div>
                            <div class="lesson-meta">
                                <span>${time}</span>
                                <span>${lesson.student_name ? 'with ' + lesson.student_name : 'No student assigned'}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="padding: 6px 16px; font-size: 0.78rem;"
                            onclick="startVideoCall('${lesson.id}', '${lesson.title}')">
                            📹 Start Lesson
                        </button>
                        <span class="lesson-status ${statusClass}">${statusText}</span>
                    </div>
                `;
            }).join('');
        } catch (err) {
            if (spinner) spinner.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.querySelector('h3').textContent = 'Could not load lessons';
                emptyState.querySelector('p').textContent = 'Please check your connection and try again.';
            }
        }
    }

    // ========================
    // STUDENTS (FROM API)
    // ========================
    async function loadStudents() {
        const container = document.getElementById('studentsList');
        const spinner = document.getElementById('studentsSpinner');
        const emptyState = document.getElementById('studentsEmptyState');
        if (!container) return;

        if (emptyState) emptyState.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        try {
            const data = await API.getStudents();
            if (spinner) spinner.style.display = 'none';

            if (!data.students || data.students.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            container.innerHTML = `
                <div class="attendance-table-header">
                    <span>Student</span>
                    <span>Email</span>
                    <span>Language</span>
                    <span>Joined</span>
                </div>
                ${data.students.map(student => {
                const initials = API.getInitials(student.name);
                return `
                        <div class="attendance-row-data" style="animation: fadeInUp 0.4s ease-out;">
                            <div class="student-cell">
                                <div class="student-mini-avatar" style="background: ${student.avatar_url || API.getRandomAvatar()}">${initials}</div>
                                <span>${student.name}</span>
                            </div>
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">${student.email}</span>
                            <span style="text-transform: capitalize;">${student.language || 'N/A'}</span>
                            <span>${API.formatDate(student.created_at)}</span>
                        </div>
                    `;
            }).join('')}
            `;
        } catch (err) {
            if (spinner) spinner.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    // ========================
    // CREATE LESSON
    // ========================
    function setupCreateLesson() {
        const btn = document.getElementById('createLessonBtn');
        const modal = document.getElementById('createLessonModal');
        const form = document.getElementById('createLessonForm');

        if (btn && modal) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                // Populate student dropdown
                try {
                    const data = await API.getStudents();
                    const select = document.getElementById('lessonStudent');
                    if (select && data.students) {
                        select.innerHTML = '<option value="">Select a student...</option>' +
                            data.students.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('');
                    }
                } catch (e) { /* students dropdown will stay empty */ }

                // Set default date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateInput = document.getElementById('lessonDate');
                if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];

                openModal('createLessonModal');
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('lessonTitle').value;
                const description = document.getElementById('lessonDescription').value;
                const studentId = document.getElementById('lessonStudent').value;
                const date = document.getElementById('lessonDate').value;
                const time = document.getElementById('lessonTime').value;
                const duration = parseInt(document.getElementById('lessonDuration').value);

                const scheduled_time = new Date(`${date}T${time}:00`).toISOString();

                try {
                    await API.createLesson({
                        title,
                        description,
                        student_id: studentId || null,
                        scheduled_time,
                        duration_minutes: duration
                    });

                    closeModal('createLessonModal');
                    showToast('✅ Lesson created successfully!', 'success');
                    loadUpcomingLessons();
                    loadStats();
                } catch (err) {
                    showToast('❌ Failed to create lesson: ' + err.message, 'error');
                }
            });
        }
    }

    // ========================
    // QUICK ACTIONS
    // ========================
    function setupQuickActions() {
        const createAction = document.getElementById('createLessonAction');
        if (createAction) createAction.addEventListener('click', () => document.getElementById('createLessonBtn')?.click());

        const viewStudents = document.getElementById('viewStudentsAction');
        if (viewStudents) viewStudents.addEventListener('click', () => {
            document.getElementById('studentsList')?.scrollIntoView({ behavior: 'smooth' });
        });

        const startCall = document.getElementById('startCallAction');
        if (startCall) startCall.addEventListener('click', () => {
            showToast('Select a lesson above and click "Start Lesson" to begin a video call.', 'info');
        });
    }

    // ========================
    // JITSI VIDEO CALL
    // ========================
    window.startVideoCall = async function (lessonId, lessonTitle) {
        try {
            const data = await API.joinLesson(lessonId);
            const roomName = data.room_name || `LinguaNest-${lessonId.split('-')[0]}`;

            document.getElementById('videoCallTitle').textContent = `📹 ${lessonTitle}`;
            openModal('videoCallModal');

            // Load Jitsi Meet API
            if (!window.JitsiMeetExternalAPI) {
                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.onload = () => initJitsi(roomName, data.display_name || user.name);
                document.head.appendChild(script);
            } else {
                initJitsi(roomName, data.display_name || user.name);
            }
        } catch (err) {
            // Fallback: open Jitsi directly
            const roomName = `LinguaNest-${lessonId.split('-')[0]}`;
            document.getElementById('videoCallTitle').textContent = `📹 ${lessonTitle}`;
            openModal('videoCallModal');

            if (!window.JitsiMeetExternalAPI) {
                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.onload = () => initJitsi(roomName, user.name);
                document.head.appendChild(script);
            } else {
                initJitsi(roomName, user.name);
            }
        }
    };

    function initJitsi(roomName, displayName) {
        const container = document.getElementById('jitsiContainer');
        if (!container) return;
        container.innerHTML = '';

        try {
            window.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
                roomName: roomName,
                parentNode: container,
                width: '100%',
                height: 500,
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop',
                        'fullscreen', 'hangup', 'chat', 'raisehand', 'tileview'
                    ]
                },
                userInfo: { displayName: displayName }
            });

            window.jitsiApi.addEventListener('readyToClose', () => endVideoCall());
            showToast('📹 Video call started!', 'success');
        } catch (err) {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);gap:16px;">
                    <span style="font-size:3rem;">📹</span>
                    <p>Could not load video call widget.</p>
                    <a href="https://meet.jit.si/${roomName}" target="_blank" class="btn btn-primary">Open in Jitsi Meet →</a>
                </div>
            `;
        }
    }

    window.endVideoCall = function () {
        if (window.jitsiApi) {
            window.jitsiApi.dispose();
            window.jitsiApi = null;
        }
        closeModal('videoCallModal');
        showToast('📹 Video call ended.', 'info');
    };

    // ========================
    // MODAL SYSTEM
    // ========================
    window.openModal = function (id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function (id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });

    // ========================
    // TOAST SYSTEM
    // ========================
    window.showToast = function (message, type = 'info') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.id = 'toastContainer';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };
});
