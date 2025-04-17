const Post = require('../models/post');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { userId, content,category } = req.body;
        const post = new Post({ userId, content,category});
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// const now = new Date();
// console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Get a single post by ID
const getPostById = async (req, res) => {
    try
    {
        const post = await Post.findById(req.params.id).populate('userId', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Update a post by ID
const updatePost = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        ).populate('userId', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
// Delete a post by ID
const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(204).send("Post deleted successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Like a post
const likePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        ).populate('userId', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Unlike a post
const unlikePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: -1 } },
            { new: true }
        ).populate('userId', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Get posts by user ID
const getPostsByUserId = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId }).populate('userId', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Get posts by keyword
const getPostsByKeyword = async (req, res) => {
    try {
        const { keyword } = req.query;
        const posts = await Post.find({
            content: { $regex: keyword, $options: 'i' }
        }).populate('userId', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports= {createPost, getAllPosts, getPostById, updatePost, deletePost, likePost, unlikePost, getPostsByUserId, getPostsByKeyword};