/**
 * LinguaNest — Student Dashboard JavaScript
 * All data loaded from API. No hardcoded/fake data.
 * Student-specific: My Lessons, Join Call, Learning Progress, My Records.
 * NO create/edit lesson functionality.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verify student role
    const user = API.requireRole('student');
    if (!user) return;

    // Setup common UI
    setupSidebar();
    setupUserInfo(user);
    setupGreeting(user);
    setupLogout();
    setupQuickActions();

    // Load data from API
    loadStats();
    loadUpcomingLessons();
    loadProgress();
    loadCompletedLessons();
    setupAIBuddy();

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

        // Sidebar navigation — show/hide sections
        document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;

                // Update active state
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Map sections to element IDs or scroll targets
                const sectionMap = {
                    'overview': null,     // show main content
                    'lessons': 'lessonsList',
                    'progress': 'progressSection',
                    'teachers': null,
                    'calendar': null,
                    'profile': 'sectionProfile',
                    'settings': 'sectionSettings'
                };

                // Hide profile/settings sections
                const hideable = ['sectionProfile', 'sectionSettings'];
                hideable.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });

                const mainContent = document.getElementById('mainContent');

                if (section === 'profile' || section === 'settings') {
                    if (mainContent) mainContent.style.display = 'none';
                    const target = document.getElementById(sectionMap[section]);
                    if (target) target.style.display = 'block';
                    if (section === 'profile') loadProfile();
                } else {
                    if (mainContent) mainContent.style.display = '';

                    // Scroll to section if applicable
                    const targetId = sectionMap[section];
                    if (targetId) {
                        const el = document.getElementById(targetId);
                        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
                    }
                }

                // Close mobile sidebar
                if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');
            });
        });
    }

    function loadProfile() {
        const el = (id) => document.getElementById(id);
        el('profileName').textContent = user.name;
        el('profileEmail').textContent = user.email;
        el('profileRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        el('profileAvatar').textContent = API.getInitials(user.name);
        el('profileLanguage').textContent = user.language || 'English';
        el('profileJoined').textContent = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently';
    }

    function setupUserInfo(user) {
        const initials = API.getInitials(user.name);
        const sidebarUser = document.getElementById('sidebarUser');
        if (sidebarUser) {
            sidebarUser.innerHTML = `
                <div class="user-avatar" style="background: ${user.avatar_url || API.getRandomAvatar()}">${initials}</div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">Student</div>
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
                        <span class="stat-card-icon">📊</span>
                    </div>
                    <div class="stat-card-value">${stats.total_lessons}</div>
                    <div class="stat-card-label">Total Sessions</div>
                </div>
                <div class="stat-card" style="animation: fadeInUp 0.7s ease-out;">
                    <div class="stat-card-header">
                        <span class="stat-card-icon">⭐</span>
                    </div>
                    <div class="stat-card-value">${stats.avg_score || 0}%</div>
                    <div class="stat-card-label">Average Score</div>
                </div>
            `;
        } catch (err) {
            container.innerHTML = `
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">📅</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Upcoming</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">✅</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Completed</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">📊</span></div><div class="stat-card-value">0</div><div class="stat-card-label">Total</div></div>
                <div class="stat-card"><div class="stat-card-header"><span class="stat-card-icon">⭐</span></div><div class="stat-card-value">0%</div><div class="stat-card-label">Score</div></div>
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
                const statusText = isNow ? '🟢 Today' : 'Scheduled';

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
                                <span>${lesson.teacher_name ? 'with ' + lesson.teacher_name : ''}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="padding: 6px 16px; font-size: 0.78rem;"
                            onclick="joinVideoCall('${lesson.id}', '${lesson.title}')">
                            📹 Join Call
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
    // LEARNING PROGRESS (FROM API)
    // ========================
    async function loadProgress() {
        const container = document.getElementById('progressSection');
        const spinner = document.getElementById('progressSpinner');
        const emptyState = document.getElementById('progressEmptyState');
        if (!container) return;

        if (emptyState) emptyState.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        try {
            const data = await API.getProgress();
            if (spinner) spinner.style.display = 'none';

            if (!data.progress || data.progress.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            // Calculate overall stats
            const totalEntries = data.progress.length;
            const avgScore = Math.round(data.progress.reduce((s, p) => s + (p.score || 0), 0) / totalEntries);

            container.innerHTML = `
                <div class="progress-summary" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="progress-stat" style="text-align: center; padding: 20px; background: rgba(59,130,246,0.08); border-radius: 12px;">
                        <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-display); color: var(--blue-300);">${totalEntries}</div>
                        <div style="font-size: 0.82rem; color: var(--text-tertiary); margin-top: 4px;">Lessons Completed</div>
                    </div>
                    <div class="progress-stat" style="text-align: center; padding: 20px; background: rgba(16,185,129,0.08); border-radius: 12px;">
                        <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-display); color: var(--success);">${avgScore}%</div>
                        <div style="font-size: 0.82rem; color: var(--text-tertiary); margin-top: 4px;">Average Score</div>
                    </div>
                    <div class="progress-stat" style="text-align: center; padding: 20px; background: rgba(249,168,37,0.08); border-radius: 12px;">
                        <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-display); color: var(--amber-400);">🔥</div>
                        <div style="font-size: 0.82rem; color: var(--text-tertiary); margin-top: 4px;">Keep Going!</div>
                    </div>
                </div>
                <div class="progress-list">
                    ${data.progress.slice(0, 10).map(p => `
                        <div class="lesson-item" style="animation: fadeInUp 0.4s ease-out;">
                            <div class="lesson-date" style="background: ${(p.score || 0) >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'}">
                                <span class="day" style="color: ${(p.score || 0) >= 70 ? 'var(--success)' : 'var(--warning)'};">${p.score || 0}</span>
                                <span class="month">pts</span>
                            </div>
                            <div class="lesson-info">
                                <div class="lesson-title">${p.lesson_title || 'Lesson'}</div>
                                <div class="lesson-meta">
                                    <span>${p.notes || 'No notes'}</span>
                                    <span>${API.formatDate(p.completed_at)}</span>
                                </div>
                            </div>
                            <span class="lesson-status ${(p.score || 0) >= 70 ? 'completed' : 'upcoming'}">${(p.score || 0) >= 70 ? '✅ Passed' : '📘 Review'}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            if (spinner) spinner.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    // ========================
    // COMPLETED LESSONS / MY RECORDS (FROM API)
    // ========================
    async function loadCompletedLessons() {
        const container = document.getElementById('completedLessonsList');
        const spinner = document.getElementById('completedSpinner');
        const emptyState = document.getElementById('completedEmptyState');
        if (!container) return;

        if (emptyState) emptyState.style.display = 'none';
        if (spinner) spinner.style.display = 'flex';

        try {
            const data = await API.getCompletedLessons();
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

                return `
                    <div class="lesson-item" style="animation: fadeInUp 0.4s ease-out;">
                        <div class="lesson-date" style="background: rgba(16,185,129,0.1);">
                            <span class="day" style="color: var(--success);">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                        <div class="lesson-info">
                            <div class="lesson-title">${lesson.title}</div>
                            <div class="lesson-meta">
                                <span>${lesson.duration_minutes} min</span>
                                <span>${lesson.partner_name ? 'with ' + lesson.partner_name : ''}</span>
                            </div>
                        </div>
                        <span class="lesson-status completed">✅ Completed</span>
                    </div>
                `;
            }).join('');
        } catch (err) {
            if (spinner) spinner.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }

    // ========================
    // QUICK ACTIONS
    // ========================
    function setupQuickActions() {
        const joinNext = document.getElementById('joinNextCall');
        if (joinNext) joinNext.addEventListener('click', () => {
            const firstLesson = document.querySelector('#lessonsList .lesson-item');
            if (firstLesson) {
                const lessonId = firstLesson.dataset.lessonId;
                const title = firstLesson.querySelector('.lesson-title')?.textContent || 'Lesson';
                joinVideoCall(lessonId, title);
            } else {
                showToast('No upcoming lessons to join.', 'info');
            }
        });

        const viewProgress = document.getElementById('viewProgressAction');
        if (viewProgress) viewProgress.addEventListener('click', () => {
            document.getElementById('progressSection')?.scrollIntoView({ behavior: 'smooth' });
        });

        const viewTeachers = document.getElementById('viewTeachersAction');
        if (viewTeachers) viewTeachers.addEventListener('click', () => {
            showToast('Teachers section coming soon!', 'info');
        });
    }

    // ========================
    // AI SPEAKING BUDDY
    // ========================
    function setupAIBuddy() {
        const input = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('btnSendChat');
        const chatWindow = document.getElementById('aiChatWindow');
        let chatHistory = [];

        if (!input || !sendBtn || !chatWindow) return;

        function addBubble(text, isUser) {
            const bubble = document.createElement('div');
            bubble.style.padding = '12px 16px';
            bubble.style.maxWidth = '80%';
            bubble.style.lineHeight = '1.4';
            if (isUser) {
                bubble.style.background = 'rgba(255,255,255,0.1)';
                bubble.style.borderRadius = '16px 16px 4px 16px';
                bubble.style.alignSelf = 'flex-end';
            } else {
                bubble.style.background = 'rgba(56, 189, 248, 0.2)';
                bubble.style.borderRadius = '16px 16px 16px 4px';
                bubble.style.alignSelf = 'flex-start';
            }
            bubble.textContent = text;
            chatWindow.appendChild(bubble);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        async function handleSend() {
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            input.disabled = true;
            sendBtn.disabled = true;

            // Add user message
            addBubble(text, true);
            chatHistory.push({ role: "user", content: text });

            // Add typing indicator
            const typingBubble = document.createElement('div');
            typingBubble.style.padding = '12px 16px';
            typingBubble.style.background = 'rgba(56, 189, 248, 0.1)';
            typingBubble.style.borderRadius = '16px 16px 16px 4px';
            typingBubble.style.alignSelf = 'flex-start';
            typingBubble.innerHTML = '<span class="dots">...</span>';
            chatWindow.appendChild(typingBubble);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                const response = await API.chatWithBuddy(text, chatHistory.slice(-5));
                chatWindow.removeChild(typingBubble);
                addBubble(response.reply, false);
                chatHistory.push({ role: "assistant", content: response.reply });
            } catch (err) {
                chatWindow.removeChild(typingBubble);
                addBubble('Sorry, the AI is currently unavailable. Check back later!', false);
                showToast(err.message, 'error');
            } finally {
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            }
        }

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Microphone Logic
        const micBtn = document.getElementById('btnMicRecord');
        let isRecording = false;
        let mediaRecorder;
        let audioChunks = [];

        if (micBtn) {
            micBtn.addEventListener('click', async () => {
                if (isRecording) {
                    mediaRecorder.stop();
                    micBtn.innerHTML = '🎙️';
                    micBtn.style.background = 'rgba(56, 189, 248, 0.2)';
                    isRecording = false;
                } else {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];
                        
                        mediaRecorder.ondataavailable = e => {
                            if (e.data.size > 0) audioChunks.push(e.data);
                        };

                        mediaRecorder.onstop = async () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            const reader = new FileReader();
                            reader.readAsDataURL(audioBlob);
                            reader.onloadend = async () => {
                                const base64data = reader.result.split(',')[1];
                                await handleAudioSend(base64data);
                            };
                            stream.getTracks().forEach(track => track.stop());
                        };

                        mediaRecorder.start();
                        isRecording = true;
                        micBtn.innerHTML = '⏹️';
                        micBtn.style.background = 'rgba(239, 68, 68, 0.5)';
                    } catch (err) {
                        showToast('Microphone access denied or unavailable.', 'error');
                    }
                }
            });
        }

        async function handleAudioSend(audioBase64) {
            const typingBubble = document.createElement('div');
            typingBubble.style.padding = '12px 16px';
            typingBubble.style.background = 'rgba(56, 189, 248, 0.1)';
            typingBubble.style.borderRadius = '16px 16px 16px 4px';
            typingBubble.style.alignSelf = 'flex-start';
            typingBubble.innerHTML = '<span class="dots">🎧 Transcribing & Thinking...</span>';
            chatWindow.appendChild(typingBubble);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                const response = await API.chatAudioWithBuddy(audioBase64, chatHistory.slice(-5));
                if (chatWindow.contains(typingBubble)) chatWindow.removeChild(typingBubble);
                
                if (response.success && response.userText) {
                    addBubble(`🎙️ ` + response.userText, true);
                    chatHistory.push({ role: "user", content: response.userText });
                    
                    addBubble(response.reply, false);
                    chatHistory.push({ role: "assistant", content: response.reply });
                } else {
                   addBubble('Sorry, I couldn\'t understand the audio. Please type it!', false);
                }
            } catch (err) {
                if (chatWindow.contains(typingBubble)) chatWindow.removeChild(typingBubble);
                addBubble('Sorry, the AI is currently unavailable.', false);
                showToast(err.message, 'error');
            }
        }
    }

    // ========================
    // JITSI VIDEO CALL (Student joins)
    // ========================
    window.joinVideoCall = async function (lessonId, lessonTitle) {
        try {
            const data = await API.joinLesson(lessonId);
            const roomName = data.room_name || `LinguaNest-${lessonId.split('-')[0]}`;

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
        } catch (err) {
            // Fallback
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
                    startWithAudioMuted: true,
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
            showToast('📹 Joined video call!', 'success');
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
