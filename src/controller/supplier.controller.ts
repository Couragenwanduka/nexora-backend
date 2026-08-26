import { Request, Response } from 'express';
import supplierService from '../service/supplier.service';

class SupplierController {
  // GET /api/suppliers/stats
  async supplierStats(req: Request, res: Response) {
    try {
      const [suppliersAtRisk, criticalSuppliers, ordersAtRisk, revenueAtRisk] =
        await Promise.all([
          supplierService.suppliersAtRiskCount(),
          supplierService.criticalSuppliersCount(),
          supplierService.ordersAtRisk(),
          supplierService.revenueAtRisk(),
        ]);

      return res.status(200).json({
        success: true,
        data: {
          suppliersAtRisk,
          criticalSuppliers,
          ordersAtRisk,
          revenueAtRisk,
        },
      });
    } catch (error) {
      console.error('Supplier stats controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier statistics',
      });
    }
  }

  // GET /api/suppliers/risk-trend
  async supplierRiskTrend(req: Request, res: Response) {
    try {
      const trend = await supplierService.supplierRiskTrend();

      return res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (error) {
      console.error('Supplier risk trend controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier risk trend',
      });
    }
  }

  // GET /api/suppliers/risk-distribution
  async riskDistribution(req: Request, res: Response) {
    try {
      const distribution = await supplierService.riskDistribution();

      return res.status(200).json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      console.error('Risk distribution controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier risk distribution',
      });
    }
  }

  // GET /api/suppliers/at-risk
  async atRiskSupplierDetails(req: Request, res: Response) {
    try {
      const suppliers = await supplierService.atRiskSupplierDetails();

      return res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      console.error('At-risk suppliers controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch at-risk suppliers',
      });
    }
  }

  // GET /api/suppliers/:supplierId/region-exposure
  async supplierRegionExposure(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;

      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier ID is required',
        });
      }

      const regions = await supplierService.supplierRegionExposure(
        supplierId as string,
      );

      return res.status(200).json({
        success: true,
        data: regions,
      });
    } catch (error) {
      console.error('Supplier region exposure controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier region exposure',
      });
    }
  }

  // GET /api/suppliers/:supplierId/risk-by-category
  async supplierRiskByCategory(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;

      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier ID is required',
        });
      }

      const categories = await supplierService.supplierRiskByCategory(
        supplierId as string,
      );

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Supplier risk by category controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier risk by category',
      });
    }
  }

  // GET /api/suppliers/:supplierId/growth
  async supplierGrowthRate(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;

      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier ID is required',
        });
      }

      const growth = await supplierService.supplierGrowthRate(
        supplierId as string,
      );

      return res.status(200).json({
        success: true,
        data: growth,
      });
    } catch (error) {
      console.error('Supplier growth controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier growth rate',
      });
    }
  }

  // GET /api/suppliers/:supplierId/performance
  async supplierPerformance(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;

      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier ID is required',
        });
      }

      const performance = await supplierService.supplierPerformance(
        supplierId as string,
      );

      return res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      console.error('Supplier performance controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier performance',
      });
    }
  }
}

export default new SupplierController();
