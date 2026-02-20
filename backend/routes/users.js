/**
 * LinguaNest — Users Routes
 * User management endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// =============================================
// GET /api/users/students — Get all students (Teacher only)
// =============================================
router.get('/students', authMiddleware, requireRole('teacher'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, avatar_url, language, created_at 
             FROM users WHERE role = 'student' ORDER BY name ASC`
        );
        res.json({ success: true, students: result.rows });
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/users/teachers — Get all teachers (Student only)  
// =============================================
router.get('/teachers', authMiddleware, requireRole('student'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, avatar_url, language, created_at 
             FROM users WHERE role = 'teacher' ORDER BY name ASC`
        );
        res.json({ success: true, teachers: result.rows });
    } catch (err) {
        console.error('Get teachers error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/users/profile — Get current user profile
// =============================================
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, language, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// GET /api/users/progress — Get student progress (Student only)
// =============================================
router.get('/progress', authMiddleware, requireRole('student'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, l.title as lesson_title, l.scheduled_time
             FROM progress p
             LEFT JOIN lessons l ON p.lesson_id = l.id
             WHERE p.student_id = $1
             ORDER BY p.completed_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, progress: result.rows });
    } catch (err) {
        console.error('Get progress error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
