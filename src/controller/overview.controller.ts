import { Request, Response } from 'express';
import overViewService from '../service/overView.service';

class OverViewController {
  async overViewStat(req: Request, res: Response) {
    try {
      const data = await overViewService.overViewStat();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Overview stats controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch overview statistics',
      });
    }
  }

  async revenueAndOrder(req: Request, res: Response) {
    try {
      const data = await overViewService.revenueAndOrder();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Revenue and order controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue and order data',
      });
    }
  }

  async salesByCategory(req: Request, res: Response) {
    try {
      const data = await overViewService.salesByCategory();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Sales by category controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales by category',
      });
    }
  }

  async supplierAtRisk(req: Request, res: Response) {
    try {
      const data = await overViewService.supplierAtRisk();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Supplier at risk controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers at risk',
      });
    }
  }

  async topProduct(req: Request, res: Response) {
    try {
      const data = await overViewService.topProduct();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Top product controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch top products',
      });
    }
  }
}

const overViewController = new OverViewController();

export default overViewController;
