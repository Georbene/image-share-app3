// routes/posts.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const protect = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed!'), false);
    }
  },
});

// POST /api/posts - Create new post
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.userId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'image-share-app' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        uploadStream.end(file.buffer);
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    const newPost = new Post({
      user: userId,
      caption: caption || '',
      images: uploadedImages,
    });

    await newPost.save();
    await newPost.populate('user', 'firstName lastName email');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ message: 'Server error during post creation' });
  }
});

// GET /api/posts - Get all posts with full comment user info
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })   // This is the correct way to populate nested user in comments
      .lean();

    // Add counts
    posts.forEach(post => {
      post.likeCount = post.likes ? post.likes.length : 0;
      post.commentCount = post.comments ? post.comments.length : 0;
    });

    res.json({
      message: 'Posts fetched successfully',
      count: posts.length,
      posts
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Like / Unlike
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('user', 'firstName lastName');

    res.json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      post
    });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error while liking post' });
  }
});

// Add Comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: userId,
      text: text.trim()
    });

    await post.save();
    await post.populate('comments.user', 'firstName lastName');

    res.json({
      message: 'Comment added successfully',
      comments: post.comments
    });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// DELETE /api/posts/:id - Delete own post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the owner of the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete images from Cloudinary
    for (const image of post.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    // Delete the post from database
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});


// DELETE /api/posts/:postId/comments/:commentId - Delete own comment
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the owner of the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    // Remove the comment
    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});


module.exports = router;