const mongoose = require("mongoose")
mongoose.set("useCreateIndex", true)
const Joi = require("@hapi/joi")
const config = require("config")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 20,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 5,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

userSchema.methods.genAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"))
  return token
}

const User = mongoose.model("User", userSchema)

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(20)
      .required(),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .required()
      
  })
  return schema.validate(user)
}

module.exports = { User, validateUser }

// exports.User = User
// exports.validateUser = validateUser
