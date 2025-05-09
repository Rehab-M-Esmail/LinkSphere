const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const router = express.Router();
const upload = multer({ storage });
const {
  uploadImage,
  getImage,
  deleteImage,
  listObjects,
} = require("../controllers/imageController");

router.post("/upload", upload.single("file"), uploadImage);
router.get("/:objectName", getImage);
router.delete("/delete/:objectName", deleteImage);
router.get("/buckets", listObjects);

module.exports = router;
