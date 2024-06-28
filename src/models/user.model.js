import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    profileImg: {
      type: String,
      required: true,
    },
    coverImg: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    'UVa5eLZyBmLLbtyIFAD4BM4PYBXiFRsCrjW5pdUvGYG9Xmwtv3xjQO8mXyovp6mYJ9gBlIyQ45seD2POIyr9PU2jedogCRLcW31gd4G',
    { expiresIn: '3600' }
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
    },
    'i8sRE0kKjlUrbkEy1FeQFdLzcqzSU6A21iDTtPmqulub2s8HPIZmA9Gy4M2L8DR3V7BOpp4JzrK3QEyCl7OgaUHhF7a1zAQpDR9WuYJRvOAqLx7ktRI3DCcG',
    { expiresIn: '36000' }
  );
  return token;
};

export const User = mongoose.model('User', userSchema);
