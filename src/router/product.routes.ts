import { Router } from 'express';
import productController from '../controller/product.controller';

const productsRouter = Router();

productsRouter.get('/stats', productController.productStats);
productsRouter.get('/:productId', productController.productDetails);

productsRouter.get('/', productController.allProducts);

export default productsRouter;
