const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

exports.getAgentProfile = async (req, res, next) => {
  try {
    const agent = await queryOne(`
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.avatar
      FROM agents a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.agent_id = ?
    `, [req.params.id]);

    if (!agent) {
      return next(new AppError('Agent not found', 404));
    }

    const properties = await query(`
      SELECT p.*, pt.type_name,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      WHERE p.agent_id = ? AND p.is_approved = 1
      ORDER BY p.created_at DESC
    `, [req.params.id]);

    const reviews = await query(`
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.agent_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [req.params.id]);

    res.json({
      status: 'success',
      data: {
        agent: { ...agent, properties, reviews }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAgents = async (req, res, next) => {
  try {
    const agents = await query(`
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.avatar,
             (SELECT COUNT(*) FROM properties WHERE agent_id = a.agent_id AND is_approved = 1) as total_properties
      FROM agents a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.is_verified = 1
      ORDER BY a.is_featured DESC, a.rating DESC
    `);

    res.json({
      status: 'success',
      data: { agents }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgentProperties = async (req, res, next) => {
  try {
    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const properties = await query(`
      SELECT p.*, pt.type_name, pc.category_name,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM favorites WHERE property_id = p.property_id) as favorite_count,
             (SELECT COUNT(*) FROM bookings WHERE property_id = p.property_id) as booking_count
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      WHERE p.agent_id = ?
      ORDER BY p.created_at DESC
    `, [agent.agent_id]);

    res.json({
      status: 'success',
      data: { properties }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgentBookings = async (req, res, next) => {
  try {
    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const bookings = await query(`
      SELECT b.*, p.title as property_title, p.address as property_address,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email, c.phone as customer_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN customers cust ON b.customer_id = cust.customer_id
      JOIN users c ON cust.user_id = c.user_id
      WHERE b.agent_id = ?
      ORDER BY b.booking_date DESC
    `, [agent.agent_id]);

    res.json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgentSales = async (req, res, next) => {
  try {
    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const sales = await query(`
      SELECT p.*, pt.type_name,
             pay.amount, pay.payment_method, pay.paid_at, pay.status as payment_status
      FROM payments pay
      JOIN properties p ON pay.property_id = p.property_id
      JOIN property_types pt ON p.type_id = pt.type_id
      WHERE p.agent_id = ? AND pay.status = 'completed'
      ORDER BY pay.paid_at DESC
    `, [agent.agent_id]);

    const totalCommission = await queryOne(`
      SELECT COALESCE(SUM(pay.amount * a.commission_rate / 100), 0) as total
      FROM payments pay
      JOIN properties p ON pay.property_id = p.property_id
      JOIN agents a ON p.agent_id = a.agent_id
      WHERE p.agent_id = ? AND pay.status = 'completed'
    `, [agent.agent_id]);

    res.json({
      status: 'success',
      data: {
        sales,
        total_commission: totalCommission.total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAgentProfile = async (req, res, next) => {
  try {
    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const { bio, specialization, agency_name, office_address, working_hours } = req.body;

    await update(
      'UPDATE agents SET bio = ?, specialization = ?, agency_name = ?, office_address = ?, working_hours = ? WHERE agent_id = ?',
      [bio, specialization, agency_name, office_address, working_hours, agent.agent_id]
    );

    res.json({ status: 'success', message: 'Agent profile updated' });
  } catch (error) {
    next(error);
  }
};

exports.scheduleVisit = async (req, res, next) => {
  try {
    const { property_id, customer_id, appointment_date, appointment_time, duration_minutes, meeting_type, notes } = req.body;

    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const result = await insert(
      `INSERT INTO appointments (property_id, customer_id, agent_id, appointment_date, appointment_time,
       duration_minutes, meeting_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [property_id, customer_id, agent.agent_id, appointment_date, appointment_time,
       duration_minutes || 30, meeting_type || 'in_person', notes]
    );

    res.status(201).json({
      status: 'success',
      message: 'Visit scheduled successfully',
      data: { appointment_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};
