/* eslint-disable import/order */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
const express = require("express");

const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const { User } = require("../../models/User");
const Joi = require("@hapi/joi");

// @route GET api/auth
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.currentUser._id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

// @route Post api/auth
// @des  Authenticate user
// @access   public
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).send("User not exists");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("invalid email or password");

    const token = user.genAuthToken();
    res.json({ token });
  } catch (error) {
    return res.status(500).send(error);
  }
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email(),

    password: Joi.string()
      .min(5)
      .required()
  });
  return schema.validate(user);
}

module.exports = router;
