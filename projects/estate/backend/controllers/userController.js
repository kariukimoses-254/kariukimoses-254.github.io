const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

function calculateProfileCompleteness(user, profile) {
  let filled = 0;
  let total = 8;

  if (user.first_name) filled++;
  if (user.last_name) filled++;
  if (user.email) filled++;
  if (user.phone) filled++;
  if (user.avatar && user.avatar !== 'default-avatar.png') filled++;
  if (user.is_verified) filled++;
  if (profile && profile.preferred_location) filled++;
  if (profile && profile.budget_max && profile.budget_max > 0) filled++;

  return {
    percentage: Math.round((filled / total) * 100),
    filled,
    total,
    missing: [
      !user.phone && 'phone number',
      (!user.avatar || user.avatar === 'default-avatar.png') && 'profile photo',
      !user.is_verified && 'email verification',
      profile && !profile.preferred_location && 'preferred location',
      profile && (!profile.budget_max || profile.budget_max <= 0) && 'budget range'
    ].filter(Boolean)
  };
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await queryOne(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.is_verified, u.created_at, u.last_login,
             r.role_name as role
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `, [req.user.user_id]);

    let profileData = {};
    let smartInsights = {};

    if (user.role === 'agent') {
      profileData = await queryOne('SELECT * FROM agents WHERE user_id = ?', [req.user.user_id]);
      if (profileData) {
        const agentProperties = await queryOne(
          'SELECT COUNT(*) as count FROM properties WHERE agent_id = ?',
          [profileData.agent_id]
        );
        const agentBookings = await queryOne(
          'SELECT COUNT(*) as count FROM bookings WHERE agent_id = ?',
          [profileData.agent_id]
        );
        smartInsights = {
          total_properties: agentProperties.count,
          total_bookings: agentBookings.count,
          rating: profileData.rating,
          commission_rate: profileData.commission_rate
        };
      }
    } else if (user.role === 'customer') {
      profileData = await queryOne('SELECT * FROM customers WHERE user_id = ?', [req.user.user_id]);
      if (profileData) {
        const favoriteCount = await queryOne(
          'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
          [req.user.user_id]
        );
        const bookingCount = await queryOne(
          'SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?',
          [profileData.customer_id]
        );
        const totalSpent = await queryOne(
          "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = ? AND status = 'completed'",
          [req.user.user_id]
        );
        const daysActive = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
        const completeness = calculateProfileCompleteness(user, profileData);

        smartInsights = {
          favorites: favoriteCount.count,
          total_bookings: bookingCount.count,
          total_spent: totalSpent.total,
          days_active: daysActive,
          profile_completeness: completeness,
          member_since: user.created_at,
          last_login: user.last_login
        };
      }
    } else if (user.role === 'tenant') {
      const tenant = await queryOne('SELECT * FROM tenants WHERE user_id = ?', [req.user.user_id]);
      if (tenant) {
        profileData = tenant;
        const activeLease = await queryOne(
          "SELECT * FROM leases WHERE tenant_id = ? AND status = 'active' LIMIT 1",
          [tenant.tenant_id]
        );
        const totalPaid = await queryOne(
          "SELECT COALESCE(SUM(amount), 0) as total FROM rent_payments WHERE tenant_id = ? AND status = 'completed'",
          [tenant.tenant_id]
        );
        smartInsights = {
          active_lease: activeLease,
          total_rent_paid: totalPaid.total,
          is_active: tenant.is_active
        };
      }
    }

    res.json({
      status: 'success',
      data: {
        user: { ...user, profile: profileData },
        smart_insights: smartInsights
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;

    await update(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE user_id = ?',
      [first_name, last_name, phone, req.user.user_id]
    );

    res.json({
      status: 'success',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    await update(
      'UPDATE users SET avatar = ? WHERE user_id = ?',
      [req.file.filename, req.user.user_id]
    );

    res.json({
      status: 'success',
      message: 'Avatar updated successfully',
      data: { avatar: req.file.filename }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerDashboard = async (req, res, next) => {
  try {
    const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);

    if (!customer) {
      return next(new AppError('Customer profile not found. Please register as a customer first.', 400));
    }

    const totalBookings = await queryOne(
      'SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?',
      [customer.customer_id]
    );

    const activeBookings = await queryOne(
      "SELECT COUNT(*) as count FROM bookings WHERE customer_id = ? AND status IN ('pending', 'confirmed')",
      [customer.customer_id]
    );

    const totalPayments = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = ? AND status = 'completed'",
      [req.user.user_id]
    );

    const favoriteCount = await queryOne(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
      [req.user.user_id]
    );

    const recentBookings = await query(`
      SELECT b.*, p.title as property_title,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [customer.customer_id]);

    const recentPayments = await query(`
      SELECT pay.*, p.title as property_title
      FROM payments pay
      LEFT JOIN properties p ON pay.property_id = p.property_id
      WHERE pay.user_id = ?
      ORDER BY pay.created_at DESC
      LIMIT 5
    `, [req.user.user_id]);

    // Smart recommendations for the customer
    const recommendations = await query(`
      SELECT p.property_id, p.title, p.price, p.purpose, p.bedrooms, p.bathrooms, p.city,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM properties p
      WHERE p.is_approved = 1 AND p.status = 'available'
      ORDER BY p.views_count DESC, p.created_at DESC
      LIMIT 4
    `);

    res.json({
      status: 'success',
      data: {
        stats: {
          total_bookings: totalBookings.count,
          active_bookings: activeBookings.count,
          total_payments: totalPayments.total,
          favorites: favoriteCount.count
        },
        recent_bookings: recentBookings,
        recent_payments: recentPayments,
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};
