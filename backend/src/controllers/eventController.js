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
