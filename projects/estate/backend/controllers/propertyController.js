const { query, queryOne, insert, update, remove } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

exports.getAllProperties = async (req, res, next) => {
  try {
    const whereClauses = ['p.is_approved = 1'];
    const params = [];

    if (req.query.status) {
      whereClauses.push('p.status = ?');
      params.push(req.query.status);
    }

    if (req.query.purpose) {
      whereClauses.push('p.purpose = ?');
      params.push(req.query.purpose);
    }

    if (req.query.type_id) {
      whereClauses.push('p.type_id = ?');
      params.push(req.query.type_id);
    }

    if (req.query.category_id) {
      whereClauses.push('p.category_id = ?');
      params.push(req.query.category_id);
    }

    if (req.query.min_price) {
      whereClauses.push('p.price >= ?');
      params.push(req.query.min_price);
    }

    if (req.query.max_price) {
      whereClauses.push('p.price <= ?');
      params.push(req.query.max_price);
    }

    if (req.query.bedrooms) {
      whereClauses.push('p.bedrooms = ?');
      params.push(req.query.bedrooms);
    }

    if (req.query.bathrooms) {
      whereClauses.push('p.bathrooms = ?');
      params.push(req.query.bathrooms);
    }

    if (req.query.city) {
      whereClauses.push('p.city LIKE ?');
      params.push(`%${req.query.city}%`);
    }

    if (req.query.county) {
      whereClauses.push('p.county LIKE ?');
      params.push(`%${req.query.county}%`);
    }

    if (req.query.search) {
      whereClauses.push('(p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (req.query.featured) {
      whereClauses.push('p.is_featured = 1');
    }

    if (req.query.amenity === '6g') {
      whereClauses.push(`p.property_id IN (SELECT pa.property_id FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.amenity_id WHERE a.amenity_name LIKE '%6G%' OR a.amenity_name LIKE '%smart%')`);
    }

    if (req.query.agent_id) {
      whereClauses.push('p.agent_id = ?');
      params.push(req.query.agent_id);
    }

    const whereStr = ' WHERE ' + whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*) as total FROM properties p${whereStr}`;
    const countResult = await queryOne(countSql, params);
    const total = countResult.total;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || parseInt(process.env.ITEMS_PER_PAGE) || 12));
    const offset = (page - 1) * limit;

    const sql = `
      SELECT p.*, pt.type_name, pc.category_name,
             u.first_name as agent_first_name, u.last_name as agent_last_name,
             a.license_number, a.rating as agent_rating,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM favorites WHERE property_id = p.property_id) as favorite_count
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      JOIN agents a ON p.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      ${whereStr}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];

    const properties = await query(sql, dataParams);

    res.json({
      status: 'success',
      data: {
        properties,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await queryOne(`
      SELECT p.*, pt.type_name, pc.category_name,
             u.first_name as agent_first_name, u.last_name as agent_last_name,
             u.email as agent_email, u.phone as agent_phone, u.avatar as agent_avatar,
             a.agent_id, a.license_number, a.bio as agent_bio, a.rating as agent_rating,
             a.total_sales, a.total_rentals, a.specialization
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      JOIN agents a ON p.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE p.property_id = ? AND p.is_approved = 1
    `, [req.params.id]);

    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    const images = await query(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order',
      [req.params.id]
    );

    const videos = await query(
      'SELECT * FROM property_videos WHERE property_id = ?',
      [req.params.id]
    );

    const amenities = await query(
      `SELECT a.amenity_id, a.amenity_name, a.icon
       FROM amenities a
       JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
       WHERE pa.property_id = ?`,
      [req.params.id]
    );

    const documents = await query(
      'SELECT * FROM property_documents WHERE property_id = ?',
      [req.params.id]
    );

    const reviewCount = await queryOne(
      'SELECT COUNT(*) as count FROM reviews WHERE property_id = ? AND is_approved = 1',
      [req.params.id]
    );

    const avgRating = await queryOne(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE property_id = ? AND is_approved = 1',
      [req.params.id]
    );

    await update('UPDATE properties SET views_count = views_count + 1 WHERE property_id = ?', [req.params.id]);

    const activeBooking = await queryOne(
      `SELECT b.booking_id, b.customer_id, b.booking_date, b.created_at,
              u.first_name, u.last_name
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       JOIN users u ON c.user_id = u.user_id
       WHERE b.property_id = ? AND b.status IN ('pending', 'confirmed')
       ORDER BY b.created_at ASC
       LIMIT 1`,
      [req.params.id]
    );

    res.json({
      status: 'success',
      data: {
        property: {
          ...property,
          is_booked: !!activeBooking,
          booking_info: activeBooking ? {
            booked_by: activeBooking.first_name + ' ' + activeBooking.last_name,
            booking_date: activeBooking.booking_date,
            booked_at: activeBooking.created_at
          } : null,
          images: images.map(img => ({
            ...img,
            image_url: '/uploads/properties/' + img.image_path
          })),
          videos,
          amenities,
          documents,
          review_count: reviewCount.count,
          avg_rating: avgRating.avg_rating || 0,
          views_count: property.views_count + 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createProperty = async (req, res, next) => {
  try {
    const {
      type_id, category_id, title, description, price, status, purpose,
      bedrooms, bathrooms, kitchens, parking_spaces, area_sqft, year_built,
      address, county, city, state, zip_code, latitude, longitude, amenities
    } = req.body;

    const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
    if (!agent) {
      return next(new AppError('Agent profile not found', 400));
    }

    const result = await insert(
      `INSERT INTO properties (agent_id, type_id, category_id, title, description, price, status, purpose,
        bedrooms, bathrooms, kitchens, parking_spaces, area_sqft, year_built, address, county, city, state,
        zip_code, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [agent.agent_id, type_id, category_id, title, description, price, status || 'available', purpose || 'sale',
       bedrooms || 0, bathrooms || 0, kitchens || 0, parking_spaces || 0, area_sqft, year_built,
       address, county, city, state, zip_code, latitude, longitude]
    );

    if (req.files && req.files.images) {
      for (let i = 0; i < req.files.images.length; i++) {
        await insert(
          'INSERT INTO property_images (property_id, image_path, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, req.files.images[i].filename, title, i === 0 ? 1 : 0, i + 1]
        );
      }
    }

    if (amenities && Array.isArray(amenities)) {
      for (const amenityId of amenities) {
        await insert(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [result.insertId, amenityId]
        );
      }
    }

    logger.info(`New property created: ${title} by agent ${agent.agent_id}`);

    res.status(201).json({
      status: 'success',
      message: 'Property created successfully. Pending admin approval.',
      data: { property_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProperty = async (req, res, next) => {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE property_id = ?', [req.params.id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    if (req.user.role === 'agent') {
      const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
      if (!agent || agent.agent_id !== property.agent_id) {
        return next(new AppError('Not authorized to update this property', 403));
      }
    }

    const {
      type_id, category_id, title, description, price, status, purpose,
      bedrooms, bathrooms, kitchens, parking_spaces, area_sqft, year_built,
      address, county, city, state, zip_code, latitude, longitude, amenities
    } = req.body;

    await update(
      `UPDATE properties SET type_id = ?, category_id = ?, title = ?, description = ?, price = ?,
       status = ?, purpose = ?, bedrooms = ?, bathrooms = ?, kitchens = ?, parking_spaces = ?,
       area_sqft = ?, year_built = ?, address = ?, county = ?, city = ?, state = ?,
       zip_code = ?, latitude = ?, longitude = ? WHERE property_id = ?`,
      [type_id, category_id, title, description, price, status, purpose,
       bedrooms, bathrooms, kitchens, parking_spaces, area_sqft, year_built,
       address, county, city, state, zip_code, latitude, longitude, req.params.id]
    );

    if (req.files && req.files.images) {
      for (let i = 0; i < req.files.images.length; i++) {
        await insert(
          'INSERT INTO property_images (property_id, image_path, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, req.files.images[i].filename, title, i === 0 ? 1 : 0, i + 1]
        );
      }
    }

    if (amenities && Array.isArray(amenities)) {
      await remove('DELETE FROM property_amenities WHERE property_id = ?', [req.params.id]);
      for (const amenityId of amenities) {
        await insert(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [req.params.id, amenityId]
        );
      }
    }

    res.json({
      status: 'success',
      message: 'Property updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE property_id = ?', [req.params.id]);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    if (req.user.role === 'agent') {
      const agent = await queryOne('SELECT agent_id FROM agents WHERE user_id = ?', [req.user.user_id]);
      if (!agent || agent.agent_id !== property.agent_id) {
        return next(new AppError('Not authorized to delete this property', 403));
      }
    }

    await remove('DELETE FROM properties WHERE property_id = ?', [req.params.id]);

    res.json({
      status: 'success',
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { property_id } = req.params;

    const existing = await queryOne(
      'SELECT favorite_id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.user_id, property_id]
    );

    if (existing) {
      await remove('DELETE FROM favorites WHERE favorite_id = ?', [existing.favorite_id]);
      res.json({ status: 'success', message: 'Removed from favorites', is_favorited: false });
    } else {
      await insert('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
        [req.user.user_id, property_id]);
      res.json({ status: 'success', message: 'Added to favorites', is_favorited: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await query(`
      SELECT p.*, pt.type_name, pc.category_name,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM favorites f
      JOIN properties p ON f.property_id = p.property_id
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.user_id]);

    res.json({
      status: 'success',
      data: { favorites }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPropertyTypes = async (req, res, next) => {
  try {
    const types = await query('SELECT * FROM property_types WHERE is_active = 1');
    res.json({ status: 'success', data: { types } });
  } catch (error) {
    next(error);
  }
};

exports.getPropertyCategories = async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM property_categories WHERE is_active = 1');
    res.json({ status: 'success', data: { categories } });
  } catch (error) {
    next(error);
  }
};

exports.getAmenities = async (req, res, next) => {
  try {
    const amenities = await query('SELECT * FROM amenities WHERE is_active = 1 ORDER BY category, amenity_name');
    res.json({ status: 'success', data: { amenities } });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await query(`
      SELECT p.*, pt.type_name, pc.category_name,
             u.first_name as agent_first_name, u.last_name as agent_last_name,
             (SELECT CONCAT('/uploads/properties/', image_path) FROM property_images WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM properties p
      JOIN property_types pt ON p.type_id = pt.type_id
      JOIN property_categories pc ON p.category_id = pc.category_id
      JOIN agents a ON p.agent_id = a.agent_id
      JOIN users u ON a.user_id = u.user_id
      WHERE p.is_featured = 1 AND p.is_approved = 1 AND p.status = 'available'
      ORDER BY p.created_at DESC
      LIMIT 6
    `);

    res.json({ status: 'success', data: { properties } });
  } catch (error) {
    next(error);
  }
};
