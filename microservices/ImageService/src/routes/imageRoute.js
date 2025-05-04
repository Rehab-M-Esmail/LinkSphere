const express = require('express');
const router = express.Router();
const { uploadImage, getImage, deleteImage } = require('../controllers/imageController');

router.post('/upload', uploadImage); 
router.get('/get/:objectName', getImage);
router.delete('/delete/:objectName', deleteImage);

module.exports = router;