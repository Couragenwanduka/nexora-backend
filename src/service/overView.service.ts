import { driver } from '../db/neo4j';

class OverViewSerivce {
  async overViewStat() {
    const session = driver.session();

    try {
      const result = await session.run(`
      CALL {
        MATCH (u:User)
        RETURN count(u) AS customers
      }

      CALL {
        MATCH (p:Product)
        RETURN count(p) AS products
      }

      CALL {
        MATCH (s:Supplier)
        RETURN count(s) AS suppliers
      }

      RETURN
        customers,
        products,
        suppliers
    `);

      const record = result.records[0];

      return {
        customers: record.get('customers').toNumber(),
        products: record.get('products').toNumber(),
        suppliers: record.get('suppliers').toNumber(),
      };
    } catch (error) {
      console.error('Dashboard overview error:', error);
      throw error;
    }
  }

  async revenueAndOrder() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (o:Order)

      WITH
        date(datetime(o.purchaseDate)) AS orderDate,
        o

      RETURN
        orderDate.year AS year,
        orderDate.month AS month,
        coalesce(sum(o.revenue), 0) AS revenue,
        count(o) AS orders

      ORDER BY year, month
    `);

      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      return result.records.map((record) => {
        const year = Number(record.get('year'));
        const month = Number(record.get('month'));

        return {
          year,
          month,
          label: months[month - 1],
          revenue: Number(record.get('revenue')),
          orders: Number(record.get('orders')),
        };
      });
    } catch (error) {
      console.error('Dashboard revenue and order error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  async salesByCategory() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (p:Product)-[:HAS_ORDER]->(o:Order)

      WITH
        p.category AS category,
        sum(o.revenue) AS revenue,
        sum(o.unitsSold) AS unitsSold

      RETURN
        category,
        revenue,
        unitsSold

      ORDER BY revenue DESC
    `);

      return result.records.map((record) => ({
        category: record.get('category'),
        revenue: Number(record.get('revenue')),
        unitsSold: Number(record.get('unitsSold')),
      }));
    } catch (error) {
      console.error('Dashboard salesByCategory error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  async supplierAtRisk() {
    try {
      const session = driver.session();

      const result = await session.run(`
      MATCH (s:Supplier)
      WHERE s.flaggedAtRisk = true

      OPTIONAL MATCH (s)-[:SUPPLIES]->(p:Product)

      RETURN
        s.id AS id,
        s.name AS supplier,
        s.riskLevel AS severity,
        collect(DISTINCT p.name)[0] AS risk
      ORDER BY
        CASE s.riskLevel
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END
    `);

      return result.records.map((record) => ({
        id: record.get('id'),
        supplier: record.get('supplier'),
        risk: record.get('risk') ?? 'Supplier risk',
        severity: record.get('severity'),
        status: 'Active',
      }));
    } catch (error) {
      console.error('Dashboard supplierAtRisk error:', error);
      throw error;
    }
  }
  async topProduct() {
    const session = driver.session();

    try {
      const result = await session.run(`
      MATCH (p:Product)-[:HAS_ORDER]->(o:Order)

      WITH
        p,
        sum(o.unitsSold) AS unitsSold,
        sum(coalesce(o.revenue, 0)) AS revenue

      RETURN
        p.id AS id,
        p.name AS product,
        p.sku AS sku,
        p.category AS category,
        p.imageUrl AS image,
        unitsSold,
        revenue

      ORDER BY unitsSold DESC
      LIMIT 10
    `);

      return result.records.map((record) => ({
        id: record.get('id'),
        product: record.get('product'),
        sku: record.get('sku'),
        category: record.get('category'),
        image: record.get('image'),

        unitsSold: Number(record.get('unitsSold')),
        revenue: Number(record.get('revenue')),
      }));
    } catch (error) {
      console.error('Dashboard topProduct error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

const overViewService = new OverViewSerivce();

export default overViewService;
