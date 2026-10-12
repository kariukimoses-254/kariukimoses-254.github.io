const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const result = await insert(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, subject, message]
    );

    await emailService.sendContactFormEmail(name, email, subject, message);

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent. We will get back to you shortly.',
      data: { contact_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await queryOne(
      'SELECT contact_id FROM contact_messages WHERE email = ? AND subject = ?',
      [email, 'Newsletter Subscription']
    );

    if (existing) {
      return res.json({ status: 'success', message: 'You are already subscribed to our newsletter.' });
    }

    await insert(
      'INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES (?, ?, ?, ?, 1)',
      [email, email, 'Newsletter Subscription', 'Newsletter subscription request via footer form.']
    );

    res.status(201).json({
      status: 'success',
      message: 'Subscribed successfully!'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );

    const unreadCount = await queryOne(
      'SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0'
    );

    res.json({
      status: 'success',
      data: {
        messages,
        unread_count: unreadCount.count
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await update('UPDATE contact_messages SET is_read = 1 WHERE contact_id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.replyToMessage = async (req, res, next) => {
  try {
    const { admin_reply } = req.body;

    const message = await queryOne('SELECT * FROM contact_messages WHERE contact_id = ?', [req.params.id]);
    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    await update(
      'UPDATE contact_messages SET admin_reply = ?, is_replied = 1 WHERE contact_id = ?',
      [admin_reply, req.params.id]
    );

    await emailService.sendContactReplyEmail(message.email, message.name, message.subject, admin_reply);

    res.json({ status: 'success', message: 'Reply sent successfully' });
  } catch (error) {
    next(error);
  }
};
