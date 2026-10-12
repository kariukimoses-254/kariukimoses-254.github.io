const { query, queryOne, insert, update, remove, transaction } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const { generateBookingQR } = require('../utils/qrHelper');
const logger = require('../utils/logger');

exports.createBooking = async (req, res, next) => {
  try {
    const { property_id, booking_date, booking_time, notes } = req.body;

    const property = await queryOne('SELECT * FROM properties WHERE property_id = ? AND is_approved = 1', [property_id]);
    if (!property) {
      return next(new AppError('Property not found or not approved', 404));
    }

    const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);
    if (!customer) {
      return next(new AppError('Customer profile not found', 400));
    }

    // First-Come-First-Served: check if ANY customer has an active booking for this property
    const existingBooking = await queryOne(
      `SELECT b.booking_id, b.customer_id, b.booking_date, b.booking_time, b.created_at,
              c.user_id as booker_user_id,
              u.first_name as booker_first_name, u.last_name as booker_last_name
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN users u ON c.user_id = u.user_id
       WHERE b.property_id = ? AND b.status IN ('pending', 'confirmed')
       ORDER BY b.created_at ASC
       LIMIT 1`,
      [property_id]
    );

    if (existingBooking) {
      const isSameUser = existingBooking.booker_user_id === req.user.user_id;

      if (isSameUser) {
        return next(new AppError('You already have an active booking for this property', 400));
      }

      // Property already booked by someone else â€” first-come-first-served
      const bookedDate = new Date(existingBooking.created_at).toLocaleDateString('en-KE', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      // Notify the property agent that someone else tried to book
      const agentUser = await queryOne(
        'SELECT u.email, u.first_name FROM agents a JOIN users u ON a.user_id = u.user_id WHERE a.agent_id = ?',
        [property.agent_id]
      );

      return res.status(409).json({
        status: 'error',
        code: 'ALREADY_BOOKED',
        message: `This property has already been booked by another customer on ${bookedDate}. Bookings operate on a first-come, first-served basis. Please browse other available properties or contact the agent for alternatives.`,
        data: {
          property_id: property.property_id,
          property_title: property.title,
          booked_on: existingBooking.created_at,
          booking_date: existingBooking.booking_date,
          agent: agentUser ? {
            name: `${agentUser.first_name}`,
            email: agentUser.email
          } : null,
          suggestion: 'Browse similar properties or contact the agent for alternatives.'
        }
      });
    }

    // No active booking â€” create the booking (first come, first served)
    const bookingId = await transaction(async (conn) => {
      const [result] = await conn.execute(
        'INSERT INTO bookings (property_id, customer_id, agent_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [property_id, customer.customer_id, property.agent_id, booking_date, booking_time, notes]
      );
      return result.insertId;
    });

    // Get agent info for notification
    const agentUser = await queryOne(
      'SELECT u.email, u.first_name FROM agents a JOIN users u ON a.user_id = u.user_id WHERE a.agent_id = ?',
      [property.agent_id]
    );

    // Send notification to agent
    if (agentUser) {
      await emailService.sendBookingNotification(agentUser.email, agentUser.first_name, property.title, booking_date, booking_time);
    }

    // Create congratulations notification for the customer
    await insert(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'success', ?)`,
      [
        req.user.user_id,
        'Congratulations! Booking Confirmed',
        `You are the first to book "${property.title}"! Your viewing is scheduled for ${booking_date} at ${booking_time}. Our agent will confirm shortly.`,
        `/appointments`
      ]
    );

    // Create congratulations system message
    const congratsMessage = `Congratulations, ${req.user.first_name}! ðŸŽ‰ You were the first to book "${property.title}". Your viewing is scheduled for ${booking_date} at ${booking_time}. Here is what happens next: 1) The agent will review and confirm your booking, 2) You will receive a confirmation notification, 3) Attend your viewing at the scheduled time. Thank you for choosing Lil Mosey Estate 6G Edition!`;
    await insert(
      'INSERT INTO messages (sender_id, receiver_id, subject, message, is_read) VALUES (1, ?, ?, ?, 0)',
      [req.user.user_id, 'Booking Confirmed â€” You Were First!', congratsMessage]
    );

    // Log the activity
    await insert(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES (?, 'book_property', 'property', ?, ?, ?)`,
      [req.user.user_id, property_id, JSON.stringify({ property_id, booking_date, booking_time }), req.ip]
    );

    logger.info(`First-come booking created: property ${property_id} by user ${req.user.user_id}`);

    let qrData = null;
    try {
      qrData = await generateBookingQR(bookingId);
    } catch (qrErr) {
      logger.error('Failed to auto-generate booking QR:', qrErr.message);
    }

    res.status(201).json({
      status: 'success',
      code: 'BOOKING_SUCCESS',
      message: `Congratulations! You were the first to book "${property.title}". Your viewing is scheduled for ${booking_date} at ${booking_time}. The agent will confirm shortly.`,
      data: {
        booking_id: bookingId,
        property: {
          id: property.property_id,
          title: property.title,
          address: property.address,
          city: property.city
        },
        booking: {
          date: booking_date,
          time: booking_time,
          status: 'pending'
        },
        qr: qrData ? {
          qr_code: qrData.qr_code,
          payment_url: qrData.payment_url,
          token: qrData.token,
          amount: qrData.amount,
          expires_at: qrData.expires_at
        } : null,
        agent: agentUser ? {
          name: agentUser.first_name,
          email: agentUser.email
        } : null,
        next_steps: [
          'The agent will review your booking request',
          'You will receive a confirmation notification',
          'Attend your viewing at the scheduled time'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await query(`
      SELECT b.*, p.title as property_title, p.address as property_address,
             c.user_id as customer_user_id,
             cu.first_name as customer_first_name, cu.last_name as customer_last_name, cu.email as customer_email,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN users cu ON c.user_id = cu.user_id
      LEFT JOIN agents a ON b.agent_id = a.agent_id
      LEFT JOIN users u ON a.user_id = u.user_id
      ORDER BY b.created_at DESC
    `);

    res.json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const customer = await queryOne('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);
    if (!customer) {
      return next(new AppError('Customer profile not found', 400));
    }

    const bookings = await query(`
      SELECT b.*, p.title as property_title, p.address as property_address, p.price,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
             u.first_name as agent_first_name, u.last_name as agent_last_name, u.phone as agent_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN agents a ON b.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [customer.customer_id]);

    res.json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellation_reason } = req.body;

    const booking = await queryOne(
      `SELECT b.*, p.agent_id FROM bookings b
       LEFT JOIN properties p ON b.property_id = p.property_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (req.user.role === 'agent' && booking.agent_id !== req.user.user_id) {
      return next(new AppError('You can only manage bookings for your own properties', 403));
    }

    const updateData = { status };
    let sql = 'UPDATE bookings SET status = ?';
    const params = [status];

    if (status === 'cancelled' && cancellation_reason) {
      sql += ', cancellation_reason = ?';
      params.push(cancellation_reason);
    }

    if (status === 'rescheduled') {
      const { rescheduled_date, rescheduled_time } = req.body;
      if (rescheduled_date && rescheduled_time) {
        sql += ', rescheduled_date = ?, rescheduled_time = ?';
        params.push(rescheduled_date, rescheduled_time);
      }
    }

    sql += ' WHERE booking_id = ?';
    params.push(req.params.id);

    await update(sql, params);

    res.json({
      status: 'success',
      message: `Booking ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellation_reason } = req.body;

    const booking = await queryOne(
      `SELECT b.*, p.agent_id FROM bookings b
       LEFT JOIN properties p ON b.property_id = p.property_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    const isCustomer = booking.user_id === req.user.user_id;
    const isAgent = req.user.role === 'agent' && booking.agent_id === req.user.user_id;
    if (!isCustomer && !isAgent && req.user.role !== 'admin') {
      return next(new AppError('You can only cancel your own bookings', 403));
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return next(new AppError(`Cannot cancel a ${booking.status} booking`, 400));
    }

    await update(
      'UPDATE bookings SET status = ?, cancellation_reason = ? WHERE booking_id = ?',
      ['cancelled', cancellation_reason || 'Cancelled by user', req.params.id]
    );

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
