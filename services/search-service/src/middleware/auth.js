/**
 * HmarePanditJi — Search Service Auth Middleware
 *
 * Master Rule #5: Every endpoint except /public/* must validate JWT.
 * Master Rule #6: Guests can search (browse). authenticate sets req.user
 *                 or null for guests; guestAllowed permits both.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authenticate JWT token. Attaches req.user = { userId, userType, status }.
 * Returns 401 if token is invalid.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'AUTH_REQUIRED',
            message: 'Authorization token required',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = {
            userId: decoded.userId || decoded.sub,
            userType: decoded.userType || decoded.role,
            status: decoded.status || 'active',
        };
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Token is invalid or expired',
        });
    }
}

/**
 * Guest-allowed middleware: sets req.user if a valid token is present,
 * but still allows the request through without one.
 * Used for search endpoints (Master Rule #6: guests can browse).
 */
function guestAllowed(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = {
            userId: decoded.userId || decoded.sub,
            userType: decoded.userType || decoded.role,
            status: decoded.status || 'active',
        };
    } catch {
        req.user = null; // invalid token → treat as guest
    }

    next();
}

/**
 * Role guard — restrict to specific user types.
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Insufficient permissions',
            });
        }

        next();
    };
}

module.exports = { authenticate, guestAllowed, authorize };
