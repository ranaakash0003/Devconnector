const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});
const Post = mongoose.model("Post", postSchema);

function validatePost(post) {
  const schema = Joi.object({
    text: Joi.string().required(),
    name: Joi.string(),
    avatar: Joi.string(),
    likes: Joi.object({}),
    comments: Joi.object({
      text: Joi.string().required(),
      name: Joi.string(),
      avatar: Joi.string(),
      date: Joi.date()
    })
  });

  return schema.validate(post);
}

function validateComment(post) {
  const schema = Joi.object({
      text: Joi.string().required(),
      name: Joi.string(),
      avatar: Joi.string(),
      date: Joi.date()
  });

  return schema.validate(post);
}


module.exports = { Post, validatePost, validateComment };
