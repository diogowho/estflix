/**
 * Express middleware that guards routes behind authentication.
 *
 * Calls `next()` when the request belongs to an active, authenticated session.
 * Otherwise responds immediately with `401 Unauthorized` so downstream route
 * handlers never execute.
 *
 * @param {import('express').Request} req - The incoming Express request.
 * @param {import('express').Response} res - The outgoing Express response.
 * @param {import('express').NextFunction} next - Callback to pass control to the next middleware.
 * @returns {void}
 */
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
}

module.exports = requireAuth;
