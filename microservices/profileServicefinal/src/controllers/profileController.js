const Profile = require('../models/profile');
const redisClient = require('../config/redis');
const { producer } = require('../config/kafka');

exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const cache = await redisClient.get(userId);
    if (cache) return res.status(200).json(JSON.parse(cache));

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    await redisClient.setEx(userId, 3600, JSON.stringify(profile));
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertProfile = async (req, res) => {
  const { userId, username, bio } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { userId, username, bio },
      { upsert: true, new: true }
    );
    await redisClient.del(userId);
    await producer.send({
      topic: 'profile-events',
      messages: [{ key: 'profileUpsert', value: JSON.stringify(profile) }]
    });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    await Profile.findOneAndDelete({ userId });
    await redisClient.del(userId);
    await producer.send({
      topic: 'profile-events',
      messages: [{ key: 'profileDelete', value: JSON.stringify({ userId }) }]
    });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
