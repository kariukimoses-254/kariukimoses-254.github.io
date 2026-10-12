const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await queryOne(
      'SELECT user_id, first_name, last_name, email, phone, avatar, role_id, is_active FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Account has been deactivated.'
      });
    }

    const role = await queryOne('SELECT role_name FROM roles WHERE role_id = ?', [user.role_id]);
    user.role = role ? role.role_name : 'customer';

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await queryOne(
        'SELECT user_id, first_name, last_name, email, phone, avatar, role_id, is_active FROM users WHERE user_id = ?',
        [decoded.userId]
      );

      if (user && user.is_active) {
        const role = await queryOne('SELECT role_name FROM roles WHERE role_id = ?', [user.role_id]);
        user.role = role ? role.role_name : 'customer';
        req.user = user;
      }
    }
  } catch (error) {
    // Silently continue without auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
