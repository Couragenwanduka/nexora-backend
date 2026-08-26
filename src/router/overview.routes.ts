import { Router } from 'express';
import overViewController from '../controller/overview.controller';

const overviewRouter = Router();

overviewRouter.get('/stats', overViewController.overViewStat);
overviewRouter.get('/revenue-orders', overViewController.revenueAndOrder);
overviewRouter.get('/sales-category', overViewController.salesByCategory);
overviewRouter.get('/suppliers-risk', overViewController.supplierAtRisk);
overviewRouter.get('/top-products', overViewController.topProduct);

export default overviewRouter;
