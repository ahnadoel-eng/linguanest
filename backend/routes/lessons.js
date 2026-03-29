/**
 * LinguaNest — Lessons Routes
 * CRUD for lessons, teacher/student scoped
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// =============================================
// GET /api/lessons — Get lessons for current user
// Teachers see their created lessons; Students see assigned lessons
// =============================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query, params;

        if (req.user.role === 'teacher') {
            query = `
                SELECT l.*, u.name as student_name, u.email as student_email, u.avatar_url as student_avatar
                FROM lessons l
                LEFT JOIN users u ON l.student_id = u.id
                WHERE l.teacher_id = $1
                ORDER BY l.scheduled_time DESC
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT l.*, u.name as teacher_name, u.email as teacher_email, u.avatar_url as teacher_avatar
                FROM lessons l
                LEFT JOIN users u ON l.teacher_id = u.id
                WHERE l.student_id = $1
                ORDER BY l.scheduled_time DESC
            `;
            params = [req.user.id];
        }

        const result = await pool.query(query, params);
        res.json({ success: true, lessons: result.rows });
    } catch (err) {
        console.error('Get lessons error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/lessons/upcoming — Upcoming lessons
// =============================================
router.get('/upcoming', authMiddleware, async (req, res) => {
    try {
        let query, params;

        if (req.user.role === 'teacher') {
            query = `
                SELECT l.*, u.name as student_name, u.avatar_url as student_avatar
                FROM lessons l
                LEFT JOIN users u ON l.student_id = u.id
                WHERE l.teacher_id = $1 AND l.scheduled_time >= NOW() AND l.status IN ('scheduled', 'active')
                ORDER BY l.scheduled_time ASC
                LIMIT 10
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT l.*, u.name as teacher_name, u.avatar_url as teacher_avatar
                FROM lessons l
                LEFT JOIN users u ON l.teacher_id = u.id
                WHERE l.student_id = $1 AND l.scheduled_time >= NOW() AND l.status IN ('scheduled', 'active')
                ORDER BY l.scheduled_time ASC
                LIMIT 10
            `;
            params = [req.user.id];
        }

        const result = await pool.query(query, params);
        res.json({ success: true, lessons: result.rows });
    } catch (err) {
        console.error('Get upcoming lessons error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/lessons/completed — Past completed lessons
// =============================================
router.get('/completed', authMiddleware, async (req, res) => {
    try {
        const field = req.user.role === 'teacher' ? 'teacher_id' : 'student_id';
        const result = await pool.query(
            `SELECT l.*, u.name as partner_name, u.avatar_url as partner_avatar
             FROM lessons l
             LEFT JOIN users u ON ${req.user.role === 'teacher' ? 'l.student_id' : 'l.teacher_id'} = u.id
             WHERE l.${field} = $1 AND l.status = 'completed'
             ORDER BY l.scheduled_time DESC
             LIMIT 20`,
            [req.user.id]
        );
        res.json({ success: true, lessons: result.rows });
    } catch (err) {
        console.error('Get completed lessons error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// POST /api/lessons — Create a lesson (Teacher only)
// =============================================
router.post('/', authMiddleware, requireRole('teacher'), async (req, res) => {
    try {
        const { title, description, scheduled_time, duration_minutes, student_id, lesson_plan } = req.body;

        if (!title || !scheduled_time) {
            return res.status(400).json({ error: 'Title and scheduled_time are required.' });
        }

        // Generate Jitsi room name
        const roomId = `LinguaNest-${uuidv4().split('-')[0]}`;
        const video_link = roomId;

        const result = await pool.query(
            `INSERT INTO lessons (teacher_id, student_id, title, description, lesson_plan, scheduled_time, duration_minutes, video_link)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [req.user.id, student_id || null, title, description || '', lesson_plan ? JSON.stringify(lesson_plan) : null, scheduled_time, duration_minutes || 60, video_link]
        );

        res.status(201).json({ success: true, lesson: result.rows[0] });
    } catch (err) {
        console.error('Create lesson error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// PUT /api/lessons/:id — Update a lesson (Teacher only)
// =============================================
router.put('/:id', authMiddleware, requireRole('teacher'), async (req, res) => {
    try {
        const { title, description, scheduled_time, duration_minutes, student_id, status } = req.body;

        const result = await pool.query(
            `UPDATE lessons SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                scheduled_time = COALESCE($3, scheduled_time),
                duration_minutes = COALESCE($4, duration_minutes),
                student_id = COALESCE($5, student_id),
                status = COALESCE($6, status)
             WHERE id = $7 AND teacher_id = $8
             RETURNING *`,
            [title, description, scheduled_time, duration_minutes, student_id, status, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found or not yours.' });
        }

        res.json({ success: true, lesson: result.rows[0] });
    } catch (err) {
        console.error('Update lesson error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// DELETE /api/lessons/:id — Delete lesson (Teacher only)
// =============================================
router.delete('/:id', authMiddleware, requireRole('teacher'), async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM lessons WHERE id = $1 AND teacher_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found or not yours.' });
        }

        res.json({ success: true, message: 'Lesson deleted.' });
    } catch (err) {
        console.error('Delete lesson error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/lessons/stats — Dashboard stats
// =============================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const field = req.user.role === 'teacher' ? 'teacher_id' : 'student_id';

        const totalResult = await pool.query(
            `SELECT COUNT(*) as total FROM lessons WHERE ${field} = $1`,
            [req.user.id]
        );

        const upcomingResult = await pool.query(
            `SELECT COUNT(*) as upcoming FROM lessons WHERE ${field} = $1 AND scheduled_time >= NOW() AND status IN ('scheduled', 'active')`,
            [req.user.id]
        );

        const completedResult = await pool.query(
            `SELECT COUNT(*) as completed FROM lessons WHERE ${field} = $1 AND status = 'completed'`,
            [req.user.id]
        );

        let extra = {};
        if (req.user.role === 'teacher') {
            const studentsResult = await pool.query(
                `SELECT COUNT(DISTINCT student_id) as students FROM lessons WHERE teacher_id = $1 AND student_id IS NOT NULL`,
                [req.user.id]
            );
            extra.total_students = parseInt(studentsResult.rows[0].students);
        }

        if (req.user.role === 'student') {
            const progressResult = await pool.query(
                `SELECT COUNT(*) as progress_entries, COALESCE(AVG(score), 0) as avg_score FROM progress WHERE student_id = $1`,
                [req.user.id]
            );
            extra.progress_entries = parseInt(progressResult.rows[0].progress_entries);
            extra.avg_score = Math.round(parseFloat(progressResult.rows[0].avg_score));
        }

        res.json({
            success: true,
            stats: {
                total_lessons: parseInt(totalResult.rows[0].total),
                upcoming_lessons: parseInt(upcomingResult.rows[0].upcoming),
                completed_lessons: parseInt(completedResult.rows[0].completed),
                ...extra
            }
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/lessons/:id/join — Get video link to join
// =============================================
router.get('/:id/join', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lessons WHERE id = $1 AND (teacher_id = $2 OR student_id = $2)',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found or access denied.' });
        }

        const lesson = result.rows[0];

        res.json({
            success: true,
            video_link: lesson.video_link,
            room_name: lesson.video_link,
            display_name: req.user.name,
            lesson_plan: lesson.lesson_plan
        });
    } catch (err) {
        console.error('Join lesson error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
