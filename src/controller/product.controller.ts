import { Request, Response } from 'express';
import productService from '../service/product.service';

class ProductController {
  async productStats(req: Request, res: Response) {
    try {
      const data = await productService.productStats();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Product stats controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch product statistics',
      });
    }
  }

  async allProducts(req: Request, res: Response) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);

      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

      const result = await productService.allProducts(page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('All products controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
      });
    }
  }

  async productDetails(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      console.log(productId, 'i got here');

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
        return;
      }

      const data = await productService.productDetails(String(productId));
      console.log(data);

      if (!data) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Product details controller error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch product details',
      });
    }
  }
}

const productController = new ProductController();

export default productController;
