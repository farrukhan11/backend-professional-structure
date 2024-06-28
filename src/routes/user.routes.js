import { Router } from 'express';
import { loginUser, registerUser, logOutUser, refreshAccessToken } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWTToken } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        { name: 'profileImg', maxCount: 1 },
        { name: 'coverImg', maxCount: 1 }
    ]),
    registerUser
);

router.route('/login').post(loginUser);

router.route('/logout').post(verifyJWTToken, logOutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
