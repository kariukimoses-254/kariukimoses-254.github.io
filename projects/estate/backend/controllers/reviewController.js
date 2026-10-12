const { query, queryOne, insert, update, remove } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

exports.createReview = async (req, res, next) => {
  try {
    const { property_id, agent_id, rating, title, comment } = req.body;

    const result = await insert(
      'INSERT INTO reviews (user_id, property_id, agent_id, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.user_id, property_id || null, agent_id || null, rating, title, comment]
    );

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully. It will be published after admin approval.',
      data: { review_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPropertyReviews = async (req, res, next) => {
  try {
    const reviews = await query(`
      SELECT r.*, u.first_name, u.last_name, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.property_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `, [req.params.propertyId]);

    const stats = await queryOne(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM reviews WHERE property_id = ? AND is_approved = 1',
      [req.params.propertyId]
    );

    const distribution = await query(
      'SELECT rating, COUNT(*) as count FROM reviews WHERE property_id = ? AND is_approved = 1 GROUP BY rating ORDER BY rating DESC',
      [req.params.propertyId]
    );

    res.json({
      status: 'success',
      data: {
        reviews,
        stats: {
          total_reviews: stats.total_reviews,
          avg_rating: parseFloat(stats.avg_rating || 0).toFixed(1),
          distribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgentReviews = async (req, res, next) => {
  try {
    const reviews = await query(`
      SELECT r.*, u.first_name, u.last_name, u.avatar,
             p.title as property_title
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN properties p ON r.property_id = p.property_id
      WHERE r.agent_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `, [req.params.agentId]);

    res.json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await query(`
      SELECT r.*, u.first_name, u.last_name,
             p.title as property_title,
             a.agent_id
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN properties p ON r.property_id = p.property_id
      LEFT JOIN agents a ON r.agent_id = a.agent_id
      ORDER BY r.created_at DESC
    `);

    res.json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    await update('UPDATE reviews SET is_approved = 1 WHERE review_id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Review approved' });
  } catch (error) {
    next(error);
  }
};

exports.rejectReview = async (req, res, next) => {
  try {
    await remove('DELETE FROM reviews WHERE review_id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Review rejected and removed' });
  } catch (error) {
    next(error);
  }
};

exports.replyToReview = async (req, res, next) => {
  try {
    const { admin_reply } = req.body;
    await update('UPDATE reviews SET admin_reply = ? WHERE review_id = ?', [admin_reply, req.params.id]);
    res.json({ status: 'success', message: 'Reply added to review' });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await queryOne('SELECT * FROM reviews WHERE review_id = ?', [req.params.id]);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    await remove('DELETE FROM reviews WHERE review_id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
