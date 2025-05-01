import * as userController from '@/controllers/users';
import express from 'express';

const router = express.Router();

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

export default router;
