# Create eventController.js
$eventController = @'
const { Event, Business, AuditLog, sequelize, Op } = require('../models');
const slugify = require('slugify');

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, date_from, date_to, location, business_id } = req.query;
    const offset = (page - 1) * limit;
    const where = { status: 'approved' };
    if (category) where.category = category;
    if (date_from) where.event_date = { [Op.gte]: date_from };
    if (date_to) where.event_date = { ...where.event_date, [Op.lte]: date_to };
    if (location) where.address = { [Op.iLike]: `%${location}%` };
    if (business_id) where.business_id = business_id;

    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo'] }],
      order: [['event_date', 'ASC'], ['start_time', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({ success: true, data: { events: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } } });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get events' });
  }
};

exports.getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({
      where: { slug, status: 'approved' },
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo', 'address', 'phone', 'email'] }]
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.views += 1;
    await event.save();
    return res.json({ success: true, data: { event } });
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get event' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { title, description, category, event_date, start_time, end_time, address, latitude, longitude, price, ticket_url, organizer, image_url, is_free } = req.body;
    const business = await Business.findOne({ where: { id: businessId, user_id: req.user.id } });
    if (!business) return res.status(403).json({ success: false, message: 'You do not own this business' });
    let slug = slugify(title, { lower: true, strict: true });
    const slugCheck = await Event.findOne({ where: { slug } });
    if (slugCheck) slug = `${slug}-${Date.now()}`;
    const event = await Event.create({
      business_id: businessId, title, slug, description, category, event_date, start_time, end_time,
      address: address || business.address, latitude: latitude || business.latitude, longitude: longitude || business.longitude,
      price: price || 0, ticket_url, organizer, image_url, is_free: is_free || false, status: 'pending'
    });
    await AuditLog.create({ user_id: req.user.id, action: 'event_create', target_type: 'event', target_id: event.id });
    return res.status(201).json({ success: true, message: 'Event submitted for approval', data: { event } });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    const event = await Event.findByPk(eventId, { include: [{ model: Business, as: 'business' }] });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.business.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You can only update your own events' });
    }
    if (event.status === 'approved' && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Approved events cannot be modified' });
    }
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'business_id' && key !== 'slug' && key !== 'status') event[key] = updates[key];
    });
    await event.save();
    return res.json({ success: true, message: 'Event updated successfully', data: { event } });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId, { include: [{ model: Business, as: 'business' }] });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.business.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own events' });
    }
    await event.destroy();
    await AuditLog.create({ user_id: req.user.id, action: 'event_delete', target_type: 'event', target_id: eventId });
    return res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
};
'@

# Create dealController.js
$dealController = @'
const { Deal, Business, AuditLog, sequelize, Op } = require('../models');
const slugify = require('slugify');

exports.getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, business_id, active_only = 'true' } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (business_id) where.business_id = business_id;
    if (active_only === 'true') {
      where.status = 'active';
      where.is_active = true;
      where.expires_at = { [Op.gt]: new Date() };
    }
    const { count, rows } = await Deal.findAndCountAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    return res.json({ success: true, data: { deals: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } } });
  } catch (error) {
    console.error('Get deals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get deals' });
  }
};

exports.getDealBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const deal = await Deal.findOne({
      where: { slug, is_active: true },
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo', 'address', 'phone'], where: { status: 'active' } }]
    });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    deal.views += 1;
    await deal.save();
    return res.json({ success: true, data: { deal } });
  } catch (error) {
    console.error('Get deal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get deal' });
  }
};

exports.createDeal = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { title, description, discount_percent, price, original_price, coupon_code, terms, image_url, starts_at, expires_at } = req.body;
    const business = await Business.findOne({ where: { id: businessId, user_id: req.user.id } });
    if (!business) return res.status(403).json({ success: false, message: 'You do not own this business' });
    let slug = slugify(title, { lower: true, strict: true });
    const slugCheck = await Deal.findOne({ where: { slug } });
    if (slugCheck) slug = `${slug}-${Date.now()}`;
    const deal = await Deal.create({
      business_id: businessId, title, slug, description, discount_percent: discount_percent || 0,
      price: price || 0, original_price: original_price || 0, coupon_code, terms, image_url, starts_at, expires_at,
      status: 'pending', is_active: true
    });
    await AuditLog.create({ user_id: req.user.id, action: 'deal_create', target_type: 'deal', target_id: deal.id });
    return res.status(201).json({ success: true, message: 'Deal submitted for approval', data: { deal } });
  } catch (error) {
    console.error('Create deal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create deal' });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const updates = req.body;
    const deal = await Deal.findByPk(dealId, { include: [{ model: Business, as: 'business' }] });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    if (deal.business.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You can only update your own deals' });
    }
    if (deal.status === 'active' && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Active deals cannot be modified' });
    }
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'business_id' && key !== 'slug' && key !== 'status') deal[key] = updates[key];
    });
    await deal.save();
    return res.json({ success: true, message: 'Deal updated successfully', data: { deal } });
  } catch (error) {
    console.error('Update deal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update deal' });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const deal = await Deal.findByPk(dealId, { include: [{ model: Business, as: 'business' }] });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    if (deal.business.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own deals' });
    }
    await deal.destroy();
    await AuditLog.create({ user_id: req.user.id, action: 'deal_delete', target_type: 'deal', target_id: dealId });
    return res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete deal' });
  }
};
'@

# Write the files
$eventController | Out-File -FilePath "src\controllers\eventController.js" -Encoding utf8
$dealController | Out-File -FilePath "src\controllers\dealController.js" -Encoding utf8

Write-Host "✅ Created eventController.js and dealController.js"