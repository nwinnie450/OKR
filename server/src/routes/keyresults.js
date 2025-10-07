const express = require('express');
const router = express.Router();
const {
  getKeyResults,
  getKeyResult,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult
} = require('../controllers/keyResultController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getKeyResults)
  .post(createKeyResult);

router
  .route('/:id')
  .get(getKeyResult)
  .put(updateKeyResult)
  .delete(deleteKeyResult);

module.exports = router;
