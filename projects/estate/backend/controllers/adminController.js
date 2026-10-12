const { query, queryOne, insert, update, remove } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await queryOne('SELECT COUNT(*) as count FROM users');
    const totalCustomers = await queryOne('SELECT COUNT(*) as count FROM customers');
    const totalAgents = await queryOne('SELECT COUNT(*) as count FROM agents');
    const totalProperties = await queryOne('SELECT COUNT(*) as count FROM properties');
    const soldProperties = await queryOne("SELECT COUNT(*) as count FROM properties WHERE status = 'sold'");
    const rentedProperties = await queryOne("SELECT COUNT(*) as count FROM properties WHERE status = 'rented'");
    const availableProperties = await queryOne("SELECT COUNT(*) as count FROM properties WHERE status = 'available' AND is_approved = 1");
    const pendingApprovals = await queryOne("SELECT COUNT(*) as count FROM properties WHERE is_approved = 0");
    const totalBookings = await queryOne('SELECT COUNT(*) as count FROM bookings');
    const totalPayments = await queryOne("SELECT COUNT(*) as count FROM payments WHERE status = 'completed'");
    const monthlyRevenue = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND MONTH(paid_at) = MONTH(NOW()) AND YEAR(paid_at) = YEAR(NOW())"
    );
    const totalRevenue = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
    );
    const totalViews = await queryOne('SELECT COALESCE(SUM(views_count), 0) as total FROM properties');
    const unreadMessages = await queryOne('SELECT COUNT(*) as count FROM messages WHERE is_read = 0');
    const pendingReviews = await queryOne('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 0');

    const monthlyRevenueChart = await query(`
      SELECT DATE_FORMAT(paid_at, '%Y-%m') as month,
             COALESCE(SUM(amount), 0) as revenue,
             COUNT(*) as transactions
      FROM payments
      WHERE status = 'completed' AND paid_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month
    `);

    const propertiesByType = await query(`
      SELECT pt.type_name, COUNT(p.property_id) as count
      FROM property_types pt
      LEFT JOIN properties p ON pt.type_id = p.type_id
      GROUP BY pt.type_name
      ORDER BY count DESC
    `);

    const propertiesByStatus = await query(`
      SELECT status, COUNT(*) as count
      FROM properties
      GROUP BY status
    `);

    const recentActivities = await query(`
      SELECT al.*, u.first_name, u.last_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    const recentBookings = await query(`
      SELECT b.booking_id, b.status, b.amount, b.booking_date, b.created_at,
             p.title as property_title,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN users u ON c.user_id = u.user_id
      ORDER BY b.created_at DESC
      LIMIT 8
    `);

    const topAgents = await query(`
      SELECT a.*, u.first_name, u.last_name, u.avatar,
             COUNT(DISTINCT p.property_id) as total_properties
      FROM agents a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN properties p ON a.agent_id = p.agent_id
      GROUP BY a.agent_id
      ORDER BY a.rating DESC, a.total_sales DESC
      LIMIT 5
    `);

    res.json({
      status: 'success',
      data: {
        stats: {
          total_users: totalUsers.count,
          total_customers: totalCustomers.count,
          total_agents: totalAgents.count,
          total_properties: totalProperties.count,
          sold_properties: soldProperties.count,
          rented_properties: rentedProperties.count,
          available_properties: availableProperties.count,
          pending_approvals: pendingApprovals.count,
          total_bookings: totalBookings.count,
          total_payments: totalPayments.count,
          monthly_revenue: monthlyRevenue.total,
          total_revenue: totalRevenue.total,
          total_views: totalViews.total,
          unread_messages: unreadMessages.count,
          pending_reviews: pendingReviews.count
        },
        charts: {
          monthly_revenue: monthlyRevenueChart,
          properties_by_type: propertiesByType,
          properties_by_status: propertiesByStatus
        },
        recent_activities: recentActivities,
        recent_bookings: recentBookings,
        top_agents: topAgents
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    let sql = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.avatar,
             u.is_verified, u.is_active, u.last_login, u.created_at,
             r.role_name as role
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
    `;
    const params = [];

    if (req.query.role) {
      sql += ' WHERE r.role_name = ?';
      params.push(req.query.role);
    }

    if (req.query.search) {
      sql += req.query.role ? ' AND' : ' WHERE';
      sql += ' (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = await query(sql, params);

    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    await update('UPDATE users SET role_id = ? WHERE user_id = ?', [role_id, req.params.id]);
    res.json({ status: 'success', message: 'User role updated' });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await queryOne('SELECT is_active FROM users WHERE user_id = ?', [req.params.id]);
    const newStatus = user.is_active ? 0 : 1;
    await update('UPDATE users SET is_active = ? WHERE user_id = ?', [newStatus, req.params.id]);
    res.json({ status: 'success', message: `User ${newStatus ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.user_id) {
      return next(new AppError('Cannot delete your own account', 400));
    }
    await remove('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

exports.approveProperty = async (req, res, next) => {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE property_id = ?', [req.params.id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    await update('UPDATE properties SET is_approved = 1 WHERE property_id = ?', [req.params.id]);

    const agent = await queryOne(
      'SELECT u.email, u.first_name FROM agents a JOIN users u ON a.user_id = u.user_id WHERE a.agent_id = ?',
      [property.agent_id]
    );

    if (agent) {
      await emailService.sendPropertyApprovedEmail(agent.email, agent.first_name, property.title);
    }

    logger.info(`Property ${property.property_id} approved by admin`);

    res.json({ status: 'success', message: 'Property approved' });
  } catch (error) {
    next(error);
  }
};

exports.rejectProperty = async (req, res, next) => {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE property_id = ?', [req.params.id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    await remove('DELETE FROM properties WHERE property_id = ?', [req.params.id]);

    res.json({ status: 'success', message: 'Property rejected and removed' });
  } catch (error) {
    next(error);
  }
};

exports.toggleFeaturedProperty = async (req, res, next) => {
  try {
    const property = await queryOne('SELECT is_featured FROM properties WHERE property_id = ?', [req.params.id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    const newStatus = property.is_featured ? 0 : 1;
    await update('UPDATE properties SET is_featured = ? WHERE property_id = ?', [newStatus, req.params.id]);

    res.json({ status: 'success', message: `Property ${newStatus ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    next(error);
  }
};

exports.getPendingProperties = async (req, res, next) => {
  try {
    const properties = await query(`
      SELECT p.*, pt.type_name, pc.category_name,
             u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      JOIN agents a ON p.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE p.is_approved = 0
      ORDER BY p.created_at DESC
    `);

    res.json({
      status: 'success',
      data: { properties }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemSettings = async (req, res, next) => {
  try {
    const settings = await query('SELECT * FROM system_settings ORDER BY setting_key');
    res.json({ status: 'success', data: { settings } });
  } catch (error) {
    next(error);
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await update(
        'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
        [String(value), key]
      );
    }

    res.json({ status: 'success', message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
};

exports.getEmailTemplates = async (req, res, next) => {
  try {
    const templates = await query('SELECT * FROM email_templates ORDER BY template_name');
    res.json({ status: 'success', data: { templates } });
  } catch (error) {
    next(error);
  }
};

exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await query(`
      SELECT al.*, u.first_name, u.last_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.json({ status: 'success', data: { logs } });
  } catch (error) {
    next(error);
  }
};
