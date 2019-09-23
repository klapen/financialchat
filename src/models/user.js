const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  role: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
});

function generateAuthToken() {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      role: this.role,
    },
    config.privatekey,
  );
  return token;
}

UserSchema.methods.generateAuthToken = generateAuthToken;

const User = mongoose.model('User', UserSchema);
exports.User = User;

function validate(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required()
      .email(),
    password: Joi.string().min(3).max(255).required(),
    role: Joi.string().min(3).max(50).required(),
  };

  return Joi.validate(user, schema);
}

exports.validate = validate;
