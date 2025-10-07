const express = require('express');
const router = express.Router();
const {
  getCheckIns,
  getCheckIn,
  createCheckIn,
  updateCheckIn,
  deleteCheckIn,
  getUserCheckInStats
} = require('../controllers/checkInController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats/user/:userId', getUserCheckInStats);
router.get('/stats/user', getUserCheckInStats);

router
  .route('/')
  .get(getCheckIns)
  .post(createCheckIn);

router
  .route('/:id')
  .get(getCheckIn)
  .put(updateCheckIn)
  .delete(deleteCheckIn);

module.exports = router;
