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
updatedAt: {
    type: Date,
    default: Date.now
},
likes: {
    type: Number,
    default: 0
},
comments: {
    type: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true,
                trim: true,
                maxlength: [500, 'Comment cannot exceed 500 characters']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    default: []
},
category : {
    type: String,
    enum: ["Technology",
"Science",
"Health & Fitness",
"Business",
"Entertainment",
"Sports",
"Travel",
"Food & Cooking",
"Art & Design",
"Education"],
required: true
},
visability: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'private',},
});

module.exports = mongoose.model('Post', PostSchema);