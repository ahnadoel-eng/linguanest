/**
 * LinguaNest — Data Store
 * Central localStorage-based data layer powering the entire platform.
 * All pages import this to read/write shared state.
 */

const LinguaNest = (() => {
    const STORAGE_KEYS = {
        USERS: 'ln_users',
        CURRENT_USER: 'ln_current_user',
        GROUPS: 'ln_groups',
        LESSONS: 'ln_lessons',
        ENROLLMENTS: 'ln_enrollments',
        ATTENDANCE: 'ln_attendance',
        VOLUNTEER_LOG: 'ln_volunteer_log',
        APPLICATIONS: 'ln_applications',
        COMPLAINTS: 'ln_complaints',
        INITIALIZED: 'ln_initialized'
    };

    // ========================
    // SEED DATA
    // ========================
    function seedData() {
        if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

        const users = [
            { id: 'vol-001', firstName: 'Alex', lastName: 'Kim', email: 'alex@school.edu', password: 'password123', role: 'volunteer', language: 'english', avatar: 'linear-gradient(135deg, #667eea, #764ba2)', createdAt: '2025-09-01', volunteerHours: 127.5, sessionsCompleted: 86, studentsTaught: 24, attendanceRate: 98 },
            { id: 'vol-002', firstName: 'Lucia', lastName: 'Martinez', email: 'lucia@uni.edu', password: 'password123', role: 'volunteer', language: 'spanish', avatar: 'linear-gradient(135deg, #f093fb, #f5576c)', createdAt: '2025-10-15', volunteerHours: 84.0, sessionsCompleted: 56, studentsTaught: 18, attendanceRate: 100 },
            { id: 'vol-003', firstName: 'Min-ji', lastName: 'Park', email: 'minji@college.edu', password: 'password123', role: 'volunteer', language: 'korean', avatar: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', createdAt: '2025-11-03', volunteerHours: 52.0, sessionsCompleted: 35, studentsTaught: 12, attendanceRate: 97 },
            { id: 'vol-004', firstName: 'Daniel', lastName: 'Wilson', email: 'daniel@school.edu', password: 'password123', role: 'volunteer', language: 'english', avatar: 'linear-gradient(135deg, #4facfe, #00f2fe)', createdAt: '2025-08-20', volunteerHours: 200.0, sessionsCompleted: 134, studentsTaught: 40, attendanceRate: 99 },
            { id: 'vol-005', firstName: 'Sophie', lastName: 'Dubois', email: 'sophie@lycee.fr', password: 'password123', role: 'volunteer', language: 'french', avatar: 'linear-gradient(135deg, #43e97b, #38f9d7)', createdAt: '2025-12-01', volunteerHours: 30.0, sessionsCompleted: 20, studentsTaught: 8, attendanceRate: 95 },
            { id: 'stu-001', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@gmail.com', password: 'password123', role: 'student', language: 'english', avatar: 'linear-gradient(135deg, #f093fb, #f5576c)', createdAt: '2025-09-15', sessionsAttended: 28, streak: 12, attendanceRate: 96 },
            { id: 'stu-002', firstName: 'Maria', lastName: 'Santos', email: 'maria@gmail.com', password: 'password123', role: 'student', language: 'spanish', avatar: 'linear-gradient(135deg, #fa709a, #fee140)', createdAt: '2025-09-20', sessionsAttended: 24, streak: 8, attendanceRate: 100 },
            { id: 'stu-003', firstName: 'John', lastName: 'Doe', email: 'john@gmail.com', password: 'password123', role: 'student', language: 'english', avatar: 'linear-gradient(135deg, #4facfe, #00f2fe)', createdAt: '2025-10-01', sessionsAttended: 20, streak: 5, attendanceRate: 92 },
            { id: 'stu-004', firstName: 'Emma', lastName: 'Lee', email: 'emma@gmail.com', password: 'password123', role: 'student', language: 'english', avatar: 'linear-gradient(135deg, #43e97b, #38f9d7)', createdAt: '2025-10-10', sessionsAttended: 22, streak: 15, attendanceRate: 100 },
            { id: 'stu-005', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki@gmail.com', password: 'password123', role: 'student', language: 'japanese', avatar: 'linear-gradient(135deg, #667eea, #764ba2)', createdAt: '2025-11-01', sessionsAttended: 18, streak: 6, attendanceRate: 92 },
            { id: 'stu-006', firstName: 'Lucas', lastName: 'Rivera', email: 'lucas@gmail.com', password: 'password123', role: 'student', language: 'spanish', avatar: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', createdAt: '2025-11-15', sessionsAttended: 14, streak: 3, attendanceRate: 100 },
            { id: 'stu-007', firstName: 'Alex', lastName: 'Kowalski', email: 'alexk@gmail.com', password: 'password123', role: 'student', language: 'english', avatar: 'linear-gradient(135deg, #fa709a, #fee140)', createdAt: '2025-10-05', sessionsAttended: 10, streak: 0, attendanceRate: 83, warnings: 2 },
            { id: 'admin-001', firstName: 'Admin', lastName: 'User', email: 'admin@linguanest.com', password: 'admin123', role: 'admin', avatar: 'linear-gradient(135deg, #ef4444, #dc2626)', createdAt: '2025-01-01' }
        ];

        const groups = [
            { id: 'grp-001', volunteerId: 'vol-001', language: 'English', level: 'B2', title: 'English B2 — Speaking Club', maxStudents: 8, schedule: { days: ['Mon', 'Wed'], time: '18:00', duration: 60 }, status: 'active', rating: 4.9, createdAt: '2025-09-05' },
            { id: 'grp-002', volunteerId: 'vol-001', language: 'English', level: 'A2', title: 'English A2 — Grammar Basics', maxStudents: 6, schedule: { days: ['Thu'], time: '16:00', duration: 60 }, status: 'active', rating: 4.8, createdAt: '2025-10-01' },
            { id: 'grp-003', volunteerId: 'vol-002', language: 'Spanish', level: 'A2', title: 'Spanish A2 — Grammar & Chat', maxStudents: 8, schedule: { days: ['Tue', 'Fri'], time: '16:00', duration: 60 }, status: 'active', rating: 5.0, createdAt: '2025-10-20' },
            { id: 'grp-004', volunteerId: 'vol-003', language: 'Korean', level: 'A1', title: 'Korean A1 — Hangul Basics', maxStudents: 6, schedule: { days: ['Sat'], time: '15:00', duration: 60 }, status: 'active', rating: 4.9, createdAt: '2025-11-10' },
            { id: 'grp-005', volunteerId: 'vol-004', language: 'English', level: 'B1', title: 'English B1 — Conversation Practice', maxStudents: 8, schedule: { days: ['Mon', 'Thu'], time: '17:00', duration: 60 }, status: 'active', rating: 4.9, createdAt: '2025-08-25' },
            { id: 'grp-006', volunteerId: 'vol-005', language: 'French', level: 'A2', title: 'French A2 — Grammar & Speaking', maxStudents: 6, schedule: { days: ['Tue', 'Fri'], time: '15:00', duration: 60 }, status: 'active', rating: 5.0, createdAt: '2025-12-05' },
            { id: 'grp-007', volunteerId: 'vol-002', language: 'Spanish', level: 'C1', title: 'Spanish C1 — Advanced Fluency', maxStudents: 6, schedule: { days: ['Wed', 'Sat'], time: '18:00', duration: 90 }, status: 'active', rating: 5.0, createdAt: '2026-01-10' },
            { id: 'grp-008', volunteerId: 'vol-004', language: 'German', level: 'B2', title: 'German B2 — Debate & Discussion', maxStudents: 8, schedule: { days: ['Mon', 'Wed'], time: '19:00', duration: 60 }, status: 'active', rating: 4.7, createdAt: '2026-01-15' },
            { id: 'grp-009', volunteerId: 'vol-003', language: 'Korean', level: 'A2', title: 'Korean A2 — K-Drama Listening', maxStudents: 8, schedule: { days: ['Tue', 'Thu'], time: '16:00', duration: 60 }, status: 'active', rating: 4.9, createdAt: '2026-01-20' },
            { id: 'grp-010', volunteerId: 'vol-005', language: 'Japanese', level: 'A1', title: 'Japanese A1 — Hiragana & Basics', maxStudents: 6, schedule: { days: ['Wed', 'Sat'], time: '14:00', duration: 60 }, status: 'active', rating: 4.8, createdAt: '2026-02-01' }
        ];

        const enrollments = [
            // Sarah's enrollments
            { id: 'enr-001', studentId: 'stu-001', groupId: 'grp-001', status: 'active', warnings: 0, joinedAt: '2025-09-20' },
            { id: 'enr-002', studentId: 'stu-001', groupId: 'grp-003', status: 'active', warnings: 0, joinedAt: '2025-11-01' },
            { id: 'enr-003', studentId: 'stu-001', groupId: 'grp-004', status: 'active', warnings: 0, joinedAt: '2025-12-01' },
            // Maria
            { id: 'enr-004', studentId: 'stu-002', groupId: 'grp-001', status: 'active', warnings: 0, joinedAt: '2025-09-25' },
            // John
            { id: 'enr-005', studentId: 'stu-003', groupId: 'grp-001', status: 'active', warnings: 1, joinedAt: '2025-10-05' },
            { id: 'enr-006', studentId: 'stu-003', groupId: 'grp-002', status: 'active', warnings: 0, joinedAt: '2025-10-15' },
            // Emma
            { id: 'enr-007', studentId: 'stu-004', groupId: 'grp-001', status: 'active', warnings: 0, joinedAt: '2025-10-15' },
            // Yuki
            { id: 'enr-008', studentId: 'stu-005', groupId: 'grp-001', status: 'active', warnings: 1, joinedAt: '2025-11-10' },
            // Lucas
            { id: 'enr-009', studentId: 'stu-006', groupId: 'grp-001', status: 'active', warnings: 0, joinedAt: '2025-11-20' },
            { id: 'enr-010', studentId: 'stu-006', groupId: 'grp-003', status: 'active', warnings: 0, joinedAt: '2025-12-01' },
            // Alex Kowalski
            { id: 'enr-011', studentId: 'stu-007', groupId: 'grp-001', status: 'warned', warnings: 2, joinedAt: '2025-10-10' }
        ];

        // Generate lessons for today + surrounding days
        const today = new Date();
        const lessons = [];
        const lessonGroups = ['grp-001', 'grp-002', 'grp-003', 'grp-004', 'grp-005'];

        for (let d = -7; d <= 14; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() + d);
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

            groups.forEach(grp => {
                if (grp.schedule.days.includes(dayName)) {
                    const [h, m] = grp.schedule.time.split(':').map(Number);
                    const lessonDate = new Date(date);
                    lessonDate.setHours(h, m, 0, 0);

                    const isPast = lessonDate < new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    const hoursUntil = (lessonDate - new Date()) / (1000 * 60 * 60);
                    const needsCheckin = isToday && hoursUntil > 0 && hoursUntil <= 4;

                    let status = 'scheduled';
                    if (isPast) status = 'completed';
                    else if (needsCheckin) status = 'checkin_needed';

                    lessons.push({
                        id: `les-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        groupId: grp.id,
                        dateTime: lessonDate.toISOString(),
                        duration: grp.schedule.duration,
                        status: status,
                        checkedIn: isPast,
                        topic: '',
                        createdAt: grp.createdAt
                    });
                }
            });
        }

        const applications = [
            { id: 'app-001', userId: null, firstName: 'Michael', lastName: 'Jordan', email: 'michael@school.edu', language: 'Spanish', status: 'pending', appliedAt: new Date(Date.now() - 2 * 3600000).toISOString(), avatar: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { id: 'app-002', userId: null, firstName: 'Anna', lastName: 'Li', email: 'anna@university.edu', language: 'Mandarin', status: 'pending', appliedAt: new Date(Date.now() - 5 * 3600000).toISOString(), avatar: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { id: 'app-003', userId: null, firstName: 'Tom', lastName: 'Kim', email: 'tom@highschool.edu', language: 'Korean', status: 'pending', appliedAt: new Date(Date.now() - 24 * 3600000).toISOString(), avatar: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
        ];

        const complaints = [
            { id: 'cmp-001', reportedBy: 'vol-001', subject: 'Student absent 3x without notice', description: 'Alex Kowalski has been absent 3 times without prior notice.', status: 'open', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
            { id: 'cmp-002', reportedBy: 'stu-002', subject: 'Volunteer cancelled 2 lessons in a row', description: 'A volunteer in French A2 cancelled two sessions.', status: 'in_review', createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
            { id: 'cmp-003', reportedBy: 'stu-003', subject: 'Schedule conflict reported', description: 'Two groups have overlapping times.', status: 'resolved', createdAt: new Date(Date.now() - 72 * 3600000).toISOString() }
        ];

        _save(STORAGE_KEYS.USERS, users);
        _save(STORAGE_KEYS.GROUPS, groups);
        _save(STORAGE_KEYS.LESSONS, lessons);
        _save(STORAGE_KEYS.ENROLLMENTS, enrollments);
        _save(STORAGE_KEYS.APPLICATIONS, applications);
        _save(STORAGE_KEYS.COMPLAINTS, complaints);
        _save(STORAGE_KEYS.ATTENDANCE, []);
        _save(STORAGE_KEYS.VOLUNTEER_LOG, []);
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }

    // ========================
    // HELPERS
    // ========================
    function _save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function _load(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch { return []; }
    }

    function _genId(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    }

    function _getInitials(first, last) {
        return (first?.[0] || '') + (last?.[0] || '');
    }

    // ========================
    // AUTH
    // ========================
    function register(data) {
        const users = _load(STORAGE_KEYS.USERS);
        if (users.find(u => u.email === data.email)) {
            return { success: false, error: 'Email already registered' };
        }

        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a18cd1, #fbc2eb)'
        ];

        const user = {
            id: _genId(data.role === 'volunteer' ? 'vol' : 'stu'),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role,
            language: data.language || '',
            avatar: colors[Math.floor(Math.random() * colors.length)],
            createdAt: new Date().toISOString(),
            volunteerHours: 0,
            sessionsCompleted: 0,
            studentsTaught: 0,
            sessionsAttended: 0,
            streak: 0,
            attendanceRate: 100,
            warnings: 0
        };

        users.push(user);
        _save(STORAGE_KEYS.USERS, users);
        _save(STORAGE_KEYS.CURRENT_USER, user);

        // If volunteer, create a pending application
        if (data.role === 'volunteer') {
            const apps = _load(STORAGE_KEYS.APPLICATIONS);
            apps.push({
                id: _genId('app'),
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                language: user.language,
                status: 'approved', // auto-approve for demo
                appliedAt: new Date().toISOString(),
                avatar: user.avatar
            });
            _save(STORAGE_KEYS.APPLICATIONS, apps);
        }

        return { success: true, user };
    }

    function login(email, password) {
        const users = _load(STORAGE_KEYS.USERS);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            // If no exact match, try email-only for demo
            const byEmail = users.find(u => u.email === email);
            if (byEmail) {
                _save(STORAGE_KEYS.CURRENT_USER, byEmail);
                return { success: true, user: byEmail };
            }
            return { success: false, error: 'Invalid email or password' };
        }

        _save(STORAGE_KEYS.CURRENT_USER, user);
        return { success: true, user };
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        } catch { return null; }
    }

    function updateCurrentUser(updates) {
        const user = getCurrentUser();
        if (!user) return;

        const updated = { ...user, ...updates };
        _save(STORAGE_KEYS.CURRENT_USER, updated);

        const users = _load(STORAGE_KEYS.USERS);
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = updated;
            _save(STORAGE_KEYS.USERS, users);
        }

        return updated;
    }

    // ========================
    // GROUPS
    // ========================
    function getGroups() { return _load(STORAGE_KEYS.GROUPS); }

    function getGroupById(id) { return getGroups().find(g => g.id === id); }

    function getGroupsByVolunteer(volunteerId) {
        return getGroups().filter(g => g.volunteerId === volunteerId);
    }

    function getAvailableGroups(studentId) {
        const enrollments = _load(STORAGE_KEYS.ENROLLMENTS);
        const enrolledGroupIds = enrollments
            .filter(e => e.studentId === studentId && e.status === 'active')
            .map(e => e.groupId);

        return getGroups().filter(g => g.status === 'active' && !enrolledGroupIds.includes(g.id));
    }

    function getVolunteerForGroup(groupId) {
        const group = getGroupById(groupId);
        if (!group) return null;
        return _load(STORAGE_KEYS.USERS).find(u => u.id === group.volunteerId);
    }

    function getStudentsInGroup(groupId) {
        const enrollments = _load(STORAGE_KEYS.ENROLLMENTS).filter(e => e.groupId === groupId && e.status !== 'kicked');
        const users = _load(STORAGE_KEYS.USERS);
        return enrollments.map(e => {
            const user = users.find(u => u.id === e.studentId);
            return user ? { ...user, enrollment: e } : null;
        }).filter(Boolean);
    }

    function getSpotsLeft(groupId) {
        const group = getGroupById(groupId);
        if (!group) return 0;
        const enrolled = _load(STORAGE_KEYS.ENROLLMENTS).filter(e => e.groupId === groupId && e.status === 'active').length;
        return Math.max(0, group.maxStudents - enrolled);
    }

    function createGroup(data) {
        const groups = _load(STORAGE_KEYS.GROUPS);
        const group = {
            id: _genId('grp'),
            volunteerId: data.volunteerId,
            language: data.language,
            level: data.level,
            title: data.title,
            maxStudents: data.maxStudents || 8,
            schedule: data.schedule,
            status: 'active',
            rating: 0,
            createdAt: new Date().toISOString()
        };
        groups.push(group);
        _save(STORAGE_KEYS.GROUPS, groups);
        return group;
    }

    // ========================
    // ENROLLMENTS
    // ========================
    function enrollStudent(studentId, groupId) {
        const enrollments = _load(STORAGE_KEYS.ENROLLMENTS);
        const existing = enrollments.find(e => e.studentId === studentId && e.groupId === groupId);
        if (existing) return { success: false, error: 'Already enrolled' };

        if (getSpotsLeft(groupId) <= 0) return { success: false, error: 'No spots left' };

        const enrollment = {
            id: _genId('enr'),
            studentId,
            groupId,
            status: 'active',
            warnings: 0,
            joinedAt: new Date().toISOString()
        };
        enrollments.push(enrollment);
        _save(STORAGE_KEYS.ENROLLMENTS, enrollments);
        return { success: true, enrollment };
    }

    function getStudentEnrollments(studentId) {
        return _load(STORAGE_KEYS.ENROLLMENTS).filter(e => e.studentId === studentId && e.status === 'active');
    }

    function unenrollStudent(studentId, groupId) {
        const enrollments = _load(STORAGE_KEYS.ENROLLMENTS);
        const idx = enrollments.findIndex(e => e.studentId === studentId && e.groupId === groupId);
        if (idx !== -1) {
            enrollments[idx].status = 'kicked';
            _save(STORAGE_KEYS.ENROLLMENTS, enrollments);
        }
    }

    // ========================
    // LESSONS
    // ========================
    function getLessons() { return _load(STORAGE_KEYS.LESSONS); }

    function getLessonsByGroup(groupId) {
        return getLessons().filter(l => l.groupId === groupId).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }

    function getUpcomingLessonsForVolunteer(volunteerId) {
        const myGroups = getGroupsByVolunteer(volunteerId).map(g => g.id);
        const now = new Date();
        return getLessons()
            .filter(l => myGroups.includes(l.groupId) && new Date(l.dateTime) >= now)
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .slice(0, 10);
    }

    function getUpcomingLessonsForStudent(studentId) {
        const myGroups = getStudentEnrollments(studentId).map(e => e.groupId);
        const now = new Date();
        return getLessons()
            .filter(l => myGroups.includes(l.groupId) && new Date(l.dateTime) >= now)
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .slice(0, 10);
    }

    function getPastLessonsForVolunteer(volunteerId) {
        const myGroups = getGroupsByVolunteer(volunteerId).map(g => g.id);
        return getLessons()
            .filter(l => myGroups.includes(l.groupId) && l.status === 'completed')
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }

    function createLesson(data) {
        const lessons = _load(STORAGE_KEYS.LESSONS);
        const lesson = {
            id: _genId('les'),
            groupId: data.groupId,
            dateTime: data.dateTime,
            duration: data.duration || 60,
            status: 'scheduled',
            checkedIn: false,
            topic: data.topic || '',
            createdAt: new Date().toISOString()
        };
        lessons.push(lesson);
        _save(STORAGE_KEYS.LESSONS, lessons);
        return lesson;
    }

    function checkinLesson(lessonId) {
        const lessons = _load(STORAGE_KEYS.LESSONS);
        const idx = lessons.findIndex(l => l.id === lessonId);
        if (idx !== -1) {
            lessons[idx].checkedIn = true;
            lessons[idx].status = 'checked_in';
            _save(STORAGE_KEYS.LESSONS, lessons);
            return true;
        }
        return false;
    }

    function checkinAllTodayLessons(volunteerId) {
        const lessons = _load(STORAGE_KEYS.LESSONS);
        const myGroups = getGroupsByVolunteer(volunteerId).map(g => g.id);
        const today = new Date().toDateString();
        let count = 0;

        lessons.forEach((l, i) => {
            if (myGroups.includes(l.groupId) && new Date(l.dateTime).toDateString() === today && !l.checkedIn) {
                lessons[i].checkedIn = true;
                lessons[i].status = 'checked_in';
                count++;
            }
        });

        if (count > 0) _save(STORAGE_KEYS.LESSONS, lessons);
        return count;
    }

    // ========================
    // ATTENDANCE
    // ========================
    function markAttendance(lessonId, studentId, present) {
        const records = _load(STORAGE_KEYS.ATTENDANCE);
        const existing = records.findIndex(r => r.lessonId === lessonId && r.studentId === studentId);

        if (existing !== -1) {
            records[existing].present = present;
            records[existing].markedAt = new Date().toISOString();
        } else {
            records.push({
                id: _genId('att'),
                lessonId,
                studentId,
                present,
                markedAt: new Date().toISOString()
            });
        }

        _save(STORAGE_KEYS.ATTENDANCE, records);

        // Check warnings
        if (!present) {
            const enrollments = _load(STORAGE_KEYS.ENROLLMENTS);
            const lesson = getLessons().find(l => l.id === lessonId);
            if (lesson) {
                const enrollment = enrollments.find(e => e.studentId === studentId && e.groupId === lesson.groupId);
                if (enrollment) {
                    enrollment.warnings = (enrollment.warnings || 0) + 1;
                    if (enrollment.warnings >= 2) {
                        enrollment.status = 'kicked';
                    }
                    _save(STORAGE_KEYS.ENROLLMENTS, enrollments);
                }
            }
        }
    }

    function getAttendanceForLesson(lessonId) {
        return _load(STORAGE_KEYS.ATTENDANCE).filter(a => a.lessonId === lessonId);
    }

    // ========================
    // VOLUNTEER HOURS
    // ========================
    function logVolunteerHours(volunteerId, lessonId, hours) {
        const log = _load(STORAGE_KEYS.VOLUNTEER_LOG);
        log.push({
            id: _genId('vlog'),
            volunteerId,
            lessonId,
            hours,
            verified: true,
            loggedAt: new Date().toISOString()
        });
        _save(STORAGE_KEYS.VOLUNTEER_LOG, log);

        // Update user
        const user = getCurrentUser();
        if (user && user.id === volunteerId) {
            updateCurrentUser({
                volunteerHours: (user.volunteerHours || 0) + hours,
                sessionsCompleted: (user.sessionsCompleted || 0) + 1
            });
        }
    }

    function getTotalHours(volunteerId) {
        return _load(STORAGE_KEYS.VOLUNTEER_LOG)
            .filter(l => l.volunteerId === volunteerId)
            .reduce((sum, l) => sum + l.hours, 0);
    }

    // ========================
    // APPLICATIONS (Admin)
    // ========================
    function getApplications(status) {
        const apps = _load(STORAGE_KEYS.APPLICATIONS);
        return status ? apps.filter(a => a.status === status) : apps;
    }

    function approveApplication(appId) {
        const apps = _load(STORAGE_KEYS.APPLICATIONS);
        const idx = apps.findIndex(a => a.id === appId);
        if (idx !== -1) {
            apps[idx].status = 'approved';
            _save(STORAGE_KEYS.APPLICATIONS, apps);
            return apps[idx];
        }
    }

    function rejectApplication(appId) {
        const apps = _load(STORAGE_KEYS.APPLICATIONS);
        const idx = apps.findIndex(a => a.id === appId);
        if (idx !== -1) {
            apps[idx].status = 'rejected';
            _save(STORAGE_KEYS.APPLICATIONS, apps);
            return apps[idx];
        }
    }

    // ========================
    // COMPLAINTS (Admin)
    // ========================
    function getComplaints(status) {
        const c = _load(STORAGE_KEYS.COMPLAINTS);
        return status ? c.filter(x => x.status === status) : c;
    }

    function resolveComplaint(id) {
        const complaints = _load(STORAGE_KEYS.COMPLAINTS);
        const idx = complaints.findIndex(c => c.id === id);
        if (idx !== -1) {
            complaints[idx].status = 'resolved';
            _save(STORAGE_KEYS.COMPLAINTS, complaints);
        }
    }

    // ========================
    // UTILITY
    // ========================
    function getAllUsers() { return _load(STORAGE_KEYS.USERS); }

    function getUserById(id) { return _load(STORAGE_KEYS.USERS).find(u => u.id === id); }

    function getStats() {
        const users = _load(STORAGE_KEYS.USERS);
        const groups = _load(STORAGE_KEYS.GROUPS);
        const lessons = _load(STORAGE_KEYS.LESSONS);
        const apps = _load(STORAGE_KEYS.APPLICATIONS);
        const complaints = _load(STORAGE_KEYS.COMPLAINTS);

        return {
            totalUsers: users.filter(u => u.role !== 'admin').length,
            totalVolunteers: users.filter(u => u.role === 'volunteer').length,
            totalStudents: users.filter(u => u.role === 'student').length,
            totalGroups: groups.filter(g => g.status === 'active').length,
            totalLessons: lessons.length,
            completedLessons: lessons.filter(l => l.status === 'completed').length,
            pendingApplications: apps.filter(a => a.status === 'pending').length,
            openComplaints: complaints.filter(c => c.status !== 'resolved').length
        };
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

    function getRelativeTime(isoString) {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    function getDayName(isoString) {
        return new Date(isoString).toLocaleDateString('en-US', { weekday: 'short' });
    }

    function isToday(isoString) {
        return new Date(isoString).toDateString() === new Date().toDateString();
    }

    function isTomorrow(isoString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return new Date(isoString).toDateString() === tomorrow.toDateString();
    }

    function resetData() {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        seedData();
    }

    // Init on load
    seedData();

    // ========================
    // PUBLIC API
    // ========================
    return {
        // Auth
        register, login, logout, getCurrentUser, updateCurrentUser,

        // Groups
        getGroups, getGroupById, getGroupsByVolunteer, getAvailableGroups,
        getVolunteerForGroup, getStudentsInGroup, getSpotsLeft, createGroup,

        // Enrollments
        enrollStudent, getStudentEnrollments, unenrollStudent,

        // Lessons
        getLessons, getLessonsByGroup, getUpcomingLessonsForVolunteer,
        getUpcomingLessonsForStudent, getPastLessonsForVolunteer,
        createLesson, checkinLesson, checkinAllTodayLessons,

        // Attendance
        markAttendance, getAttendanceForLesson,

        // Volunteer Hours
        logVolunteerHours, getTotalHours,

        // Admin
        getApplications, approveApplication, rejectApplication,
        getComplaints, resolveComplaint,

        // Utility
        getAllUsers, getUserById, getStats,
        formatDate, formatTime, formatTimeRange, getRelativeTime,
        getDayName, isToday, isTomorrow,

        // Helpers
        _getInitials: _getInitials,
        resetData
    };
})();
