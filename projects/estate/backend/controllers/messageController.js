const { query, queryOne, insert, update } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, property_id, subject, message, parent_message_id } = req.body;

    const result = await insert(
      'INSERT INTO messages (sender_id, receiver_id, property_id, subject, message, parent_message_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.user_id, receiver_id || null, property_id || null, subject, message, parent_message_id || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: { message_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyMessages = async (req, res, next) => {
  try {
    const messages = await query(`
      SELECT m.*,
             sender.first_name as sender_first_name, sender.last_name as sender_last_name, sender.avatar as sender_avatar,
             receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
             p.title as property_title
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      LEFT JOIN users receiver ON m.receiver_id = receiver.user_id
      LEFT JOIN properties p ON m.property_id = p.property_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.user.user_id, req.user.user_id]);

    const unreadCount = await queryOne(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [req.user.user_id]
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

exports.getMessageById = async (req, res, next) => {
  try {
    const message = await queryOne(`
      SELECT m.*,
             sender.first_name as sender_first_name, sender.last_name as sender_last_name, sender.avatar as sender_avatar, sender.email as sender_email,
             receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
             p.title as property_title
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      LEFT JOIN users receiver ON m.receiver_id = receiver.user_id
      LEFT JOIN properties p ON m.property_id = p.property_id
      WHERE m.message_id = ?
    `, [req.params.id]);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    const isParticipant =
      message.sender_id === req.user.user_id ||
      message.receiver_id === req.user.user_id ||
      req.user.role === 'admin';
    if (!isParticipant) {
      return next(new AppError('You do not have access to this message', 403));
    }

    if (message.receiver_id === req.user.user_id && !message.is_read) {
      await update('UPDATE messages SET is_read = 1 WHERE message_id = ?', [req.params.id]);
    }

    const replies = await query(`
      SELECT m.*, sender.first_name as sender_first_name, sender.last_name as sender_last_name, sender.avatar as sender_avatar
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      WHERE m.parent_message_id = ?
      ORDER BY m.created_at ASC
    `, [req.params.id]);

    res.json({
      status: 'success',
      data: {
        message: { ...message, replies }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await update(
      'UPDATE messages SET is_read = 1 WHERE message_id = ? AND receiver_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ status: 'success', message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.getInbox = async (req, res, next) => {
  try {
    const conversations = await query(`
      SELECT m.*,
             sender.first_name as sender_first_name, sender.last_name as sender_last_name, sender.avatar as sender_avatar,
             p.title as property_title,
             (SELECT COUNT(*) FROM messages WHERE parent_message_id = m.message_id) as reply_count
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      LEFT JOIN properties p ON m.property_id = p.property_id
      WHERE m.receiver_id = ? AND m.parent_message_id IS NULL
      ORDER BY m.created_at DESC
    `, [req.user.user_id]);

    res.json({
      status: 'success',
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};
