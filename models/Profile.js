const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  bio: {
    type: String
  },
  githubusername: {
    type: String
  },
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [
    {
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldofstudy: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model("Profile", profileSchema);

function validateProfile(profile) {
  const schema = Joi.object({
    // user: Joi.required(),
    company: Joi.string().max(100),
    status: Joi.string()
      .required()
      .max(50),
    website: Joi.string().max(50),
    skills: Joi.array()
      .items(Joi.string())
      .required(),
    location: Joi.string(),
    bio: Joi.string(),
    githubusername: Joi.string(),
    social: Joi.object({
      twitter: Joi.string()
        .allow("")
        .optional(),
      facebook: Joi.string()
        .allow("")
        .optional(),
      youtube: Joi.string()
        .allow("")
        .optional(),
      linkedin: Joi.string()
        .allow("")
        .optional(),
      instagram: Joi.string()
        .allow("")
        .optional()
    })
  });

  return schema.validate(profile);
}

function validateExperience(experience) {
  const experienceSchema = Joi.object({
    title: Joi.string(),
    company: Joi.string(),
    location: Joi.string(),
    from: Joi.date(),
    to: Joi.date().allow("").optional(),
    current: Joi.boolean(),
    description: Joi.string()
  });

  return experienceSchema.validate(experience);
}

function validateEducation(education) {
  const educationSchema = Joi.object({
    school: Joi.string(),
    degree: Joi.string(),
    fieldofstudy: Joi.string(),
    from: Joi.date(),
    to: Joi.date().allow("").optional(),
    current: Joi.boolean(),
    description: Joi.string()
  });

  return educationSchema.validate(education);
}

module.exports = {
  Profile,
  validateProfile,
  validateExperience,
  validateEducation
};
