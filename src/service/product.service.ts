import { driver } from '../db/neo4j';
import { toNumber } from './supplier.service';

class ProductService {
  async productStats() {
    const session = driver.session();

    try {
      const result = await session.run(`
      // ==========================================
      // Total products
      // ==========================================

      CALL {
        MATCH (p:Product)

        RETURN count(p) AS totalProducts
      }

      // ==========================================
      // Top performer by revenue
      // ==========================================

      CALL {
        MATCH (p:Product)-[:HAS_ORDER]->(o:Order)

        WITH
          p,
          coalesce(
            sum(
              coalesce(o.orderValue, o.revenue, 0)
            ),
            0
          ) AS revenue

        RETURN
          p.name AS topPerformer,
          revenue AS topPerformerRevenue

        ORDER BY revenue DESC

        LIMIT 1
      }

      // ==========================================
      // Average on-time delivery
      // ==========================================

      CALL {
        MATCH (p:Product)-[:HAS_ORDER]->(o:Order)

        WITH
          count(o) AS totalOrders,

          count(
            CASE
              WHEN o.onTimeDelivery = true
              THEN 1
            END
          ) AS onTimeOrders

        RETURN
          CASE
            WHEN totalOrders = 0
            THEN 0.0

            ELSE
              toFloat(onTimeOrders)
              / totalOrders
              * 100
          END AS onTimeAverage
      }

      // ==========================================
      // Average revenue per product
      // ==========================================

      CALL {
        MATCH (p:Product)

        OPTIONAL MATCH (p)-[:HAS_ORDER]->(o:Order)

        WITH
          p,
          coalesce(
            sum(
              coalesce(o.orderValue, o.revenue, 0)
            ),
            0
          ) AS productRevenue

        RETURN
          CASE
            WHEN count(p) = 0
            THEN 0.0

            ELSE
              toFloat(sum(productRevenue))
              / count(p)
          END AS revenuePerProduct
      }

      // ==========================================
      // Most frequently bundled
      // ==========================================

      CALL {
        MATCH (p:Product)

        OPTIONAL MATCH
          (p)-[:BUNDLED_WITH]-(related:Product)

        WITH
          p,
          count(related) AS bundleCount

        RETURN
          p.name AS frequentlyBundled,
          bundleCount

        ORDER BY bundleCount DESC

        LIMIT 1
      }

      // ==========================================
      // Product most exposed to at-risk suppliers
      // ==========================================

      CALL {
        MATCH
          (s:Supplier {flaggedAtRisk: true})
          -[:SUPPLIES]->(p:Product)

        OPTIONAL MATCH
          (p)-[:HAS_ORDER]->(o:Order)

        WITH
          p,
          count(DISTINCT o) AS riskOrderCount

        RETURN
          p.name AS frequentlyFlagged,
          riskOrderCount

        ORDER BY riskOrderCount DESC

        LIMIT 1
      }

      // ==========================================
      // Total products at risk
      // ==========================================

      CALL {
        MATCH
          (s:Supplier {flaggedAtRisk: true})
          -[:SUPPLIES]->(p:Product)

        RETURN
          count(DISTINCT p) AS productsAtRisk
      }

      // ==========================================
      // Final result
      // ==========================================

      RETURN
        totalProducts,
        topPerformer,
        topPerformerRevenue,
        onTimeAverage,
        revenuePerProduct,
        frequentlyBundled,
        bundleCount,
        frequentlyFlagged,
        riskOrderCount,
        productsAtRisk
    `);

      if (result.records.length === 0) {
        throw new Error('Product stats query returned no records');
      }

      const record = result.records[0];

      return {
        totalProducts: toNumber(record.get('totalProducts')),

        topPerformer: {
          name: record.get('topPerformer'),

          revenue: toNumber(record.get('topPerformerRevenue')),
        },

        onTimeAverage: toNumber(record.get('onTimeAverage')),

        revenuePerProduct: toNumber(record.get('revenuePerProduct')),

        frequentlyBundled: {
          name: record.get('frequentlyBundled'),

          count: toNumber(record.get('bundleCount')),
        },

        frequentlyFlaggedAtRisk: {
          name: record.get('frequentlyFlagged'),

          affectedOrders: toNumber(record.get('riskOrderCount')),
        },

        productsAtRisk: toNumber(record.get('productsAtRisk')),
      };
    } catch (error) {
      console.error('Product stats error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  async allProducts(page = 1, limit = 10) {
    const session = driver.session();

    try {
      const skip = (page - 1) * limit;

      const result = await session.run(
        `
    MATCH (p:Product)

OPTIONAL MATCH (p)-[:HAS_ORDER]->(o:Order)

WITH
  p,

  coalesce(sum(o.unitsSold), 0) AS unitsSold,
  coalesce(sum(o.revenue), 0) AS revenue,

  coalesce(
    sum(
      CASE
        WHEN o.purchaseDate >= datetime() - duration({days: 30})
        THEN coalesce(o.orderValue, o.revenue, 0)
        ELSE 0
      END
    ),
    0
  ) AS currentRevenue,

  coalesce(
    sum(
      CASE
        WHEN o.purchaseDate >= datetime() - duration({days: 60})
        AND o.purchaseDate < datetime() - duration({days: 30})
        THEN coalesce(o.orderValue, o.revenue, 0)
        ELSE 0
      END
    ),
    0
  ) AS previousRevenue

OPTIONAL MATCH (s:Supplier)-[:SUPPLIES]->(p)

WITH
  p,
  unitsSold,
  revenue,
  currentRevenue,
  previousRevenue,
  collect(DISTINCT s.flaggedAtRisk) AS supplierRisk

ORDER BY revenue DESC

SKIP $skip
LIMIT $limit

RETURN
  p.id AS id,
  p.name AS name,
  p.sku AS sku,
  p.category AS category,
  unitsSold,
  revenue,

  CASE
    WHEN previousRevenue = 0
    THEN 0

    ELSE
      (
        (currentRevenue - previousRevenue)
        / previousRevenue
      ) * 100
  END AS trend,

  CASE
    WHEN true IN supplierRisk
    THEN 'At Risk'

    WHEN revenue >= 2000000
    THEN 'Top Seller'

    ELSE 'Normal'
  END AS flag
      `,
        {
          skip,
          limit,
        },
      );

      const countResult = await session.run(`
      MATCH (p:Product)
      RETURN count(p) AS total
    `);

      const total = toNumber(countResult.records[0].get('total'));

      return {
        data: result.records.map((record) => ({
          id: record.get('id'),
          name: record.get('name'),
          sku: record.get('sku'),
          category: record.get('category'),

          unitsSold: toNumber(record.get('unitsSold')),

          revenue: toNumber(record.get('revenue')),

          trend: toNumber(record.get('trend')),

          flag: record.get('flag'),
        })),

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('All products error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async productDetails(productId: string) {
    const session = driver.session();

    try {
      const result = await session.run(
        `
      MATCH (p:Product {id: $productId})

      // 
      // Supplier
      // 

      OPTIONAL MATCH (s:Supplier)-[:SUPPLIES]->(p)

      WITH
        p,
        collect(
          DISTINCT CASE
            WHEN s IS NULL THEN null
            ELSE {
              id: s.id,
              name: s.name,
              riskLevel: s.riskLevel
            }
          END
        ) AS supplierList

      // 
      // Frequently bought together
      // 

      CALL {
        WITH p

        MATCH (p)-[b:BUNDLED_WITH]-(related:Product)

        RETURN collect(
          DISTINCT {
            product: related.name,
            sku: related.sku,
            frequency: coalesce(b.frequency, 0)
          }
        ) AS bundles
      }

      // 
      // Top regions
      // 

      CALL {
        WITH p

        MATCH (p)-[:HAS_ORDER]->(o:Order)-[:FROM_REGION]->(r:Region)

        WITH
          r,
          count(o) AS orders

        RETURN
          r.name AS region,
          orders

        ORDER BY orders DESC

        LIMIT 5
      }

      WITH
        p,
        supplierList,
        bundles,
        collect({
          region: region,
          orders: orders
        }) AS topRegions

      // 
      // Product sales
      // 

      OPTIONAL MATCH (p)-[:HAS_ORDER]->(o:Order)

      WITH
        p,
        supplierList,
        bundles,
        topRegions,
        coalesce(sum(o.unitsSold), 0) AS unitsSold,
        coalesce(sum(o.revenue), 0) AS revenue

      // 
      // Final product
      // 

      RETURN {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,

        stockLevel: coalesce(p.stockLevel, 0),
        unitPrice: coalesce(p.unitPrice, 0),

        unitsSold: unitsSold,
        revenue: revenue,

        supplier:
          CASE
            WHEN supplierList[0] IS NULL
            THEN null
            ELSE supplierList[0]
          END,

        frequentlyBoughtTogether: bundles,

        topRegions: topRegions
      } AS product
      `,
        { productId },
      );

      if (result.records.length === 0) {
        console.log('No product found for ID:', productId);
        return null;
      }

      const product = result.records[0].get('product');

      console.log('Product details:', product);

      return product;
    } catch (error) {
      console.error('Product details error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

const productService = new ProductService();

export default productService;
