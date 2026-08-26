import { Router } from 'express';
import regionController from '../controller/region.controller';

const regionRouter = Router();

regionRouter.get('/stats', regionController.regionStats);
regionRouter.get('/fastest-growing', regionController.fastestGrowingRegion);
regionRouter.get('/performance', regionController.regionalPerformance);
regionRouter.get('/:regionId', regionController.regionDetails);

export default regionRouter;
