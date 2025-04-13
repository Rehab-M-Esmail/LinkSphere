const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to a User model
    required: true
},
content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters']
},
createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
},
  // Additional useful fields
updatedAt: {
    type: Date,
    default: Date.now
},
likes: {
    type: Number,
    default: 0
}
});


module.exports = mongoose.model('Post', PostSchema);