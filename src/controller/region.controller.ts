import { Request, Response } from 'express';
import regionService from '../service/region.service';

class RegionController {
  async regionStats(req: Request, res: Response) {
    try {
      const stats = await regionService.regionStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Region stats controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch region statistics',
      });
    }
  }

  async fastestGrowingRegion(req: Request, res: Response) {
    try {
      const region = await regionService.fastestGrowingRegion();

      return res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error) {
      console.error('Fastest growing region controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fastest growing region',
      });
    }
  }

  async regionalPerformance(req: Request, res: Response) {
    try {
      const regions = await regionService.regionalPerformance();

      return res.status(200).json({
        success: true,
        data: regions,
      });
    } catch (error) {
      console.error('Regional performance controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch regional performance',
      });
    }
  }

  async regionDetails(req: Request, res: Response) {
    try {
      const { regionId } = req.params;

      if (!regionId) {
        return res.status(400).json({
          success: false,
          message: 'Region ID is required',
        });
      }

      const region = await regionService.regionDetails(regionId as string);

      if (!region) {
        return res.status(404).json({
          success: false,
          message: 'Region not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error) {
      console.error('Region details controller error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch region details',
      });
    }
  }
}

export default new RegionController();
