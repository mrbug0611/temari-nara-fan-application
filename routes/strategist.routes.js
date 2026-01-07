// routes/strategist.routes.js
const express = require('express');
const router = express.Router();
const StrategistPost = require('../models/StrategistPost');
const {authenticate, isModerator} = require('../middleware/auth');

// get all strategist posts with filtering 
router.get('/', authenticate, async (req, res) => {  // Add authenticate middleware
    try {
        const {
            category, 
            featured, 
            pinned, 
            sort = '-createdAt',
            limit = 20, 
            page = 1, 
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }

        if (pinned !== undefined) {
            filter.pinned = pinned === 'true';
        }

        const skip = (page - 1) * limit;
        const currentUserId = req.user._id;

        let posts; 

        if (pinned === undefined){
            const pinnedPosts = await StrategistPost.find({pinned: true})
                .sort(sort)
                .populate('author.userId', 'username profile.avatar profile.rank');

            const regularPosts = await StrategistPost.find({...filter, pinned: false})
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('author.userId', 'username profile.avatar profile.rank'); // populate author info for regular posts
            
            posts = [...pinnedPosts, ...regularPosts];
        }   
        else {
            posts = await StrategistPost.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('author.userId', 'username profile.avatar profile.rank');
        } 

        // Add hasLiked boolean for current user (don't populate likedBy array)
        posts = posts.map(post => ({
            ...post.toObject(),
            hasLiked: post.likedBy.includes(currentUserId)
        }));

        const total = await StrategistPost.countDocuments(filter);

        res.json({
            posts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit), 
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// get trending posts (most liked in last 7 days)
router.get('/trending', async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trending = await StrategistPost.find({createdAt: {$gte: sevenDaysAgo}})
            .sort('-likes')
            .limit(10)
            .populate('author.userId', 'username profile.avatar profile.rank');
        res.json(trending);
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
});

// get post by id and increment views
router.get('/:id', async (req, res) => {
    try {
        const post = await StrategistPost.findByIdAndUpdate(
            req.params.id,
            {$inc: {views: 1}},
            {new: true}
        ).populate('author.userId', 'username profile.avatar profile.rank');
        
        // Populate replies separately since they're embedded subdocuments
        if (post && post.replies.length > 0) {
            await post.populate('replies.author.userId', 'username profile.avatar profile.rank');
        }

        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// create new post 
router.post('/', authenticate, async (req, res) => {
    try {
        const post = new StrategistPost({

            ...req.body, 
            author: {
                userId: req.user.id, 
                username: req.user.username,
                avatar: req.user.profile.avatar,
                rank: req.user.profile.rank
            }

        });

        await post.save();

        // update user activity 
        await req.user.updateOne({
            $inc: {'activity.forumPosts': 1}
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// add a reply to a post
router.post('/:id/reply', authenticate, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }

        if (post.locked) {
            return res.status(403).json({error: 'Post is locked'});
        }

        const reply = {
            author: {
                userId: req.user.id,
                username: req.user.username,
                avatar: req.user.profile.avatar,
                rank: req.user.profile.rank
            },
            content: req.body.content,
        };

        post.replies.push(reply);
        await post.save();

        // Update user activity
        await req.user.updateOne({ 
        $inc: { 'activity.forumReplies': 1 } 
        });

        res.status(201).json(post.replies[post.replies.length - 1]);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// like/unlike a post
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }

        const hasLiked = post.likedBy.includes(req.user.id);

        if (hasLiked) {
            post.likedBy = post.likedBy.filter(
                // make sure id not in likedBy array
                id => id.toString() !== req.user.id.toString()
            );
            post.likes = Math.max(0, post.likes - 1);
        }

        else {
            post.likedBy.push(req.user.id);
            post.likes += 1;
        }

    
        await post.save();
        res.json({likes: post.likes, hasLiked: !hasLiked});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Like/unlike reply
router.post('/:id/reply/:replyId/like', authenticate, async (req, res) => {
  try {
    const post = await StrategistPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const reply = post.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const hasLiked = reply.likedBy.includes(req.user.id);

    if (hasLiked) {
      reply.likedBy = reply.likedBy.filter(
        id => id.toString() !== req.user.id.toString()
      );
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      reply.likedBy.push(req.user.id);
      reply.likes += 1;
    }

    await post.save();
    res.json({ likes: reply.likes, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update post (author only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        if (post.author.userId.toString() !== req.user.id.toString() && !req.user.isModerator && !req.user.isAdmin) {
            return res.status(403).json({error: 'Unauthorized'});
            
        }

        // copies allowed fields from req.body to post
        Object.assign(post, req.body);
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// pin/unpin post (moderator only)
router.patch('/:id/pin', authenticate, isModerator, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        post.pinned = !post.pinned;
        await post.save();
        res.json({pinned: post.pinned});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// lock/unlock post (moderator only)
router.patch('/:id/lock', authenticate, isModerator, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        post.locked = !post.locked;
        await post.save();
        res.json({locked: post.locked});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// feature/unfeature post (moderator only)
router.patch('/:id/feature', authenticate, isModerator, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        post.featured = !post.featured;
        await post.save();
        res.json({featured: post.featured});
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }   
});

// delete post  
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const post = await StrategistPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        if (post.author.userId.toString() !== req.user.id.toString() && !req.user.isModerator && !req.user.isAdmin) {
            return res.status(403).json({error: 'Unauthorized'});
        }
        await post.deleteOne();
        res.json({message: 'Post deleted successfully'});
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;


