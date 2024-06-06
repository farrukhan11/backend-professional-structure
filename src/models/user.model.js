import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
      index: true, //to make any field searchable in mongodb, to search in database
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, //to make any field searchable in mongodb, to search in database
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    profileImg: {
      type: String, //cloudinary URL
      required: true,
    },
    coverImg: {
      type: String, //cloudinary URL
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10)
  }
  next()
})

userSchema.method.isPasswordMatch = async function (password) {
  const user = this
  return await bcrypt.compare(password, user.password)
}

userSchema.method.generateAccessToken = async function () {
  const user = this
  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}
userSchema.method.generateRefreshToken = async function () {
  const user = this
  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

export const User = mongoose.model('User', userSchema)
