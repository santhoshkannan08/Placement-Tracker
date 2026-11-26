const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  sendTestEmail,
} = require('../controllers/reminderController');

router.use(authenticate);

router.get('/', getReminders);
router.post('/', createReminder);
router.post('/test-email', sendTestEmail);
router.patch('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
