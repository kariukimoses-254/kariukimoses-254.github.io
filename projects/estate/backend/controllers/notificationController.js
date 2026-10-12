const { query, queryOne, insert, update } = require('../config/database');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    );

    const unreadCount = await queryOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.user_id]
    );

    res.json({
      status: 'success',
      data: {
        notifications,
        unread_count: unreadCount.count
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await update(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ status: 'success', message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await update(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.user_id]
    );
    res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    await insert(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [userId, title, message, type, link]
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { query: dbQuery } = require('../config/database');
    await dbQuery(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ status: 'success', message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
