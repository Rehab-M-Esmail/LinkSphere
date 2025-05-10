const express = require("express");
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const metadata = await admin.fetchTopicMetadata();
    await admin.disconnect();

    res.json({
      status: "healthy",
      kafka: {
        connected: true,
        topics: metadata.topics.map((t) => t.name),
      },
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      error: err.message,
    });
  }
});
module.exports = router;
