/**
 * LinguaNest — Auth Routes
 * Register, Login, Google OAuth 2.0, Session management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// =============================================
// POST /api/auth/register
// =============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, language } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required.' });
        }

        if (!['teacher', 'student'].includes(role)) {
            return res.status(400).json({ error: 'Role must be "teacher" or "student".' });
        }

        // Check if user exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, language)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, language, avatar_url, created_at`,
            [name, email, password_hash, role, language || null]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// POST /api/auth/login
// =============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const result = await pool.query(
            'SELECT id, name, email, password_hash, role, language, avatar_url, created_at FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// =============================================
// POST /api/auth/google
// Google OAuth 2.0 — Verify ID token and create/login user
// =============================================
router.post('/google', async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required.' });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists by google_id or email
        let result = await pool.query(
            'SELECT id, name, email, role, language, avatar_url, created_at FROM users WHERE google_id = $1 OR email = $2',
            [googleId, email]
        );

        let user;

        if (result.rows.length > 0) {
            // Existing user — update google_id if needed
            user = result.rows[0];
            await pool.query(
                'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
                [googleId, picture, user.id]
            );
        } else {
            // New user — create account
            const userRole = role && ['teacher', 'student'].includes(role) ? role : 'student';
            const insertResult = await pool.query(
                `INSERT INTO users (name, email, google_id, role, avatar_url)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, language, avatar_url, created_at`,
                [name, email, googleId, userRole, picture]
            );
            user = insertResult.rows[0];
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Invalid Google credential.' });
    }
});

// =============================================
// GET /api/auth/me — Get current user session
// =============================================
router.get('/me', authMiddleware, async (req, res) => {
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
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
