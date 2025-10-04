import express from 'express';

import * as userController from '@/controllers/users';
import { authMiddleware } from '@/middlewares/auth';
import { AuthService } from '@/services/authService';

const router = express.Router();
const authService = new AuthService();

router.get('/', authMiddleware(authService), userController.getAllUsers);

router.get('/:id', userController.getUserById);

export default router;
