import * as userController from '@controllers/users';
import { AuthService } from '@services/authService';
import express from 'express';

import { authMiddleware } from '@/middlewares/auth';

const router = express.Router();
const authService = new AuthService();

router.get('/', authMiddleware(authService), userController.getAllUsers);

router.get('/:id', userController.getUserById);

export default router;
