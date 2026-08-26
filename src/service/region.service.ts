import { driver } from '../db/neo4j';
import { toNumber } from './supplier.service';

class RegionService {
  async regionStats() {
    const session = driver.session();

    try {
      const result = await session.run(`
        CALL {
          MATCH (r:Region)
          RETURN count(r) AS totalRegions
        }

        CALL {
          MATCH (o:Order)-[:FROM_REGION]->(r:Region)

          RETURN
            coalesce(sum(o.revenue), 0) AS totalRevenue
        }

        CALL {
          MATCH (o:Order)-[:FROM_REGION]->(r:Region)

          WITH
            r,
            coalesce(sum(o.revenue), 0) AS revenue

          ORDER BY revenue DESC

          LIMIT 1

          RETURN {
            id: r.id,
            name: r.name,
            revenue: revenue
          } AS topPerformingRegion
        }

        CALL {
          MATCH (s:Supplier {flaggedAtRisk: true})
                -[:SUPPLIES]->(p:Product)
                -[:HAS_ORDER]->(o:Order)
                -[:FROM_REGION]->(r:Region)

          RETURN count(DISTINCT r) AS regionsFlagged
        }

        RETURN
          totalRegions,
          totalRevenue,
          topPerformingRegion,
          regionsFlagged
      `);

      if (result.records.length === 0) {
        return {
          totalRegions: 0,
          totalRevenue: 0,
          topPerformingRegion: null,
          regionsFlagged: 0,
        };
      }

      const record = result.records[0];

      return {
        totalRegions: toNumber(record.get('totalRegions')),

        totalRevenue: toNumber(record.get('totalRevenue')),

        topPerformingRegion: record.get('topPerformingRegion'),

        regionsFlagged: toNumber(record.get('regionsFlagged')),
      };
    } catch (error) {
      console.error('Region stats error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async fastestGrowingRegion() {
    const session = driver.session();

    try {
      const result = await session.run(`
        MATCH (r:Region)

        OPTIONAL MATCH
          (current:Order)-[:FROM_REGION]->(r)

        WITH
          r,
          coalesce(
            sum(
              CASE
                WHEN current.purchaseDate >= datetime() - duration({days: 30})
                THEN current.revenue
                ELSE 0
              END
            ),
            0
          ) AS currentRevenue

        OPTIONAL MATCH
          (previous:Order)-[:FROM_REGION]->(r)

        WITH
          r,
          currentRevenue,
          coalesce(
            sum(
              CASE
                WHEN previous.purchaseDate >= datetime() - duration({days: 60})
                AND previous.purchaseDate < datetime() - duration({days: 30})
                THEN previous.revenue
                ELSE 0
              END
            ),
            0
          ) AS previousRevenue

        WITH
          r,
          currentRevenue,
          previousRevenue,

          CASE
            WHEN previousRevenue = 0
            THEN 0

            ELSE
              (
                (currentRevenue - previousRevenue)
                / previousRevenue
              ) * 100
          END AS growth

        ORDER BY growth DESC

        LIMIT 1

        RETURN {
          id: r.id,
          name: r.name,
          currentRevenue: currentRevenue,
          previousRevenue: previousRevenue,
          growth: growth
        } AS fastestGrowingRegion
      `);

      if (result.records.length === 0) {
        return null;
      }

      const data = result.records[0].get('fastestGrowingRegion');

      return {
        id: data.id,
        name: data.name,
        currentRevenue: toNumber(data.currentRevenue),
        previousRevenue: toNumber(data.previousRevenue),
        growth: toNumber(data.growth),
      };
    } catch (error) {
      console.error('Fastest growing region error:', error);

      throw error;
    } finally {
      await session.close();
    }
  }

  async regionalPerformance() {
    const session = driver.session();

    try {
      const result = await session.run(`
        MATCH (r:Region)

        OPTIONAL MATCH
          (o:Order)-[:FROM_REGION]->(r)

        WITH
          r,

          coalesce(
            sum(
              CASE
                WHEN o.purchaseDate >= datetime() - duration({days: 30})
                THEN o.revenue
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
                THEN o.revenue
                ELSE 0
              END
            ),
            0
          ) AS previousRevenue

        OPTIONAL MATCH
          (regionOrder:Order)-[:FROM_REGION]->(r)

        OPTIONAL MATCH
          (regionOrder)<-[:HAS_ORDER]-(p:Product)

        WITH
          r,
          currentRevenue,
          previousRevenue,
          p.category AS category,
          count(regionOrder) AS categoryOrders

        ORDER BY categoryOrders DESC

        WITH
          r,
          currentRevenue,
          previousRevenue,
          collect({
            name: category,
            orders: categoryOrders
          })[0] AS topCategory

        OPTIONAL MATCH
          (customerOrder:Order)-[:FROM_REGION]->(r)

        WITH
          r,
          currentRevenue,
          previousRevenue,
          topCategory,
          count(customerOrder) AS orders

        WITH
          r,
          currentRevenue,
          previousRevenue,
          topCategory,
          orders,

          CASE
            WHEN previousRevenue = 0
            THEN 0

            ELSE
              (
                (currentRevenue - previousRevenue)
                / previousRevenue
              ) * 100
          END AS trend

        RETURN {
          id: r.id,
          name: r.name,
          orders: orders,
          revenue: currentRevenue,
          trend: trend,
          topCategory:
            CASE
              WHEN topCategory IS NULL
              THEN null
              ELSE topCategory.name
            END,
          flag: false
        } AS region

        ORDER BY currentRevenue DESC
      `);

      return result.records.map((record) => {
        const region = record.get('region');

        return {
          id: region.id,
          name: region.name,
          orders: toNumber(region.orders),
          revenue: toNumber(region.revenue),
          trend: toNumber(region.trend),
          topCategory: region.topCategory,
          flag: region.flag,
        };
      });
    } catch (error) {
      console.error('Regional performance error:', error);

      throw error;
    } finally {
      await session.close();
    }
  }

  async regionDetails(regionId: string) {
    const session = driver.session();

    try {
      const result = await session.run(
        `
        MATCH (r:Region {id: $regionId})

        OPTIONAL MATCH
          (o:Order)-[:FROM_REGION]->(r)

        WITH
          r,
          collect(DISTINCT o) AS orders

        WITH
          r,
          orders,
          size(orders) AS orderCount,

          reduce(
            total = 0,
            order IN orders |
            total + coalesce(order.revenue, 0)
          ) AS revenue,

          reduce(
            total = 0,
            order IN orders |
            total + coalesce(order.unitsSold, 0)
          ) AS unitsSold

        UNWIND orders AS order

        OPTIONAL MATCH
          (p:Product)-[:HAS_ORDER]->(order)

        WITH
          r,
          orderCount,
          revenue,
          unitsSold,
          p

        WITH
          r,
          orderCount,
          revenue,
          unitsSold,
          p.category AS category,
          p.name AS product,
          count(p) AS purchaseCount

        ORDER BY purchaseCount DESC

        WITH
          r,
          orderCount,
          revenue,
          unitsSold,
          collect({
            category: category,
            product: product,
            count: purchaseCount
          }) AS ranked

        RETURN {
          name: r.name,

          customers: 0,

          revenue: revenue,

          unitsSold: unitsSold,

          avgOrderValue:
            CASE
              WHEN orderCount = 0
              THEN 0

              ELSE revenue / orderCount
            END,

          topCategory:
            CASE
              WHEN size(ranked) = 0
              THEN null

              ELSE ranked[0].category
            END,

          topProducts:
            [item IN ranked | item.product][0..5]
        } AS region
        `,
        { regionId },
      );

      if (result.records.length === 0) {
        return null;
      }

      const region = result.records[0].get('region');

      return {
        name: region.name,

        customers: toNumber(region.customers),

        revenue: toNumber(region.revenue),

        unitsSold: toNumber(region.unitsSold),

        avgOrderValue: toNumber(region.avgOrderValue),

        topCategory: region.topCategory,

        topProducts: region.topProducts,
      };
    } catch (error) {
      console.error('Region details error:', error);

      throw error;
    } finally {
      await session.close();
    }
  }
}

const regionService = new RegionService();

export default regionService;
