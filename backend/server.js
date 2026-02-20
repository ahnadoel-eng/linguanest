/**
 * LinguaNest — Express Server
 * Main entry point for the backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// =============================================
// API ROUTES
// =============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/users', require('./routes/users'));

// =============================================
// Health check
// =============================================
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// =============================================
// INIT DATABASE TABLES
// =============================================
async function initDB() {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
                avatar_url TEXT,
                google_id VARCHAR(255) UNIQUE,
                language VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS lessons (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                student_id UUID REFERENCES users(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
                duration_minutes INTEGER DEFAULT 60,
                video_link TEXT,
                status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS progress (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
                score INTEGER DEFAULT 0,
                notes TEXT,
                completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Database tables initialized');
    } catch (err) {
        console.error('⚠️  Database initialization skipped (connect manually):', err.message);
    }
}

// =============================================
// START SERVER
// =============================================
app.listen(PORT, async () => {
    console.log(`\n🌍 LinguaNest API running at http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '..')}\n`);
    await initDB();
});

module.exports = app;
