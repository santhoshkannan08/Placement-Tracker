const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllUserInterviews,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');

router.use(authenticate);

router.get('/', getAllUserInterviews);
router.patch('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
