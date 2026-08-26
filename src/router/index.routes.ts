import express from 'express';

import overviewRouter from './overview.routes';
import supplierRouter from './supplier.routes';
import regionRouter from './region.routes';
import productsRouter from './product.routes';

const router = express.Router();

router.use('/overview', overviewRouter);
router.use('/suppliers', supplierRouter);
router.use('/regions', regionRouter);
router.use('/products', productsRouter);

export default router;
