const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

exports.createRequest = async (req, res, next) => {
  try {
    const { property_id, title, description, priority, estimated_cost, scheduled_date } = req.body;

    const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);
    if (!customer) {
      return next(new AppError('Customer profile not found', 400));
    }

    const property = await queryOne('SELECT agent_id FROM properties WHERE property_id = ?', [property_id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    const result = await insert(
      `INSERT INTO maintenance_requests (property_id, customer_id, agent_id, title, description, priority, estimated_cost, scheduled_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [property_id, customer.customer_id, property.agent_id, title, description, priority || 'medium', estimated_cost, scheduled_date]
    );

    res.status(201).json({
      status: 'success',
      message: 'Maintenance request created',
      data: { request_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);
    if (!customer) {
      return next(new AppError('Customer profile not found', 400));
    }

    const requests = await query(`
      SELECT mr.*, p.title as property_title, p.address as property_address,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.property_id
      JOIN agents a ON mr.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE mr.customer_id = ?
      ORDER BY mr.created_at DESC
    `, [customer.customer_id]);

    res.json({ status: 'success', data: { requests } });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, actual_cost } = req.body;

    const request = await queryOne(`
      SELECT mr.*, p.agent_id
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.property_id
      WHERE mr.request_id = ?
    `, [req.params.id]);

    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    if (req.user.role === 'agent') {
      if (request.agent_id !== req.user.user_id) {
        const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
        if (!agent || request.agent_id !== agent.agent_id) {
          return next(new AppError('You can only manage requests for your own properties', 403));
        }
      }
    }

    let sql = 'UPDATE maintenance_requests SET status = ?';
    const params = [status];

    if (status === 'completed') {
      sql += ', completed_date = NOW()';
    }

    if (actual_cost) {
      sql += ', actual_cost = ?';
      params.push(actual_cost);
    }

    sql += ' WHERE request_id = ?';
    params.push(req.params.id);

    await update(sql, params);

    res.json({ status: 'success', message: 'Request status updated' });
  } catch (error) {
    next(error);
  }
};

exports.getAllRequests = async (req, res, next) => {
  try {
    let whereClause = '';
    const params = [];

    if (req.user.role === 'agent') {
      const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
      if (agent) {
        whereClause = ' WHERE mr.agent_id = ?';
        params.push(agent.agent_id);
      }
    }

    const requests = await query(`
      SELECT mr.*, p.title as property_title,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.property_id
      JOIN customers cust ON mr.customer_id = cust.customer_id
      JOIN users c ON cust.user_id = c.user_id
      JOIN agents a ON mr.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      ${whereClause}
      ORDER BY mr.created_at DESC
    `, params);

    res.json({ status: 'success', data: { requests } });
  } catch (error) {
    next(error);
  }
};
