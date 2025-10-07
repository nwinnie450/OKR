const express = require('express');
const router = express.Router();
const {
  getBadges,
  awardBadge,
  checkBadges,
  getBadgeTypes,
  deleteBadge
} = require('../controllers/badgeController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public routes (authenticated users)
router.get('/', getBadges);
router.get('/types', getBadgeTypes);
router.post('/check', checkBadges);
router.post('/check/:userId', checkBadges);

// Admin routes
router.post('/', authorize('admin'), awardBadge);
router.delete('/:id', authorize('admin'), deleteBadge);

module.exports = router;
