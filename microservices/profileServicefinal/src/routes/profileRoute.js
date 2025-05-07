const express = require('express');
const router = express.Router();
const { getProfile, upsertProfile, deleteProfile } = require('../controllers/profileController');

router.get('/:userId', getProfile);
router.post('/', upsertProfile);
router.delete('/:userId', deleteProfile);

module.exports = router;
