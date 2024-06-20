import { Router } from 'express'
import { loginUser, registerUser, logOutUser } from '../controllers/user.controller.js'
import { upload } from '../middleware/multer.middleware.js' // import upload as a named import
import { verifyJWTToken } from '../middleware/auth.middleware.js'
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'profileImg',
            maxCount: 1
        },
        {
            name: 'coverImg',
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWTToken, logOutUser)

export default router
