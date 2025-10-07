const express = require('express');
const router = express.Router();
const {
  getObjectives,
  getObjective,
  createObjective,
  updateObjective,
  deleteObjective,
  publishObjective
} = require('../controllers/objectiveController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getObjectives)
  .post(createObjective);

router
  .route('/:id')
  .get(getObjective)
  .put(updateObjective)
  .delete(deleteObjective);

router.put('/:id/publish', publishObjective);

module.exports = router;
