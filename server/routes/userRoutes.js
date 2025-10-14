import express from 'express';
import { getUser, loginUser, registerUser } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { getPublishedImages } from '../controllers/messageController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUser);
userRouter.get('/published-images', getPublishedImages);

export default userRouter;
