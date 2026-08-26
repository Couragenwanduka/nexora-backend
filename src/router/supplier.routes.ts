import { Router } from 'express';
import supplierController from '../controller/supplier.controller';

const supplierrouter = Router();

// Supplier dashboard cards
supplierrouter.get('/stats', supplierController.supplierStats);

// Charts
supplierrouter.get('/risk-trend', supplierController.supplierRiskTrend);
supplierrouter.get('/risk-distribution', supplierController.riskDistribution);

// Supplier list
supplierrouter.get('/at-risk', supplierController.atRiskSupplierDetails);

// Individual supplier analytics
supplierrouter.get(
  '/:supplierId/region-exposure',
  supplierController.supplierRegionExposure,
);

supplierrouter.get(
  '/:supplierId/risk-by-category',
  supplierController.supplierRiskByCategory,
);

supplierrouter.get(
  '/:supplierId/growth',
  supplierController.supplierGrowthRate,
);

supplierrouter.get(
  '/:supplierId/performance',
  supplierController.supplierPerformance,
);

export default supplierrouter;
