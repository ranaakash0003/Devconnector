/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require("express");

const router = express.Router();
const auth = require("../../middleware/auth");
const { Post, validatePost, validateComment } = require("../../models/Post");
const { Profile } = require("../../models/Profile");
const { User } = require("../../models/User");

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { error } = validatePost(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const user = await User.findById(req.currentUser._id).select("-password");

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.currentUser._id
    });
    const post = await newPost.save();
    // console.log("~~~~~"+ post)
    res.json(post);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts
// @desc    GET all posts
// @access

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:id
// @desc    GET post by ID
// @access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.json(post);
  } catch (error) {
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "Post not found" });
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/posts/:id
// @desc    DELETE a Post
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.user.toString() !== req.currentUser._id) {
      return res.status(401).send({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (error) {
    if (error.kind === "ObjectId")
      return res.status(404).json({ msg: "Post not found" });
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a Post
// @access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter(like => like.user.toString() === req.currentUser._id)
        .length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.currentUser._id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});


// @route   PUT api/posts/unlike/:id
// @desc    Unlike a Post
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter(like => like.user.toString() === req.currentUser._id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post hasn't yet been liked" });
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.currentUser._id)
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  }
   catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});


// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const { error } = validateComment(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const user = await User.findById(req.currentUser._id).select("-password");
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.currentUser._id
    }
    
    post.comments.unshift(newComment)
    await post.save();

    res.json(post.comments);
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});


// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a post
// @access  Private

router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log("~~DELETE_POST~~~"+post);

    // Pull out the comment
    const comment = post.comments.find(comment => comment._id.toString() === req.params.comment_id)

    // Make sure comment exists
    if(!comment){
      return res.status(404).json({ msg: "Comment does not exist" })
    }

    // Check User
    if(comment.user.toString() !== req.currentUser._id) {
      return res.status(401).json({ msg: 'User not authorized' })
    }

    // Get remove index
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.currentUser._id)
    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments)
  } 
  catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error")
  }
})

module.exports = router;
