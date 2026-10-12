const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });

  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    const existingUser = await queryOne('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const result = await insert(
      'INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id, verification_token) VALUES (?, ?, ?, ?, ?, 3, ?)',
      [first_name, last_name, email, passwordHash, phone || null, verificationToken]
    );

    const userId = result.insertId;

    // Auto-populate customer profile with smart defaults
    await insert(
      `INSERT INTO customers (user_id, preferred_location, budget_min, budget_max)
       VALUES (?, 'Nairobi', 1000000, 20000000)`,
      [userId]
    );

    // Auto-create welcome notification
    await insert(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Welcome to Lil Mosey Estate 6G Edition!', 'Your account is ready. Browse properties, save favorites, and book viewings to find your dream home.', 'success', '/properties')`,
      [userId]
    );

    // Auto-create welcome system message
    const welcomeMessage = `Hi ${first_name}! Welcome to Lil Mosey Estate 6G Edition. We are thrilled to have you join our community of property seekers. Here is what you can do next: 1) Browse our curated property listings, 2) Save your favorites for later, 3) Book a viewing with one of our expert agents, 4) Use our mortgage calculator to plan your budget. If you need any help, our team is here for you 24/7. Happy house hunting!`;
    await insert(
      'INSERT INTO messages (sender_id, receiver_id, subject, message, is_read) VALUES (1, ?, ?, ?, 0)',
      [userId, 'Welcome aboard!', welcomeMessage]
    );

    // Log the activity
    await insert(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES (?, 'register', 'user', ?, ?, ?)`,
      [userId, userId, JSON.stringify({ first_name, last_name, email }), req.ip]
    );

    // Fetch smart recommendations for the new user
    const featuredProperties = await query(
      `SELECT p.property_id, p.title, p.price, p.purpose, p.bedrooms, p.bathrooms, p.city, p.status,
              (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM properties p
       WHERE p.is_featured = 1 AND p.is_approved = 1 AND p.status = 'available'
       ORDER BY p.views_count DESC LIMIT 6`
    );

    const popularProperties = await query(
      `SELECT p.property_id, p.title, p.price, p.purpose, p.bedrooms, p.bathrooms, p.city, p.status,
              (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM properties p
       WHERE p.is_approved = 1 AND p.status = 'available'
       ORDER BY p.views_count DESC LIMIT 6`
    );

    const propertyStats = await queryOne(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
         SUM(CASE WHEN purpose = 'sale' THEN 1 ELSE 0 END) as for_sale,
         SUM(CASE WHEN purpose = 'rent' THEN 1 ELSE 0 END) as for_rent
       FROM properties WHERE is_approved = 1`
    );

    const agentCount = await queryOne('SELECT COUNT(*) as count FROM agents WHERE is_verified = 1');

    const { accessToken, refreshToken } = generateTokens(userId);

    await update('UPDATE users SET refresh_token = ? WHERE user_id = ?', [refreshToken, userId]);

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, first_name).catch(() => {});
    emailService.sendVerificationEmail(email, first_name, verificationToken).catch(() => {});

    logger.info(`New user registered and enrolled: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Welcome to Lil Mosey Estate 6G Edition!',
      data: {
        user: {
          id: userId,
          first_name,
          last_name,
          email,
          phone,
          role: 'customer'
        },
        accessToken,
        refreshToken,
        onboarding: {
          welcome_message: `Welcome ${first_name}! Your account is set up and ready to go.`,
          tips: [
            'Browse our featured properties to get started',
            'Save properties to your favorites for easy access',
            'Book a viewing to see properties in person',
            'Use the mortgage calculator to plan your budget'
          ]
        },
        recommendations: {
          featured: featuredProperties,
          popular: popularProperties
        },
        market_snapshot: {
          total_properties: propertyStats ? propertyStats.total : 0,
          available: propertyStats ? propertyStats.available : 0,
          for_sale: propertyStats ? propertyStats.for_sale : 0,
          for_rent: propertyStats ? propertyStats.for_rent : 0,
          verified_agents: agentCount ? agentCount.count : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, remember_me } = req.body;

    const user = await queryOne(
      'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?',
      [email]
    );

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.is_active) {
      return next(new AppError('Account has been deactivated. Contact support.', 403));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user.user_id);

    const refreshExpiry = remember_me ? '30d' : '7d';
    const actualRefreshToken = jwt.sign({ userId: user.user_id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: refreshExpiry
    });

    await update('UPDATE users SET refresh_token = ?, last_login = NOW() WHERE user_id = ?',
      [actualRefreshToken, user.user_id]);

    await emailService.sendLoginNotification(user.email, user.first_name);

    logger.info(`User logged in: ${email}`);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    };

    res.cookie('token', accessToken, cookieOptions);

    // Fetch personalized data for the returning user
    let smartData = {};

    if (user.role_name === 'customer') {
      const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [user.user_id]);
      if (customer) {
        const unreadNotifications = await queryOne(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
          [user.user_id]
        );
        const unreadMessages = await queryOne(
          'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
          [user.user_id]
        );
        const favoriteCount = await queryOne(
          'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
          [user.user_id]
        );
        const activeBookings = await queryOne(
          "SELECT COUNT(*) as count FROM bookings WHERE customer_id = ? AND status IN ('pending', 'confirmed')",
          [customer.customer_id]
        );
        const recentProperties = await query(
          `SELECT p.property_id, p.title, p.price, p.city, p.status,
                  (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
           FROM properties p WHERE p.is_approved = 1 AND p.status = 'available'
           ORDER BY p.created_at DESC LIMIT 4`
        );

        smartData = {
          notifications: unreadNotifications.count,
          messages: unreadMessages.count,
          favorites: favoriteCount.count,
          active_bookings: activeBookings.count,
          recent_listings: recentProperties
        };
      }
    }

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role_name
        },
        accessToken,
        refreshToken: actualRefreshToken,
        smart_data: smartData
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await update('UPDATE users SET refresh_token = NULL WHERE user_id = ?', [req.user.user_id]);
    res.clearCookie('token');

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token required', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await queryOne(
      'SELECT user_id FROM users WHERE user_id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken]
    );

    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const tokens = generateTokens(user.user_id);

    await update('UPDATE users SET refresh_token = ? WHERE user_id = ?', [tokens.refreshToken, user.user_id]);

    res.json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await queryOne('SELECT user_id, first_name FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.json({
        status: 'success',
        message: 'If an account exists, a reset email has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = new Date(Date.now() + 60 * 60 * 1000);

    await update(
      'UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE user_id = ?',
      [resetToken, resetExpire, user.user_id]
    );

    await emailService.sendPasswordResetEmail(email, user.first_name, resetToken);

    res.json({
      status: 'success',
      message: 'If an account exists, a reset email has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await queryOne(
      'SELECT user_id FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW()',
      [token]
    );

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await update(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expire = NULL WHERE user_id = ?',
      [passwordHash, user.user_id]
    );

    res.json({
      status: 'success',
      message: 'Password reset successful. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await queryOne('SELECT password_hash FROM users WHERE user_id = ?', [req.user.user_id]);

    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Current password is incorrect', 400));
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(new_password, salt);

    await update('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, req.user.user_id]);

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await queryOne('SELECT user_id FROM users WHERE verification_token = ?', [token]);

    if (!user) {
      return next(new AppError('Invalid verification token', 400));
    }

    await update(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE user_id = ?',
      [user.user_id]
    );

    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await queryOne(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.is_verified, u.created_at, u.last_login,
              r.role_name as role
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    // Gather smart data based on role
    let smartData = {};

    if (user.role === 'customer') {
      const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [user.user_id]);
      if (customer) {
        const unreadNotifications = await queryOne(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
          [user.user_id]
        );
        const unreadMessages = await queryOne(
          'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
          [user.user_id]
        );
        const favoriteCount = await queryOne(
          'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
          [user.user_id]
        );
        const activeBookings = await queryOne(
          "SELECT COUNT(*) as count FROM bookings WHERE customer_id = ? AND status IN ('pending', 'confirmed')",
          [customer.customer_id]
        );
        const daysActive = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));

        smartData = {
          notifications: unreadNotifications.count,
          messages: unreadMessages.count,
          favorites: favoriteCount.count,
          active_bookings: activeBookings.count,
          days_active: daysActive
        };
      }
    } else if (user.role === 'agent') {
      const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [user.user_id]);
      if (agent) {
        const propertyCount = await queryOne(
          'SELECT COUNT(*) as count FROM properties WHERE agent_id = ?',
          [agent.agent_id]
        );
        const pendingBookings = await queryOne(
          "SELECT COUNT(*) as count FROM bookings WHERE agent_id = ? AND status = 'pending'",
          [agent.agent_id]
        );
        smartData = {
          total_properties: propertyCount.count,
          pending_bookings: pendingBookings.count
        };
      }
    }

    res.json({
      status: 'success',
      data: { user, smart_data: smartData }
    });
  } catch (error) {
    next(error);
  }
};
