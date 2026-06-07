const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const router = express.Router();

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 * Responds with `401` when the request is not authenticated.
 *
 * @param {import('express').Request} req - Express request. `req.user` is populated by Passport.
 * @param {import('express').Response} res - Express response.
 * @returns {void}
 */
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    return res.json({ user: req.user });
});

/**
 * POST /api/auth/register
 *
 * Creates a new user account, hashes the supplied password with bcrypt,
 * and automatically logs the new user in via `req.login`.
 *
 * @param {import('express').Request} req - Express request. Expected body: `{ email, password }`.
 * @param {import('express').Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {Error} Passes unexpected errors to Express's default error handler.
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        const [rows] = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const newUser = rows[0];

        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login after register failed' });
            }
            return res.status(201).json({ user: newUser });
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/auth/login
 *
 * Authenticates a user with the Passport LocalStrategy (email + password).
 * On success, establishes a session and returns the user object with the
 * `password` field stripped from the response.
 *
 * @param {import('express').Request} req - Express request. Expected body: `{ email, password }`.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next function, used to forward errors.
 * @returns {void}
 */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Invalid credentials' });
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            // Remove password from user object for security
            const { password: _pw, ...safeUser } = user;
            return res.json({ user: safeUser });
        });
    })(req, res, next);
});

/**
 * POST /api/auth/logout
 *
 * Terminates the current session using Passport's `req.logout` method.
 *
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next function, used to forward errors.
 * @returns {void}
 */
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        return res.json({ message: 'Logged out' });
    });
});

module.exports = router;
