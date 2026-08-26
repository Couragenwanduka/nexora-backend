import { driver } from '../db/neo4j';

export const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;

  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof (value as { toNumber: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value);
};

class SupplierService {
  async suppliersAtRiskCount() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)
      WHERE s.flaggedAtRisk = true
      RETURN count(s) AS count
    `);

      return Number(result.records[0].get('count'));
    } catch (error) {
      console.error('Suppliers at risk error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async criticalSuppliersCount() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)
      WHERE s.flaggedAtRisk = true
        AND s.riskLevel = "High"
      RETURN count(s) AS count
    `);

      return Number(result.records[0].get('count'));
    } catch (error) {
      console.error('Critical suppliers error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async ordersAtRisk() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)-[:SUPPLIES]->(p:Product)-[:HAS_ORDER]->(o:Order)
      WHERE s.flaggedAtRisk = true
      RETURN count(DISTINCT o) AS count
    `);

      return Number(result.records[0].get('count'));
    } catch (error) {
      console.error('Orders at risk error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async revenueAtRisk() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)-[:SUPPLIES]->(p:Product)-[:HAS_ORDER]->(o:Order)

      WHERE s.flaggedAtRisk = true

      RETURN coalesce(sum(o.revenue), 0) AS revenue
    `);

      return Number(result.records[0].get('revenue'));
    } catch (error) {
      console.error('Revenue at risk error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async supplierRiskTrend() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)-[:SUPPLIES]->(p:Product)-[:HAS_ORDER]->(o:Order)

      WHERE s.flaggedAtRisk = true

      WITH
        o.purchaseDate.year AS year,
        o.purchaseDate.month AS month,

        count(
          CASE
            WHEN o.deliveryStatus IN ["Pending", "Shipped", "Delayed"]
            THEN 1
          END
        ) AS active,

        count(
          CASE
            WHEN o.deliveryStatus = "Delivered"
            THEN 1
          END
        ) AS resolved

      RETURN
        year,
        month,
        active,
        resolved

      ORDER BY year, month
    `);

      return result.records.map((record) => {
        const year = Number(record.get('year'));
        const month = Number(record.get('month'));

        const date = new Date(year, month - 1);

        return {
          year,
          month,
          label: date.toLocaleString('en-US', {
            month: 'short',
          }),
          active: Number(record.get('active')),
          resolved: Number(record.get('resolved')),
        };
      });
    } catch (error) {
      console.error('Supplier risk trend error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async riskDistribution() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)

      RETURN
        s.riskLevel AS level,
        count(s) AS count

      ORDER BY
        CASE s.riskLevel
          WHEN "High" THEN 1
          WHEN "Medium" THEN 2
          WHEN "Low" THEN 3
          ELSE 4
        END
    `);

      return result.records.map((record) => ({
        level: record.get('level'),
        count: Number(record.get('count')),
      }));
    } catch (error) {
      console.error('Risk distribution error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async atRiskSupplierDetails() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (s:Supplier)
      WHERE s.flaggedAtRisk = true

      // 
      // Supplier products + orders
      // 
      OPTIONAL MATCH (s)-[:SUPPLIES]->(p:Product)
      OPTIONAL MATCH (p)-[:HAS_ORDER]->(o:Order)

      WITH
        s,
        collect(DISTINCT p) AS products,
        collect(DISTINCT o) AS orders

      // 
      // Regional exposure
      //
      // Order -> Region
      // 
      CALL {
        WITH s

        MATCH (s)-[:SUPPLIES]->(p:Product)
              -[:HAS_ORDER]->(o:Order)
              -[:FROM_REGION]->(r:Region)

        WITH
          r,
          count(DISTINCT o) AS orderCount,
          coalesce(
            sum(coalesce(o.orderValue, o.revenue, 0)),
            0
          ) AS revenue,
          coalesce(
            sum(coalesce(o.unitsSold, 0)),
            0
          ) AS units

        RETURN collect({
          region: r.name,
          country: r.country,
          orders: orderCount,
          revenue: revenue,
          units: units
        }) AS regionOrders
      }

      // 
      // Category exposure
      //
      // Product -> Category
      // 
      CALL {
  WITH s

  MATCH (s)-[:SUPPLIES]->(p:Product)
        -[:HAS_ORDER]->(o:Order)

  WITH
    p.category AS category,
    count(DISTINCT o) AS orderCount,
    count(
      DISTINCT CASE
        WHEN o.deliveryStatus = "Delayed"
        THEN o
      END
    ) AS delayedOrders,
    coalesce(
      sum(coalesce(o.orderValue, o.revenue, 0)),
      0
    ) AS revenue

  RETURN collect({
    category: category,
    orders: orderCount,
    delayedOrders: delayedOrders,
    revenue: revenue
  }) AS categories
}

      // 
      // Final supplier details
      // 
      RETURN
        s.id AS id,
        s.name AS name,
        s.riskLevel AS riskLevel,

        size(products) AS productCount,

        size([
          order IN orders
          WHERE order IS NOT NULL
        ]) AS orderCount,

        size([
          order IN orders
          WHERE order IS NOT NULL
            AND order.deliveryStatus IN [
              "Pending",
              "Shipped",
              "Delayed"
            ]
        ]) AS activeOrders,

        coalesce(
          reduce(
            total = 0.0,
            order IN orders |
            total +
              coalesce(order.orderValue, order.revenue, 0)
          ),
          0.0
        ) AS revenue,

        CASE
          WHEN size([
            order IN orders
            WHERE order IS NOT NULL
          ]) = 0
          THEN 0.0

          ELSE
            reduce(
              total = 0.0,
              order IN orders |
              total +
                coalesce(order.orderValue, order.revenue, 0)
            )
            /
            size([
              order IN orders
              WHERE order IS NOT NULL
            ])
        END AS averageOrder,

        CASE
          WHEN size([
            order IN orders
            WHERE order IS NOT NULL
              AND order.deliveryStatus = "Delivered"
          ]) = 0
          THEN 0.0

          ELSE
            (
              100.0 *
              size([
                order IN orders
                WHERE order IS NOT NULL
                  AND order.deliveryStatus = "Delivered"
                  AND order.onTimeDelivery = true
              ])
              /
              size([
                order IN orders
                WHERE order IS NOT NULL
                  AND order.deliveryStatus = "Delivered"
              ])
            )
        END AS onTimeDelivery,

        regionOrders,
        categories
    `);

      return result.records.map((record) => ({
        id: record.get('id'),
        name: record.get('name'),
        riskLevel: record.get('riskLevel'),

        productCount: toNumber(record.get('productCount')),
        orderCount: toNumber(record.get('orderCount')),
        activeOrders: toNumber(record.get('activeOrders')),

        averageOrder: toNumber(record.get('averageOrder')),
        onTimeDelivery: toNumber(record.get('onTimeDelivery')),
        revenue: toNumber(record.get('revenue')),

        regions: (record.get('regionOrders') ?? []).map((region: any) => ({
          region: region.region,
          country: region.country,
          orders: toNumber(region.orders),
          revenue: toNumber(region.revenue),
          units: toNumber(region.units),
        })),

        categories: (record.get('categories') ?? []).map((category: any) => ({
          category: category.category,
          orders: toNumber(category.orders),
          delayedOrders: toNumber(category.delayedOrders),
          revenue: toNumber(category.revenue),
        })),
      }));
    } catch (error) {
      console.error('At-risk supplier details error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async supplierRegionExposure(supplierId: string) {
    const session = driver.session();
    const result = await session.run(
      `
    MATCH (s:Supplier {id: $supplierId})
          -[:SUPPLIES]->(p:Product)
          <-[:FOR_PRODUCT]-(o:Order)
          -[:IN_REGION]->(r:Region)

    RETURN
      r.name AS region,
      r.country AS country,
      count(o) AS orders,
      coalesce(sum(o.orderValue), 0) AS revenue,
      coalesce(sum(o.unitsSold), 0) AS units

    ORDER BY orders DESC
    `,
      { supplierId },
    );

    return result.records.map((record) => ({
      region: record.get('region'),
      country: record.get('country'),
      orders: record.get('orders').toNumber(),
      revenue: record.get('revenue').toNumber(),
      units: record.get('units').toNumber(),
    }));
  }
  async supplierRiskByCategory(supplierId: string) {
    const session = driver.session();
    const result = await session.run(
      `
    MATCH (s:Supplier {id: $supplierId})
          -[:SUPPLIES]->(p:Product)
          <-[:FOR_PRODUCT]-(o:Order)

    WITH
      p.category AS category,
      count(o) AS orders,
      count(CASE
        WHEN o.deliveryStatus = 'Delayed'
        THEN 1
      END) AS delayedOrders,
      coalesce(sum(o.orderValue), 0) AS revenue

    RETURN
      category,
      orders,
      delayedOrders,
      revenue

    ORDER BY delayedOrders DESC
    `,
      { supplierId },
    );

    return result.records.map((record) => ({
      category: record.get('category'),
      orders: record.get('orders').toNumber(),
      delayedOrders: record.get('delayedOrders').toNumber(),
      revenue: record.get('revenue').toNumber(),
    }));
  }
  async supplierGrowthRate(supplierId: string) {
    const session = driver.session();
    const result = await session.run(
      `
    MATCH (s:Supplier {id: $supplierId})
          -[:SUPPLIES]->(p:Product)
          <-[:FOR_PRODUCT]-(o:Order)

    WITH
      sum(
        CASE
          WHEN o.purchaseDate >= datetime() - duration({days: 30})
          THEN o.orderValue
          ELSE 0
        END
      ) AS currentRevenue,

      sum(
        CASE
          WHEN o.purchaseDate >= datetime() - duration({days: 60})
           AND o.purchaseDate < datetime() - duration({days: 30})
          THEN o.orderValue
          ELSE 0
        END
      ) AS previousRevenue

    RETURN
      currentRevenue,
      previousRevenue,

      CASE
        WHEN previousRevenue = 0 THEN 0
        ELSE ((currentRevenue - previousRevenue) / previousRevenue) * 100
      END AS growthRate
    `,
      { supplierId },
    );

    const record = result.records[0];

    return {
      currentRevenue: record.get('currentRevenue').toNumber(),
      previousRevenue: record.get('previousRevenue').toNumber(),
      growthRate: record.get('growthRate'),
    };
  }
  async supplierPerformance(supplierId: string) {
    const session = driver.session();
    const result = await session.run(
      `
    MATCH (s:Supplier)-[:SUPPLIES]->(p:Product)
          <-[:FOR_PRODUCT]-(o:Order)

    WITH
      s,
      sum(o.orderValue) AS revenue

    WITH
      collect({
        id: s.id,
        name: s.name,
        revenue: revenue
      }) AS suppliers

    UNWIND suppliers AS supplier

    WITH
      supplier,
      suppliers

    WITH
      supplier,
      size(suppliers) AS totalSuppliers,
      size([
        x IN suppliers
        WHERE x.revenue > supplier.revenue
      ]) AS suppliersAbove

    RETURN
      supplier.id AS id,
      supplier.name AS name,
      supplier.revenue AS revenue,
      toFloat(suppliersAbove + 1) / totalSuppliers * 100 AS percentile
    `,
      { supplierId },
    );
  }
}

const supplierService = new SupplierService();

export default supplierService;
