const Post = require('../models/post');

// Create a new post
const createPost = async (req, res) => {
    // try {
    //     const { userId, content,category } = req.body;
    //     const post = new Post({ userId, content,category});
    //     await post.save();
    //     res.status(201).json(post);
    // } catch (error) {
    //     res.status(400).json({ message: error.message });
    // } 

   //used to insert multiple posts at once 3shan nkhtsr

    try {
    const posts = await Post.insertMany(req.body); // Insert all posts at once
    res.status(201).json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
    
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Get a single post by ID
const getPostById = async (req, res) => {
    try
    {
        const post = await Post.findById(req.params.id);
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
        )
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
        )
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        //For testing purposes
        res.status(200).send("Post liked successfully");
        //res.status(200).json(post);
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
        )
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
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Get posts by keyword could be used to search for posts by content
const getPostsByKeyword = async (req, res) => {
    try {
        const { keyword } = req.query;
        const posts = await Post.find({
            content: { $regex: keyword, $options: 'i' }
        })
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports= {createPost, getAllPosts, getPostById, updatePost, deletePost, likePost, unlikePost, getPostsByUserId, getPostsByKeyword};