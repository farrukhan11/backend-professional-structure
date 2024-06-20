import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'


export const verifyJWTToken = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '')
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. Please login',
            })
            const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

            const user = await User.findById(decodedInfo?._id).select('-password -refreshToken')

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Access denied. Please login',
                })
            }
            req.user = user
            next()
        }
    } catch (error) {
        console.log("Invalid Access Token" + error)
    }
}