const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');
const {
  getApplicationInterviews,
  createInterview,
} = require('../controllers/interviewController');

router.use(authenticate);

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

// Nested interview routes under /api/applications/:id/interviews
router.get('/:id/interviews', getApplicationInterviews);
router.post('/:id/interviews', createInterview);

module.exports = router;
