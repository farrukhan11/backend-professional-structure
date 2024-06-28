import { User } from '../models/user.model.js'
import uploadOnCLoudinary from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Error generating tokens:', error)
    throw new Error('An error occurred while generating access and refresh token')
  }
}

const registerUser = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body

    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        message: 'Please provide all the details',
      })
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
      return res.status(400).json({
        message: 'User with email or username already exists',
      })
    }

    const profileImgPath = req.files?.profileImg[0]?.path

    let coverImgPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImgPath = req.files.coverImage[0].path
    }

    if (!profileImgPath) {
      return res.status(400).json({
        message: 'Please provide profile image',
      })
    }

    const profileImg = await uploadOnCLoudinary(profileImgPath)
    const coverImg = await uploadOnCLoudinary(coverImgPath)

    if (!profileImg) {
      return res.status(400).json({
        message: 'Please provide valid profile image',
      })
    }

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      role,
      profileImg: profileImg.url,
      coverImage: coverImg?.url || '',
    })

    const userCreated = await User.findById(user._id).select('-password -refreshToken')

    if (!userCreated) {
      return res.status(400).json({
        message: 'User not created',
      })
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: userCreated,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return res.status(500).json({
      message: 'An error occurred while registering user',
    })
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      })
    }

    const isPasswordCorrect = await user.isPasswordMatch(password)

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Incorrect Credentials',
      })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        message: 'User logged in successfully',
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
  } catch (error) {
    console.error('Error logging in user:', error)
    return res.status(500).json({
      message: 'An error occurred while logging in',
    })
  }
}

const logOutUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      })
    }

    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: '' } }, { new: true })

    const options = {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    }

    return res.status(200)
      .cookie('accessToken', '', options)
      .cookie('refreshToken', '', options)
      .json({
        message: 'User logged out successfully',
      })
  } catch (error) {
    console.error('Error logging out user:', error)
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while logging out',
    })
  }
}

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Please login',
      })
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, 'i8sRE0kKjlUrbkEy1FeQFdLzcqzSU6A21iDTtPmqulub2s8HPIZmA9Gy4M2L8DR3V7BOpp4JzrK3QEyCl7OgaUHhF7a1zAQpDR9WuYJRvOAqLx7ktRI3DCcG')

    const user = await User.findById(decodedRefreshToken?._id)

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid Refresh Token',
      })
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Refresh Token does not match',
      })
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json({
        message: 'Access token refreshed successfully',
        accessToken,
        newRefreshToken,
      })
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while refreshing access token',
    })
  }
}

const changeCurrentPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide old password and new password',
      })
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordMatch(oldPassword)

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect password',
      })
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while changing password',
    })
  }
}

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword
}
