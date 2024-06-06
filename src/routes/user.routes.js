import { Router } from 'express'
import registerUser from '../controllers/user.controller.js'
import { upload } from '../middleware/multer.middleware.js' // import upload as a named import
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

export default router
