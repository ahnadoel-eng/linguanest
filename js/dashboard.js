/**
 * LinguaNest — Dashboard JavaScript
 * Fully functional for Volunteer, Student, and Admin dashboards.
 * Renders everything dynamically from the LinguaNest data store.
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = LinguaNest.getCurrentUser();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Detect dashboard type
    const page = window.location.pathname.split('/').pop();
    const isVolunteer = page.includes('volunteer');
    const isStudent = page.includes('student');
    const isAdmin = page.includes('admin');

    // Verify role
    if (isVolunteer && user.role !== 'volunteer') { window.location.href = 'auth.html'; return; }
    if (isStudent && user.role !== 'student') { window.location.href = 'auth.html'; return; }
    if (isAdmin && user.role !== 'admin') { window.location.href = 'auth.html'; return; }

    // ========================
    // COMMON SETUP
    // ========================
    setupSidebar();
    setupUserInfo(user);
    setupGreeting(user);
    setupLogout();
    setupSectionNavigation();

    if (isVolunteer) initVolunteerDashboard(user);
    if (isStudent) initStudentDashboard(user);
    if (isAdmin) initAdminDashboard();

    // ========================
    // SIDEBAR
    // ========================
    function setupSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            // Close on outside click (mobile)
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    function setupSectionNavigation() {
        document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // Scroll section logic or simply highlight
                showToast('Section: ' + link.querySelector('span:last-child').textContent, 'info');
            });
        });
    }

    function setupUserInfo(user) {
        const initials = LinguaNest._getInitials(user.firstName, user.lastName);

        // Sidebar user
        const sidebarUser = document.getElementById('sidebarUser');
        if (sidebarUser) {
            sidebarUser.innerHTML = `
                <div class="user-avatar" style="background: ${user.avatar}">${initials}</div>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-role">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                </div>
            `;
        }
    }

    function setupGreeting(user) {
        const greetEl = document.querySelector('.dashboard-topbar .topbar-left h1');
        if (greetEl) {
            const hour = new Date().getHours();
            let greet = 'Good morning';
            if (hour >= 12 && hour < 17) greet = 'Good afternoon';
            else if (hour >= 17) greet = 'Good evening';
            greetEl.textContent = `${greet}, ${user.firstName}! 👋`;
        }

        const subEl = document.querySelector('.dashboard-topbar .topbar-left p');
        if (subEl) {
            if (isVolunteer) subEl.textContent = "Here's what's happening with your tutoring sessions";
            else if (isStudent) subEl.textContent = 'Your learning journey continues today';
            else if (isAdmin) subEl.textContent = 'Platform overview and management';
        }
    }

    function setupLogout() {
        document.querySelectorAll('a[href="index.html"]').forEach(link => {
            if (link.textContent.includes('Log Out') || link.querySelector('span')?.textContent?.includes('Log Out')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    LinguaNest.logout();
                    window.location.href = 'index.html';
                });
            }
        });
    }

    // ========================
    // VOLUNTEER DASHBOARD
    // ========================
    function initVolunteerDashboard(user) {
        renderVolunteerStats(user);
        renderUpcomingLessons(user);
        renderAttendanceTable(user);
        renderCertificate(user);
        setupCreateLesson(user);
        setupQuickActions(user);
        setupNotifications(user);
    }

    function renderVolunteerStats(user) {
        const cardsEl = document.querySelector('.stats-cards');
        if (!cardsEl) return;

        const freshUser = LinguaNest.getCurrentUser();
        const myGroups = LinguaNest.getGroupsByVolunteer(freshUser.id);
        let totalStudents = 0;
        myGroups.forEach(g => {
            totalStudents += LinguaNest.getStudentsInGroup(g.id).length;
        });

        cardsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">⏱️</span>
                    <span class="stat-card-badge up">Lifetime</span>
                </div>
                <div class="stat-card-value">${(freshUser.volunteerHours || 0).toFixed(1)}</div>
                <div class="stat-card-label">Volunteer Hours</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">👥</span>
                    <span class="stat-card-badge up">${myGroups.length} groups</span>
                </div>
                <div class="stat-card-value">${totalStudents}</div>
                <div class="stat-card-label">Active Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">📅</span>
                </div>
                <div class="stat-card-value">${freshUser.sessionsCompleted || 0}</div>
                <div class="stat-card-label">Sessions Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">⭐</span>
                </div>
                <div class="stat-card-value">${freshUser.attendanceRate || 100}%</div>
                <div class="stat-card-label">Attendance Rate</div>
            </div>
        `;

        // Animate values
        cardsEl.querySelectorAll('.stat-card-value').forEach(el => {
            el.style.animation = 'fadeInUp 0.5s ease-out';
        });
    }

    function renderUpcomingLessons(user) {
        const container = document.getElementById('lessonsList');
        if (!container) return;

        const lessons = LinguaNest.getUpcomingLessonsForVolunteer(user.id);
        const pastLessons = LinguaNest.getPastLessonsForVolunteer(user.id).slice(0, 2);
        const allLessons = [...lessons.slice(0, 4), ...pastLessons.slice(0, 1)];

        if (allLessons.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p style="font-size: 2rem; margin-bottom: 8px;">📅</p>
                    <p>No upcoming lessons. Create one!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allLessons.map(lesson => {
            const group = LinguaNest.getGroupById(lesson.groupId);
            const dt = new Date(lesson.dateTime);
            const day = dt.getDate();
            const month = dt.toLocaleDateString('en-US', { month: 'short' });
            const time = LinguaNest.formatTimeRange(lesson.dateTime, lesson.duration);
            const students = LinguaNest.getStudentsInGroup(lesson.groupId).length;

            let statusClass = 'upcoming';
            let statusText = 'Upcoming';

            if (lesson.status === 'completed') {
                statusClass = 'completed';
                statusText = 'Completed';
            } else if (lesson.status === 'checkin_needed') {
                statusClass = 'checkin-needed';
                statusText = 'Check-in!';
            } else if (lesson.status === 'checked_in') {
                statusClass = 'completed';
                statusText = '✓ Checked in';
            }

            return `
                <div class="lesson-item" data-lesson-id="${lesson.id}">
                    <div class="lesson-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="lesson-info">
                        <div class="lesson-title">${group?.title || 'Unknown Group'}</div>
                        <div class="lesson-meta">
                            <span>${time}</span>
                            <span>${students} students</span>
                        </div>
                    </div>
                    <span class="lesson-status ${statusClass}" ${statusClass === 'checkin-needed' ? `onclick="handleCheckin('${lesson.id}')"` : ''}>${statusText}</span>
                </div>
            `;
        }).join('');
    }

    // Global check-in handler
    window.handleCheckin = function (lessonId) {
        const success = LinguaNest.checkinLesson(lessonId);
        if (success) {
            showToast('✅ Checked in successfully!', 'success');
            renderUpcomingLessons(user);
        }
    };

    function renderAttendanceTable(user) {
        const container = document.querySelector('.attendance-table');
        if (!container) return;

        const myGroups = LinguaNest.getGroupsByVolunteer(user.id);
        if (myGroups.length === 0) return;

        const activeGroup = myGroups[0];
        const students = LinguaNest.getStudentsInGroup(activeGroup.id);

        // Update the header
        const headerEl = container.closest('.dashboard-card')?.querySelector('.card-header h3');
        if (headerEl) headerEl.textContent = `📋 Attendance — ${activeGroup.title}`;

        if (students.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 30px; color: var(--text-secondary);">
                    No students enrolled yet.
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="attendance-table-header">
                <span>Student</span>
                <span>Warnings</span>
                <span>Status</span>
                <span>Present</span>
            </div>
            ${students.map(student => {
            const initials = LinguaNest._getInitials(student.firstName, student.lastName);
            const warnings = student.enrollment?.warnings || 0;
            const statusClass = warnings >= 2 ? 'warning-row' : '';

            return `
                    <div class="attendance-row-data ${statusClass}">
                        <div class="student-cell">
                            <div class="student-mini-avatar" style="background: ${student.avatar}">${initials}</div>
                            <span>${student.firstName} ${student.lastName}</span>
                        </div>
                        <span ${warnings >= 2 ? 'style="color: var(--warning);"' : ''}>${warnings} ${warnings >= 2 ? '⚠️' : ''}</span>
                        <span>${student.enrollment?.status === 'kicked' ? '❌ Removed' : student.enrollment?.status || 'Active'}</span>
                        <div class="attendance-toggle ${warnings < 2 ? 'checked' : ''}"
                            data-student="${student.id}"
                            onclick="window.toggleAtt(this, '${student.id}')">
                            ${warnings < 2 ? '✓' : ''}
                        </div>
                    </div>
                `;
        }).join('')}
        `;
    }

    // Global attendance toggle
    window.toggleAtt = function (el, studentId) {
        const isChecked = el.classList.contains('checked');
        el.classList.toggle('checked');
        el.textContent = isChecked ? '' : '✓';
        const status = isChecked ? 'absent' : 'present';
        showToast(`${isChecked ? '✗' : '✓'} Marked ${status}`, isChecked ? 'warning' : 'success');
    };

    // Legacy global function
    window.toggleAttendance = window.toggleAtt;

    function renderCertificate(user) {
        const certBtn = document.getElementById('generateCertBtn');
        const progressFill = document.getElementById('certProgressFill');
        const progressText = document.querySelector('.cert-progress-text');

        if (!progressFill || !progressText) return;

        const freshUser = LinguaNest.getCurrentUser();
        const hours = freshUser.volunteerHours || 0;
        const nextMilestone = hours < 50 ? 50 : hours < 100 ? 100 : hours < 150 ? 150 : hours < 200 ? 200 : 300;
        const percent = Math.min(100, (hours / nextMilestone) * 100);

        progressFill.style.width = `${percent}%`;
        progressText.innerHTML = `<strong>${hours.toFixed(1)} / ${nextMilestone} hours</strong> to next milestone certificate`;

        if (certBtn) {
            certBtn.addEventListener('click', () => generateCertificate(freshUser));
        }
    }

    function generateCertificate(user) {
        const certHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>LinguaNest — Volunteer Certificate</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', 'Times New Roman', serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; padding: 20px; }
        .cert { width: 800px; padding: 60px; background: white; border: 3px solid #1a237e; position: relative; }
        .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #c0a44d; pointer-events: none; }
        .cert-header { text-align: center; margin-bottom: 40px; }
        .cert-org { font-size: 14px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 4px; }
        .cert-title { font-size: 32px; color: #1a237e; margin-top: 12px; font-style: italic; }
        .cert-subtitle { font-size: 14px; color: #888; margin-top: 8px; }
        .cert-body { text-align: center; margin: 40px 0; }
        .cert-body p { font-size: 16px; color: #555; line-height: 1.8; }
        .cert-name { font-size: 36px; color: #1a237e; margin: 20px 0; font-weight: bold; }
        .cert-hours { font-size: 48px; color: #c0a44d; font-weight: bold; margin: 20px 0; }
        .cert-hours-label { font-size: 16px; color: #888; letter-spacing: 3px; text-transform: uppercase; }
        .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding-top: 30px; border-top: 1px solid #e0e0e0; }
        .cert-footer-col { text-align: center; }
        .cert-footer-col .line { width: 200px; border-bottom: 1px solid #333; margin-bottom: 6px; }
        .cert-footer-col p { font-size: 12px; color: #999; }
        .cert-seal { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #c0a44d, #f9d975); display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; font-weight: bold; text-align: center; line-height: 1.2; }
        .cert-id { text-align: center; margin-top: 30px; font-size: 11px; color: #ccc; }
        @media print { body { background: white; } .cert { border: none; box-shadow: none; } .cert::before { border-color: #1a237e; } }
    </style>
</head>
<body>
    <div class="cert">
        <div class="cert-header">
            <div class="cert-org">LinguaNest Language Volunteering Platform</div>
            <div class="cert-title">Certificate of Volunteer Service</div>
            <div class="cert-subtitle">This is to certify that</div>
        </div>
        <div class="cert-body">
            <div class="cert-name">${user.firstName} ${user.lastName}</div>
            <p>has successfully dedicated their time and skills to volunteer language tutoring<br>through the LinguaNest platform, accumulating a verified total of</p>
            <div class="cert-hours">${(user.volunteerHours || 0).toFixed(1)}</div>
            <div class="cert-hours-label">Registered Volunteer Hours</div>
        </div>
        <div class="cert-footer">
            <div class="cert-footer-col">
                <div class="line"></div>
                <p>Platform Director</p>
            </div>
            <div class="cert-seal">LINGUANEST<br>VERIFIED</div>
            <div class="cert-footer-col">
                <div class="line"></div>
                <p>Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </div>
        <div class="cert-id">Certificate ID: LN-${user.id}-${Date.now().toString(36).toUpperCase()}</div>
    </div>
    <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(certHtml);
            win.document.close();
            showToast('📜 Certificate generated!', 'success');
        } else {
            showToast('Please allow popups to download your certificate', 'warning');
        }
    }

    function setupCreateLesson(user) {
        const btn = document.getElementById('createLessonBtn');
        const modal = document.getElementById('createLessonModal');
        const form = document.getElementById('createLessonForm');

        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Populate groups dropdown
                const select = modal.querySelector('.form-select');
                if (select) {
                    const myGroups = LinguaNest.getGroupsByVolunteer(user.id);
                    select.innerHTML = myGroups.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
                }
                openModal('createLessonModal');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const select = form.querySelector('.form-select');
                const dateInput = form.querySelector('input[type="date"]');
                const timeInput = form.querySelector('input[type="time"]');
                const durationSelect = form.querySelectorAll('.form-select')[1];
                const topicInput = form.querySelector('input[type="text"]');

                const groupId = select?.value;
                const dateVal = dateInput?.value;
                const timeVal = timeInput?.value;
                const duration = parseInt(durationSelect?.value || '60');
                const topic = topicInput?.value || '';

                if (groupId && dateVal && timeVal) {
                    const dt = new Date(`${dateVal}T${timeVal}:00`);
                    LinguaNest.createLesson({
                        groupId,
                        dateTime: dt.toISOString(),
                        duration,
                        topic
                    });

                    closeModal('createLessonModal');
                    showToast('✅ Lesson created successfully!', 'success');
                    renderUpcomingLessons(user);
                }
            });
        }
    }

    function setupQuickActions(user) {
        const actions = {
            'checkinAction': () => {
                const count = LinguaNest.checkinAllTodayLessons(user.id);
                if (count > 0) {
                    showToast(`✅ Checked in for ${count} lesson(s) today!`, 'success');
                    renderUpcomingLessons(user);
                } else {
                    showToast('No lessons to check in for today', 'info');
                }
            },
            'newGroupAction': () => openCreateGroupModal(user),
            'markAttendanceAction': () => showToast('Mark attendance using the table below ↓', 'info'),
            'scheduleAction': () => showToast('📅 Google Calendar sync coming soon!', 'info')
        };

        Object.entries(actions).forEach(([id, handler]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handler);
        });
    }

    function openCreateGroupModal(user) {
        // Create dynamic modal for group creation
        let modal = document.getElementById('createGroupModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'createGroupModal';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Create New Group</h2>
                        <button class="modal-close" onclick="closeModal('createGroupModal')">✕</button>
                    </div>
                    <form id="createGroupForm">
                        <div class="form-group">
                            <label class="form-label">Group Title</label>
                            <input type="text" class="form-input" id="groupTitle" placeholder="e.g. English B2 — Speaking Club" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Language</label>
                                <select class="form-select" id="groupLanguage">
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Korean">Korean</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Arabic">Arabic</option>
                                    <option value="Portuguese">Portuguese</option>
                                    <option value="Russian">Russian</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Turkish">Turkish</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Level</label>
                                <select class="form-select" id="groupLevel">
                                    <option value="A1">A1 — Beginner</option>
                                    <option value="A2">A2 — Elementary</option>
                                    <option value="B1">B1 — Intermediate</option>
                                    <option value="B2" selected>B2 — Upper Intermediate</option>
                                    <option value="C1">C1 — Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Day(s)</label>
                                <input type="text" class="form-input" id="groupDays" placeholder="e.g. Mon, Wed" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Time</label>
                                <input type="time" class="form-input" id="groupTime" value="18:00" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Duration (min)</label>
                                <select class="form-select" id="groupDuration">
                                    <option value="45">45 min</option>
                                    <option value="60" selected>60 min</option>
                                    <option value="90">90 min</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Max Students</label>
                                <select class="form-select" id="groupMaxStudents">
                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                    <option value="8" selected>8</option>
                                    <option value="10">10</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary auth-submit">Create Group</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('createGroupForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const days = document.getElementById('groupDays').value.split(',').map(d => d.trim());
                const newGroup = LinguaNest.createGroup({
                    volunteerId: user.id,
                    language: document.getElementById('groupLanguage').value,
                    level: document.getElementById('groupLevel').value,
                    title: document.getElementById('groupTitle').value,
                    maxStudents: parseInt(document.getElementById('groupMaxStudents').value),
                    schedule: {
                        days: days,
                        time: document.getElementById('groupTime').value,
                        duration: parseInt(document.getElementById('groupDuration').value)
                    }
                });

                closeModal('createGroupModal');
                showToast(`✅ Group "${newGroup.title}" created!`, 'success');
                renderVolunteerStats(user);
            });
        }

        openModal('createGroupModal');
    }

    function setupNotifications(user) {
        const btn = document.getElementById('notifBtn');
        if (!btn) return;

        let notifPanel = null;
        btn.addEventListener('click', () => {
            if (notifPanel) {
                notifPanel.remove();
                notifPanel = null;
                return;
            }

            const lessons = LinguaNest.getUpcomingLessonsForVolunteer(user.id);
            const todayLessons = lessons.filter(l => LinguaNest.isToday(l.dateTime));
            const checkinNeeded = lessons.filter(l => l.status === 'checkin_needed');

            notifPanel = document.createElement('div');
            notifPanel.className = 'notif-panel';
            notifPanel.style.cssText = 'position:absolute;top:60px;right:0;width:360px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:100;padding:0;overflow:hidden; animation:fadeInUp 0.3s ease;';

            let notifs = '';
            if (checkinNeeded.length > 0) {
                checkinNeeded.forEach(l => {
                    const group = LinguaNest.getGroupById(l.groupId);
                    notifs += `<div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
                        <span style="font-size:1.2rem;">🔔</span>
                        <div style="flex:1;">
                            <strong style="font-size:0.85rem;">${group?.title || 'Lesson'}</strong>
                            <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">Check-in required — ${LinguaNest.formatTime(l.dateTime)}</p>
                        </div>
                    </div>`;
                });
            }
            if (todayLessons.length > 0) {
                notifs += `<div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
                    <span style="font-size:1.2rem;">📅</span>
                    <div><strong style="font-size:0.85rem;">${todayLessons.length} lesson(s) today</strong></div>
                </div>`;
            }
            if (!notifs) {
                notifs = `<div style="padding:30px;text-align:center;color:var(--text-secondary);">No new notifications 🎉</div>`;
            }

            notifPanel.innerHTML = `
                <div style="padding:14px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:0.9rem;">🔔 Notifications</div>
                ${notifs}
            `;

            btn.parentElement.style.position = 'relative';
            btn.parentElement.appendChild(notifPanel);

            // Remove dot
            const dot = btn.querySelector('.notification-dot');
            if (dot) dot.style.display = 'none';

            setTimeout(() => {
                document.addEventListener('click', function handler(e) {
                    if (notifPanel && !notifPanel.contains(e.target) && !btn.contains(e.target)) {
                        notifPanel.remove();
                        notifPanel = null;
                        document.removeEventListener('click', handler);
                    }
                });
            }, 100);
        });
    }

    // ========================
    // STUDENT DASHBOARD
    // ========================
    function initStudentDashboard(user) {
        renderStudentStats(user);
        renderStudentUpcomingClasses(user);
        renderCalendar(user);
        renderBrowseGroups(user);
    }

    function renderStudentStats(user) {
        const cardsEl = document.querySelector('.stats-cards');
        if (!cardsEl) return;

        const freshUser = LinguaNest.getCurrentUser();
        const enrollments = LinguaNest.getStudentEnrollments(freshUser.id);
        const upcoming = LinguaNest.getUpcomingLessonsForStudent(freshUser.id);
        const nextLesson = upcoming[0];

        cardsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">📚</span>
                </div>
                <div class="stat-card-value">${enrollments.length}</div>
                <div class="stat-card-label">Enrolled Groups</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">📅</span>
                </div>
                <div class="stat-card-value">${upcoming.length}</div>
                <div class="stat-card-label">Upcoming Classes</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">🔥</span>
                </div>
                <div class="stat-card-value">${freshUser.streak || 0}</div>
                <div class="stat-card-label">Week Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">✅</span>
                </div>
                <div class="stat-card-value">${freshUser.sessionsAttended || 0}</div>
                <div class="stat-card-label">Sessions Attended</div>
            </div>
        `;
    }

    function renderStudentUpcomingClasses(user) {
        const container = document.getElementById('upcomingClasses') || document.querySelector('.upcoming-classes');
        if (!container) return;

        const lessons = LinguaNest.getUpcomingLessonsForStudent(user.id);

        if (lessons.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p style="font-size: 2rem; margin-bottom: 8px;">📚</p>
                    <p>No upcoming classes. Browse groups to enroll!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = lessons.slice(0, 5).map(lesson => {
            const group = LinguaNest.getGroupById(lesson.groupId);
            const volunteer = LinguaNest.getVolunteerForGroup(lesson.groupId);
            const dt = new Date(lesson.dateTime);
            const isToday = LinguaNest.isToday(lesson.dateTime);
            const isTomorrow = LinguaNest.isTomorrow(lesson.dateTime);
            const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : LinguaNest.getDayName(lesson.dateTime);

            return `
                <div class="lesson-item" style="animation: fadeInUp 0.4s ease-out;">
                    <div class="lesson-date">
                        <span class="day">${dt.getDate()}</span>
                        <span class="month">${dt.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div class="lesson-info">
                        <div class="lesson-title">${group?.title || 'Class'}</div>
                        <div class="lesson-meta">
                            <span>${LinguaNest.formatTimeRange(lesson.dateTime, lesson.duration)}</span>
                            <span>by ${volunteer?.firstName || 'Tutor'} ${volunteer?.lastName?.[0] || ''}.${volunteer ? '' : ''}</span>
                        </div>
                    </div>
                    <span class="lesson-status ${isToday ? 'checkin-needed' : 'upcoming'}">${dayLabel}</span>
                </div>
            `;
        }).join('');
    }

    function renderCalendar(user) {
        const calContainer = document.getElementById('calendarWidget') || document.querySelector('.calendar-widget');
        if (!calContainer) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();

        // Get lesson dates for this month
        const lessons = LinguaNest.getUpcomingLessonsForStudent(user.id);
        const lessonDays = lessons
            .filter(l => {
                const d = new Date(l.dateTime);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .map(l => new Date(l.dateTime).getDate());

        const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        let calendarHtml = `
            <div class="cal-header">
                <h4>${monthName}</h4>
            </div>
            <div class="cal-grid">
                <span class="cal-day-name">Sun</span>
                <span class="cal-day-name">Mon</span>
                <span class="cal-day-name">Tue</span>
                <span class="cal-day-name">Wed</span>
                <span class="cal-day-name">Thu</span>
                <span class="cal-day-name">Fri</span>
                <span class="cal-day-name">Sat</span>
        `;

        for (let i = 0; i < firstDay; i++) {
            calendarHtml += '<span class="cal-day empty"></span>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today;
            const hasLesson = lessonDays.includes(day);
            const classes = ['cal-day'];
            if (isToday) classes.push('today');
            if (hasLesson) classes.push('has-lesson');

            calendarHtml += `<span class="${classes.join(' ')}">${day}${hasLesson ? '<span class="cal-dot"></span>' : ''}</span>`;
        }

        calendarHtml += '</div>';
        calContainer.innerHTML = calendarHtml;
    }

    function renderBrowseGroups(user) {
        const container = document.getElementById('groupsGrid');
        if (!container) return;

        const availableGroups = LinguaNest.getAvailableGroups(user.id);
        const enrolledGroups = LinguaNest.getStudentEnrollments(user.id);
        const allGroups = LinguaNest.getGroups().filter(g => g.status === 'active');

        // Setup filters
        setupGroupFilters(user, container);

        renderGroupCards(allGroups, user, container);
    }

    function setupGroupFilters(user, container) {
        const filterContainer = document.getElementById('groupFilters');
        if (!filterContainer) return;

        // Get unique languages
        const groups = LinguaNest.getGroups().filter(g => g.status === 'active');
        const languages = [...new Set(groups.map(g => g.language))];
        const levels = [...new Set(groups.map(g => g.level))].sort();

        filterContainer.innerHTML = `
            <div class="filter-row">
                <span class="filter-chip active" data-filter="all">All</span>
                ${languages.map(lang => `<span class="filter-chip" data-filter="${lang}">${lang}</span>`).join('')}
            </div>
            <div class="filter-row" style="margin-top: 8px;">
                ${levels.map(level => `<span class="filter-chip level-chip" data-level="${level}">${level}</span>`).join('')}
            </div>
        `;

        // Language filter
        filterContainer.querySelectorAll('.filter-chip:not(.level-chip)').forEach(chip => {
            chip.addEventListener('click', () => {
                filterContainer.querySelectorAll('.filter-chip:not(.level-chip)').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const filter = chip.dataset.filter;
                const levelFilter = filterContainer.querySelector('.level-chip.active')?.dataset.level;
                let filtered = groups;
                if (filter !== 'all') filtered = filtered.filter(g => g.language === filter);
                if (levelFilter) filtered = filtered.filter(g => g.level === levelFilter);

                renderGroupCards(filtered, user, container);
            });
        });

        // Level filter
        filterContainer.querySelectorAll('.level-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const wasActive = chip.classList.contains('active');
                filterContainer.querySelectorAll('.level-chip').forEach(c => c.classList.remove('active'));
                if (!wasActive) chip.classList.add('active');

                const langFilter = filterContainer.querySelector('.filter-chip:not(.level-chip).active')?.dataset.filter;
                const levelFilter = wasActive ? null : chip.dataset.level;

                let filtered = groups;
                if (langFilter && langFilter !== 'all') filtered = filtered.filter(g => g.language === langFilter);
                if (levelFilter) filtered = filtered.filter(g => g.level === levelFilter);

                renderGroupCards(filtered, user, container);
            });
        });
    }

    function renderGroupCards(groups, user, container) {
        const enrolledGroupIds = LinguaNest.getStudentEnrollments(user.id).map(e => e.groupId);

        if (groups.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p style="font-size: 2rem;">🔍</p>
                    <p>No groups match your filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = groups.map(group => {
            const volunteer = LinguaNest.getUserById(group.volunteerId);
            const spots = LinguaNest.getSpotsLeft(group.id);
            const isEnrolled = enrolledGroupIds.includes(group.id);
            const initials = volunteer ? LinguaNest._getInitials(volunteer.firstName, volunteer.lastName) : '??';

            return `
                <div class="group-card" style="animation: fadeInUp 0.4s ease-out;">
                    <div class="group-card-top">
                        <div class="group-lang-badge">${group.language} ${group.level}</div>
                        <span class="group-spots ${spots <= 2 ? 'low' : ''}">${spots} spots</span>
                    </div>
                    <h4 class="group-title">${group.title}</h4>
                    <div class="group-meta">
                        <div class="group-tutor">
                            <div class="student-mini-avatar" style="background: ${volunteer?.avatar || 'var(--blue-500)'}; width:24px; height:24px; font-size:0.6rem;">${initials}</div>
                            <span>${volunteer ? volunteer.firstName + ' ' + volunteer.lastName[0] + '.' : 'Unknown'}</span>
                        </div>
                        <div class="group-schedule">${group.schedule.days.join(' & ')} at ${group.schedule.time}</div>
                    </div>
                    <div class="group-rating">⭐ ${group.rating > 0 ? group.rating.toFixed(1) : 'New'}</div>
                    <button class="btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'} group-enroll-btn"
                        data-group-id="${group.id}"
                        ${isEnrolled ? 'disabled' : ''}
                        onclick="window.handleEnroll('${group.id}')">
                        ${isEnrolled ? '✓ Enrolled' : spots > 0 ? 'Enroll Now' : 'Full'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // Global enroll handler
    window.handleEnroll = function (groupId) {
        const currentUser = LinguaNest.getCurrentUser();
        if (!currentUser) return;

        const result = LinguaNest.enrollStudent(currentUser.id, groupId);
        if (result.success) {
            const group = LinguaNest.getGroupById(groupId);
            showToast(`🎉 Enrolled in "${group?.title}"!`, 'success');
            renderStudentStats(currentUser);
            renderStudentUpcomingClasses(currentUser);
            renderCalendar(currentUser);
            renderBrowseGroups(currentUser);
        } else {
            showToast(result.error, 'error');
        }
    };

    // ========================
    // ADMIN DASHBOARD
    // ========================
    function initAdminDashboard() {
        renderAdminStats();
        renderAdminApplications();
        renderAdminComplaints();
        renderAdminUsers();
        renderAntiGhostingAlerts();
    }

    function renderAdminStats() {
        const container = document.querySelector('.stats-cards');
        if (!container) return;

        const stats = LinguaNest.getStats();

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">📝</span>
                    ${stats.pendingApplications > 0 ? `<span class="stat-card-badge up">${stats.pendingApplications} New</span>` : ''}
                </div>
                <div class="stat-card-value">${stats.pendingApplications}</div>
                <div class="stat-card-label">Pending Applications</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">⚠️</span>
                </div>
                <div class="stat-card-value">${stats.openComplaints}</div>
                <div class="stat-card-label">Open Complaints</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">👥</span>
                </div>
                <div class="stat-card-value">${stats.totalUsers}</div>
                <div class="stat-card-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-icon">📚</span>
                </div>
                <div class="stat-card-value">${stats.totalGroups}</div>
                <div class="stat-card-label">Active Groups</div>
            </div>
        `;
    }

    function renderAdminApplications() {
        const container = document.getElementById('applicationsList');
        if (!container) return;

        const apps = LinguaNest.getApplications('pending');

        if (apps.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">No pending applications 🎉</div>`;
            return;
        }

        container.innerHTML = apps.map(app => `
            <div class="application-item" id="app-${app.id}" style="animation: fadeInUp 0.4s ease-out;">
                <div class="app-user">
                    <div class="student-mini-avatar" style="background: ${app.avatar}">${app.firstName[0]}${app.lastName[0]}</div>
                    <div>
                        <strong>${app.firstName} ${app.lastName}</strong>
                        <div style="font-size:0.8rem;color:var(--text-secondary);">${app.email} · ${app.language} · ${LinguaNest.getRelativeTime(app.appliedAt)}</div>
                    </div>
                </div>
                <div class="app-actions">
                    <button class="btn btn-primary" style="padding:6px 16px;font-size:0.8rem;" onclick="window.approveApp('${app.id}')">✓ Approve</button>
                    <button class="btn btn-secondary" style="padding:6px 16px;font-size:0.8rem;" onclick="window.rejectApp('${app.id}')">✗ Reject</button>
                </div>
            </div>
        `).join('');
    }

    window.approveApp = function (appId) {
        LinguaNest.approveApplication(appId);
        const el = document.getElementById('app-' + appId);
        if (el) {
            el.style.background = 'rgba(76, 175, 80, 0.1)';
            el.querySelector('.app-actions').innerHTML = '<span style="color: #4caf50; font-weight: 600;">✓ Approved</span>';
        }
        showToast('✅ Application approved!', 'success');
        renderAdminStats();
    };

    window.rejectApp = function (appId) {
        LinguaNest.rejectApplication(appId);
        const el = document.getElementById('app-' + appId);
        if (el) {
            el.style.background = 'rgba(244, 67, 54, 0.1)';
            el.querySelector('.app-actions').innerHTML = '<span style="color: #f44336; font-weight: 600;">✗ Rejected</span>';
        }
        showToast('Application rejected', 'info');
        renderAdminStats();
    };

    function renderAdminComplaints() {
        const container = document.getElementById('complaintsList');
        if (!container) return;

        const complaints = LinguaNest.getComplaints();

        if (complaints.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">No complaints 🎉</div>`;
            return;
        }

        container.innerHTML = complaints.map(c => {
            const statusColors = { open: '#ef4444', in_review: '#f9a825', resolved: '#4caf50' };
            return `
                <div class="complaint-item" style="animation: fadeInUp 0.4s ease-out;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${statusColors[c.status] || '#888'};flex-shrink:0;"></span>
                        <div>
                            <strong style="font-size:0.85rem;">${c.subject}</strong>
                            <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${c.description?.substring(0, 80) || ''} · ${LinguaNest.getRelativeTime(c.createdAt)}</p>
                        </div>
                    </div>
                    ${c.status !== 'resolved' ?
                    `<button class="btn btn-secondary" style="padding:4px 12px;font-size:0.75rem;" onclick="window.resolveComp('${c.id}', this)">Resolve</button>` :
                    '<span style="color:#4caf50;font-size:0.8rem;font-weight:600;">Resolved ✓</span>'
                }
                </div>
            `;
        }).join('');
    }

    window.resolveComp = function (id, btn) {
        LinguaNest.resolveComplaint(id);
        btn.outerHTML = '<span style="color:#4caf50;font-size:0.8rem;font-weight:600;">Resolved ✓</span>';
        showToast('✅ Complaint resolved', 'success');
        renderAdminStats();
    };

    function renderAdminUsers() {
        const container = document.getElementById('usersList');
        if (!container) return;

        const users = LinguaNest.getAllUsers().filter(u => u.role !== 'admin');

        container.innerHTML = `
            <div class="attendance-table-header" style="grid-template-columns: 2fr 1fr 1fr 1fr;">
                <span>User</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Hours/Sessions</span>
            </div>
            ${users.map(u => {
            const initials = LinguaNest._getInitials(u.firstName, u.lastName);
            return `
                    <div class="attendance-row-data" style="grid-template-columns: 2fr 1fr 1fr 1fr;">
                        <div class="student-cell">
                            <div class="student-mini-avatar" style="background: ${u.avatar}">${initials}</div>
                            <span>${u.firstName} ${u.lastName}</span>
                        </div>
                        <span style="text-transform:capitalize;">${u.role}</span>
                        <span>${LinguaNest.formatDate(u.createdAt)}</span>
                        <span>${u.role === 'volunteer' ? (u.volunteerHours || 0).toFixed(1) + 'h' : (u.sessionsAttended || 0) + ' sessions'}</span>
                    </div>
                `;
        }).join('')}
        `;
    }

    function renderAntiGhostingAlerts() {
        const container = document.getElementById('ghostingAlerts');
        if (!container) return;

        // Find lessons that are coming up and haven't been checked in
        const allGroups = LinguaNest.getGroups();
        const allLessons = LinguaNest.getLessons();
        const uncheckedLessons = allLessons.filter(l => l.status === 'checkin_needed' && !l.checkedIn);

        if (uncheckedLessons.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);">No ghosting alerts currently 🎉</div>`;
            return;
        }

        container.innerHTML = uncheckedLessons.map(lesson => {
            const group = LinguaNest.getGroupById(lesson.groupId);
            const volunteer = LinguaNest.getUserById(group?.volunteerId);
            return `
                <div class="alert-item" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);animation: fadeInUp 0.4s ease-out;">
                    <span style="font-size:1.5rem;">🚨</span>
                    <div style="flex:1;">
                        <strong style="font-size:0.85rem;">${volunteer ? volunteer.firstName + ' ' + volunteer.lastName : 'Unknown'}</strong>
                        <p style="font-size:0.78rem;color:var(--text-secondary);">${group?.title || 'Unknown group'} — hasn't checked in for today's lesson at ${LinguaNest.formatTime(lesson.dateTime)}</p>
                    </div>
                    <button class="btn btn-secondary" style="padding:4px 12px;font-size:0.75rem;">Alert Sent</button>
                </div>
            `;
        }).join('');
    }

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

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });

    // ========================
    // TOAST NOTIFICATIONS
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

    // Inject animation keyframe
    if (!document.querySelector('#dashboardAnimations')) {
        const style = document.createElement('style');
        style.id = 'dashboardAnimations';
        style.textContent = `
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            .application-item, .complaint-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px 0;
                border-bottom: 1px solid var(--border);
                gap: 12px;
            }

            .app-actions { display: flex; gap: 8px; flex-shrink: 0; }

            .filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
            .filter-chip {
                padding: 6px 16px; border-radius: 20px; font-size: 0.8rem;
                cursor: pointer; border: 1px solid var(--border);
                background: var(--bg-surface); color: var(--text-secondary);
                transition: all 0.2s;
            }
            .filter-chip:hover { border-color: var(--blue-400); color: var(--blue-400); }
            .filter-chip.active { background: var(--blue-500); color: white; border-color: var(--blue-500); }

            .group-card {
                background: var(--bg-card); border: 1px solid var(--border);
                border-radius: 12px; padding: 20px; transition: all 0.3s;
            }
            .group-card:hover { border-color: var(--blue-400); transform: translateY(-2px); }
            .group-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .group-lang-badge {
                background: rgba(59, 130, 246, 0.15); color: var(--blue-300);
                padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
            }
            .group-spots { font-size: 0.75rem; color: var(--text-secondary); }
            .group-spots.low { color: var(--warning); }
            .group-title { font-size: 1rem; font-weight: 600; margin-bottom: 10px; }
            .group-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
            .group-tutor { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
            .group-schedule { font-size: 0.8rem; color: var(--text-secondary); }
            .group-rating { font-size: 0.85rem; margin-bottom: 14px; }
            .group-enroll-btn { width: 100%; }

            .cal-header { margin-bottom: 16px; }
            .cal-header h4 { font-size: 1rem; }
            .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
            .cal-day-name { font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; padding: 4px 0; }
            .cal-day {
                aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
                font-size: 0.8rem; border-radius: 8px; position: relative; cursor: default;
                color: var(--text-secondary);
            }
            .cal-day.today { background: var(--blue-500); color: white; font-weight: 700; }
            .cal-day.has-lesson { color: var(--amber-400); font-weight: 600; }
            .cal-dot {
                position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
                width: 4px; height: 4px; border-radius: 50%; background: var(--amber-400);
            }
            .cal-day.today .cal-dot { background: white; }

            #groupsGrid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
            }
        `;
        document.head.appendChild(style);
    }
});
