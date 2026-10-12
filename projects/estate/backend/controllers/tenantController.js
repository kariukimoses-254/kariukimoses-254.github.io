const { query, queryOne, insert, update, remove, transaction } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const { generateRentPaymentQR } = require('../utils/qrHelper');
const logger = require('../utils/logger');

// ===== TENANT PROFILE =====

exports.getMyTenantProfile = async (req, res, next) => {
  try {
    const tenant = await queryOne(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.avatar
      FROM tenants t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.user_id = ?
    `, [req.user.user_id]);

    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    res.json({ status: 'success', data: { tenant } });
  } catch (error) {
    next(error);
  }
};

exports.updateMyTenantProfile = async (req, res, next) => {
  try {
    const { emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            occupation, employer_name, employer_address } = req.body;

    const existing = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!existing) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const fields = {};
    if (emergency_contact_name !== undefined) fields.emergency_contact_name = emergency_contact_name;
    if (emergency_contact_phone !== undefined) fields.emergency_contact_phone = emergency_contact_phone;
    if (emergency_contact_relation !== undefined) fields.emergency_contact_relation = emergency_contact_relation;
    if (occupation !== undefined) fields.occupation = occupation;
    if (employer_name !== undefined) fields.employer_name = employer_name;
    if (employer_address !== undefined) fields.employer_address = employer_address;

    const keys = Object.keys(fields);
    if (keys.length === 0) {
      return res.json({ status: 'success', message: 'Profile updated successfully' });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await update(
      `UPDATE tenants SET ${setClause} WHERE user_id = ?`,
      [...keys.map(k => fields[k]), req.user.user_id]
    );

    res.json({ status: 'success', message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ===== LEASES =====

exports.getMyLeases = async (req, res, next) => {
  try {
    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const leases = await query(`
      SELECT l.*,
             p.title as property_title, p.address as property_address, p.city, p.county,
             p.bedrooms, p.bathrooms, p.area_sqft,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
             pt.type_name as property_type,
             u.first_name as agent_first_name, u.last_name as agent_last_name, u.phone as agent_phone, u.email as agent_email
      FROM leases l
      JOIN properties p ON l.property_id = p.property_id
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN agents a ON l.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE l.tenant_id = ?
      ORDER BY l.created_at DESC
    `, [tenant.tenant_id]);

    res.json({ status: 'success', data: { leases } });
  } catch (error) {
    next(error);
  }
};

exports.getMyActiveLease = async (req, res, next) => {
  try {
    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const lease = await queryOne(`
      SELECT l.*,
             p.title as property_title, p.address as property_address, p.city, p.county,
             p.bedrooms, p.bathrooms, p.area_sqft,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image,
             pt.type_name as property_type,
             u.first_name as agent_first_name, u.last_name as agent_last_name, u.phone as agent_phone, u.email as agent_email
      FROM leases l
      JOIN properties p ON l.property_id = p.property_id
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN agents a ON l.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE l.tenant_id = ? AND l.status = 'active'
      LIMIT 1
    `, [tenant.tenant_id]);

    if (!lease) {
      return res.json({ status: 'success', data: { lease: null } });
    }

    // Get lease documents count
    const documentCount = await queryOne(
      'SELECT COUNT(*) as count FROM lease_documents WHERE lease_id = ?',
      [lease.lease_id]
    );
    lease.document_count = documentCount.count;

    // Get rent payment history
    const recentPayments = await query(`
      SELECT * FROM rent_payments
      WHERE lease_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `, [lease.lease_id]);
    lease.recent_payments = recentPayments;

    res.json({ status: 'success', data: { lease } });
  } catch (error) {
    next(error);
  }
};

// ===== RENT PAYMENTS =====

exports.getMyRentPayments = async (req, res, next) => {
  try {
    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const payments = await query(`
      SELECT rp.*, l.rent_amount, p.title as property_title, p.address as property_address
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      WHERE rp.tenant_id = ?
      ORDER BY rp.created_at DESC
    `, [tenant.tenant_id]);

    res.json({ status: 'success', data: { payments } });
  } catch (error) {
    next(error);
  }
};

exports.createRentPayment = async (req, res, next) => {
  try {
    const { lease_id, amount, payment_method, payment_month } = req.body;

    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const lease = await queryOne(
      "SELECT * FROM leases WHERE lease_id = ? AND tenant_id = ? AND status = 'active'",
      [lease_id, tenant.tenant_id]
    );
    if (!lease) {
      return next(new AppError('Active lease not found', 404));
    }

    const receiptNumber = `RENT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const transactionId = `${payment_method.toUpperCase()}-RENT-${Date.now()}`;

    const result = await insert(
      `INSERT INTO rent_payments (lease_id, tenant_id, amount, payment_method, transaction_id,
       status, due_date, payment_month, receipt_number, paid_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW())`,
      [lease_id, tenant.tenant_id, amount, payment_method, transactionId,
       lease.due_day ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(lease.due_day).padStart(2, '0')}` : null,
       payment_month, receiptNumber]
    );

    logger.info(`Rent payment initiated: ${receiptNumber}`);

    let qrData = null;
    try {
      qrData = await generateRentPaymentQR(result.insertId);
    } catch (qrErr) {
      logger.error('Failed to auto-generate rent payment QR:', qrErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Rent payment initiated',
      data: {
        rent_payment_id: result.insertId,
        receipt_number: receiptNumber,
        transaction_id: transactionId,
        amount,
        payment_method,
        qr: qrData ? {
          qr_code: qrData.qr_code,
          payment_url: qrData.payment_url,
          token: qrData.token,
          amount: qrData.amount,
          payment_month: qrData.payment_month,
          expires_at: qrData.expires_at
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== LEASE DOCUMENTS =====

exports.getMyDocuments = async (req, res, next) => {
  try {
    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    const documents = await query(`
      SELECT ld.*, l.property_id, p.title as property_title
      FROM lease_documents ld
      JOIN leases l ON ld.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      WHERE ld.tenant_id = ?
      ORDER BY ld.created_at DESC
    `, [tenant.tenant_id]);

    res.json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};

// ===== TENANT DASHBOARD =====

exports.getTenantDashboard = async (req, res, next) => {
  try {
    const tenant = await queryOne('SELECT tenant_id FROM tenants WHERE user_id = ?', [req.user.user_id]);
    if (!tenant) {
      return next(new AppError('Tenant profile not found', 404));
    }

    // Active lease
    const activeLease = await queryOne(`
      SELECT l.*, p.title as property_title, p.address as property_address,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as property_image
      FROM leases l
      JOIN properties p ON l.property_id = p.property_id
      WHERE l.tenant_id = ? AND l.status = 'active'
      LIMIT 1
    `, [tenant.tenant_id]);

    // Lease count
    const leaseCount = await queryOne(
      'SELECT COUNT(*) as count FROM leases WHERE tenant_id = ?',
      [tenant.tenant_id]
    );

    // Total rent paid
    const totalRentPaid = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM rent_payments WHERE tenant_id = ? AND status = 'completed'",
      [tenant.tenant_id]
    );

    // Upcoming payment
    const upcomingPayment = await queryOne(`
      SELECT rp.*, l.rent_amount, p.title as property_title
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      WHERE rp.tenant_id = ? AND rp.status = 'pending'
      ORDER BY rp.due_date ASC
      LIMIT 1
    `, [tenant.tenant_id]);

    // Recent payments
    const recentPayments = await query(`
      SELECT rp.*, p.title as property_title
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      WHERE rp.tenant_id = ?
      ORDER BY rp.created_at DESC
      LIMIT 5
    `, [tenant.tenant_id]);

    // Document count
    const documentCount = await queryOne(
      'SELECT COUNT(*) as count FROM lease_documents WHERE tenant_id = ?',
      [tenant.tenant_id]
    );

    // Maintenance requests count
    const maintenanceCount = await queryOne(
      'SELECT COUNT(*) as count FROM maintenance_requests mr JOIN customers c ON mr.customer_id = c.customer_id WHERE c.user_id = ?',
      [req.user.user_id]
    );

    // Unread notifications
    const unreadNotifications = await queryOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.user_id]
    );

    res.json({
      status: 'success',
      data: {
        active_lease: activeLease,
        stats: {
          total_leases: leaseCount.count,
          total_rent_paid: totalRentPaid.total,
          pending_payment: upcomingPayment,
          documents: documentCount.count,
          maintenance_requests: maintenanceCount.count,
          unread_notifications: unreadNotifications.count
        },
        recent_payments: recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== ADMIN TENANT MANAGEMENT =====

exports.getAllTenants = async (req, res, next) => {
  try {
    const tenants = await query(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active,
             (SELECT COUNT(*) FROM leases WHERE tenant_id = t.tenant_id) as total_leases,
             (SELECT COUNT(*) FROM leases WHERE tenant_id = t.tenant_id AND status = 'active') as active_leases
      FROM tenants t
      JOIN users u ON t.user_id = u.user_id
      ORDER BY t.created_at DESC
    `);

    res.json({ status: 'success', data: { tenants } });
  } catch (error) {
    next(error);
  }
};

exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await queryOne(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.is_active
      FROM tenants t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.tenant_id = ?
    `, [req.params.id]);

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    const leases = await query(`
      SELECT l.*, p.title as property_title
      FROM leases l
      JOIN properties p ON l.property_id = p.property_id
      WHERE l.tenant_id = ?
      ORDER BY l.created_at DESC
    `, [req.params.id]);

    res.json({ status: 'success', data: { tenant, leases } });
  } catch (error) {
    next(error);
  }
};

exports.getAllLeases = async (req, res, next) => {
  try {
    const leases = await query(`
      SELECT l.*, p.title as property_title, p.address,
             u.first_name as tenant_first_name, u.last_name as tenant_last_name, u.email as tenant_email, u.phone as tenant_phone,
             ag.first_name as agent_first_name, ag.last_name as agent_last_name
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      JOIN properties p ON l.property_id = p.property_id
      JOIN agents a ON l.agent_id = a.agent_id
      JOIN users ag ON a.user_id = ag.user_id
      ORDER BY l.created_at DESC
    `);

    res.json({ status: 'success', data: { leases } });
  } catch (error) {
    next(error);
  }
};

exports.createLease = async (req, res, next) => {
  try {
    const {
      tenant_id, property_id, agent_id, lease_type, start_date, end_date,
      rent_amount, deposit_amount, payment_frequency, due_day, late_fee,
      terms_and_conditions
    } = req.body;

    const leaseId = await transaction(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO leases (tenant_id, property_id, agent_id, lease_type, start_date, end_date,
         rent_amount, deposit_amount, payment_frequency, due_day, late_fee, terms_and_conditions, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [tenant_id, property_id, agent_id, lease_type || 'residential', start_date, end_date,
         rent_amount, deposit_amount || 0, payment_frequency || 'monthly', due_day || 1, late_fee || 0,
         terms_and_conditions || null]
      );

      await conn.execute("UPDATE properties SET status = 'rented' WHERE property_id = ?", [property_id]);

      return result.insertId;
    });

    logger.info(`New lease created: ${leaseId}`);

    res.status(201).json({
      status: 'success',
      message: 'Lease created successfully',
      data: { lease_id: leaseId }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const lease = await queryOne('SELECT * FROM leases WHERE lease_id = ?', [req.params.id]);
    if (!lease) {
      return next(new AppError('Lease not found', 404));
    }

    await transaction(async (conn) => {
      await conn.execute('UPDATE leases SET status = ? WHERE lease_id = ?', [status, req.params.id]);

      if (status === 'terminated' || status === 'expired') {
        await conn.execute("UPDATE properties SET status = 'available' WHERE property_id = ?", [lease.property_id]);
      }
    });

    res.json({ status: 'success', message: `Lease ${status}` });
  } catch (error) {
    next(error);
  }
};

exports.getAllRentPayments = async (req, res, next) => {
  try {
    const payments = await query(`
      SELECT rp.*, l.rent_amount, p.title as property_title,
             u.first_name, u.last_name, u.email
      FROM rent_payments rp
      JOIN leases l ON rp.lease_id = l.lease_id
      JOIN properties p ON l.property_id = p.property_id
      JOIN tenants t ON rp.tenant_id = t.tenant_id
      JOIN users u ON t.user_id = u.user_id
      ORDER BY rp.created_at DESC
    `);

    res.json({ status: 'success', data: { payments } });
  } catch (error) {
    next(error);
  }
};

exports.updateRentPaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await update(
      "UPDATE rent_payments SET status = ?, paid_at = IF(? = 'completed', NOW(), paid_at) WHERE rent_payment_id = ?",
      [status, status, req.params.id]
    );
    res.json({ status: 'success', message: 'Payment status updated' });
  } catch (error) {
    next(error);
  }
};
