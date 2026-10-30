import * as productController from '@controllers/products';
import express from 'express';

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProductById);

export default router;
