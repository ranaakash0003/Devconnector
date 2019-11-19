const express = require("express");

const router = express.Router();
const request = require("request");
const config = require("config");
const auth = require("../../middleware/auth");
const {
  Profile,
  validateProfile,
  validateExperience,
  validateEducation
} = require("../../models/Profile");
const { User } = require("../../models/User");

// @route    GET api/profile/me
// @desc    Get current users profile
// @access   Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.currentUser._id
    }).populate("user", ["name", "avatar"], User);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  try {
    console.log(req.body);
    if (req.body.skills) {
      req.body.skills = req.body.skills.split(",").map(skill => skill.trim());
    }
    const { error } = validateProfile(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const {
      // user,
      company,
      status,
      website,
      skills,
      location,
      bio,
      education,
      experience,
      githubusername,
      social
    } = req.body;

    let user = req.currentUser._id;
    let profile = await Profile.findOne({ user });
    if (profile) return res.status(400).send("Profile already exists");

    profile = new Profile({
      user,
      company,
      status,
      website,
      skills,
      experience,
      githubusername,
      location,
      bio,
      education,
      social
    });
    if (req.currentUser._id == profile.user) {
      await profile.save();
      return res.json(profile);
    } else {
      return res.status(401).json("Acces denied");
    }
  } catch (error) {
    console.log("--------" + error);
    return res.status(500).send(error.details[0].message);
  }
});

// @route    GET api/profile/me
// @desc    Get all users profile
//@access   Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "user",
      ["name", "avatar"],
      User
    );
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc    Get profile by user ID
//@access   Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"], User);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile/
// @desc    DELETE profile, user & posts
//@access   Private

router.delete("/", auth, async (req, res) => {
  try {
    //Remove Profile
    await Profile.findOneAndDelete({ user: req.currentUser._id });
    //Remove User
    await User.findOneAndDelete({ _id: req.currentUser._id });

    res.json({ msg: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/experience
// @desc    Add profile experience
//@access   Private

router.put("/experience", auth, async (req, res) => {
  const { error } = validateExperience(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  const { title, company, location, from, to, current, description } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({ user: req.currentUser._id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access   Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.currentUser._id });
    const removeIndex = profile.experience
      .map(item => item._id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    // console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/education
// @desc    Add profile education
//@access   Private

router.put("/education", auth, async (req, res) => {
  const { error } = validateEducation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({ user: req.currentUser._id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.currentUser._id });
    const removeIndex = profile.education
      .map(item => item._id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/github/:username
// @desc    Get user repos from Github
// @access   Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&clent_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github Profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
