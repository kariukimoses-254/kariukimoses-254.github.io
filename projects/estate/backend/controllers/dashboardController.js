const { query, queryOne } = require('../config/database');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProperties = await queryOne('SELECT COUNT(*) as count FROM properties WHERE is_approved = 1');
    const totalBookings = await queryOne('SELECT COUNT(*) as count FROM bookings');
    const totalRevenue = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
    );

    res.json({
      status: 'success',
      data: {
        stats: {
          total_properties: totalProperties.count,
          total_bookings: totalBookings.count,
          total_revenue: totalRevenue.total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
