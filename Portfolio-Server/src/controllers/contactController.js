const contactService = require('../services/contactService');
const socket = require('../socket');
const constants = require('../config/constants');

const submitContact = async (req, res, next) => {
  try {
    const contactData = await contactService.createContact(req.body);
    
    // Send email notification (async - don't wait for it)
    contactService.sendEmailNotification(contactData)
      .then(emailSent => {
        // Email notification handled silently
      })
      .catch(error => {
        console.error('Email notification error:', error);
      });
    
    // Emit socket event for real-time updates
    socket.io.emit('new-contact', {
      id: contactData.id,
      name: contactData.fullname,
      email: contactData.email,
      timestamp: contactData.timestamp
    });
    
    res.json({
      success: true,
      message: constants.SUCCESS_MESSAGES.CONTACT_SUBMITTED,
      id: contactData.id
    });
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await contactService.getUnreadCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

const markContactAsRead = async (req, res, next) => {
  try {
    const success = await contactService.markAsRead(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: constants.ERROR_MESSAGES.CONTACT_NOT_FOUND });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const success = await contactService.deleteContact(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: constants.ERROR_MESSAGES.CONTACT_NOT_FOUND });
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  getUnreadCount,
  markContactAsRead,
  deleteContact
};