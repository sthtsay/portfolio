const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { checkAdminToken } = require('../middleware/auth');
const { validateRequest, contactSchema } = require('../middleware/validation');

// Public route
router.post('/',
  validateRequest(contactSchema),
  contactController.submitContact
);

// Admin routes
router.get('/',
  checkAdminToken,
  contactController.getContacts
);

router.get('/unread-count',
  checkAdminToken,
  contactController.getUnreadCount
);

router.patch('/:id/read',
  checkAdminToken,
  contactController.markContactAsRead
);

router.delete('/:id',
  checkAdminToken,
  contactController.deleteContact
);

module.exports = router;