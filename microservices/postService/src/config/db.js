const mongoose = require('mongoose');
const connectToDatabase = async () => {
try {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000 // 30 seconds
});
    console.log('Database Connected!');
} catch (err) {
    console.error('Database Connection Failed:', err);
    process.exit(1);
}
};

module.exports = connectToDatabase;