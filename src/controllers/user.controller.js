import { User } from '../models/user.model.js'
import uploadOnCLoudinary from '../utils/cloudinary.js'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Asynchronous operations (if any) would go here
    // generate access token

    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while generating access and refresh token',
    })
  }
}

const registerUser = async (req, res, next) => {
  try {
    // Asynchronous operations (if any) would go here
    // get user details from front end
    const { fullName, username, email, password, role } = req.body
    console.log('email' + email)

    // validation of user details
    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        message: 'Please provide all the details',
      })
    }
    //or
    // if ([fullName, username, email, password, role].some(value => value?.trim() === '')) {
    //   return res.status(400).json({
    //     message: 'Please provide all the details',
    //   });
    // }

    // check if user already exists in database - check with username and email

    const existedUser = await User.findOne(
      {
        $or: [{ username }, { email }]
      }
    )

    if (existedUser) {
      return res.status(400).json({
        message: 'User with email or username already exists',
      })
    }

    // check for profile image
    const profileImgPath = req.files?.profileImg[0]?.path

    let coverImgPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImgPath = req.files.coverImage[0].path
    }

    if (!profileImgPath) {
      return res.status(400).json({
        message: 'Please provide profile image',
      })
    }

    //uploading to cloudinary server
    const profileImg = await uploadOnCLoudinary(profileImgPath)
    const coverImg = await uploadOnCLoudinary(coverImgPath)
    if (!profileImg) {
      return res.status(400).json({
        message: 'Please provide valid profile image',
      })
    }

    // create a new user in database
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      role,
      profileImg: profileImg.url,
      coverImage: coverImg?.url || '',
    })

    //remove password and refresh token from the response
    // check if user is created
    const userCreated = await User.findById(user._id).select('-password -refreshToken')
    if (!userCreated) {
      return res.status(400).json({
        message: 'User not created',
      })
    }

    //return response
    return res.status(201).json({
      message: 'User created successfully',
      user: userCreated,
    })

  } catch (error) {
    // If an error occurs during the execution of asynchronous operations
    // Handle the error and send an appropriate reesponse
    console.error(error) // Log the error for debugging purposes
    res.status(500).json({
      message: 'An error occurred while registering user',
    })
  }
}

const loginUser = async (req, res, next) => {
  try {
    //get data from req data
    const { email, password, username } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      })
    }

    //username or email can be used to login
    const user = await User.findOne(
      {
        $or: [{ username }, { email }]
      }
    )

    //check if user exists in database
    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      })
    }

    //check the password with the one in database
    const isPasswordCorrect = await user.isPasswordMatch(password)

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Incorrect Credentials',
      })
    }

    //access token and refresh token should be generated
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    //send access token and refresh token in cookies 

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

  }

  catch (error) {
    // If an error occurs during the execution of asynchronous operations

    // Handle the error and send an appropriate reesponse
    console.log(error) // Log the error for debugging purposes

  }
}
const logOutUser = async (req, res, next) => {
  User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        refreshToken: '',
      },

    },
    {
      new: true,
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res.status(200)
    .cookie('accessToken', '', options)
    .cookie('refreshToken', '', options)
    .json({
      message: 'User logged out successfully',
    })
}

export {
  registerUser,
  loginUser,

}
