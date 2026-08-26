import { driver } from '../db/neo4j';

type Supplier = {
  name: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  flaggedAtRisk: boolean;
};

type Product = {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  stockLevel: number;
};

type Region = {
  name: string;
  country: string;
  countryCode: string;
  currency: string;
};

const suppliers: Supplier[] = [
  {
    name: 'Acme Electronics',
    riskLevel: 'High',
    flaggedAtRisk: true,
  },
  {
    name: 'Global Supply Co.',
    riskLevel: 'Medium',
    flaggedAtRisk: true,
  },
  {
    name: 'TechSource Industries',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Nova Components',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Prime Industrial',
    riskLevel: 'High',
    flaggedAtRisk: true,
  },
  {
    name: 'Vertex Manufacturing',
    riskLevel: 'Medium',
    flaggedAtRisk: true,
  },
  {
    name: 'Apex Distribution',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Orion Technologies',
    riskLevel: 'Medium',
    flaggedAtRisk: false,
  },
  {
    name: 'BluePeak Systems',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Summit Goods',
    riskLevel: 'High',
    flaggedAtRisk: true,
  },
  {
    name: 'Nexus Manufacturing',
    riskLevel: 'Medium',
    flaggedAtRisk: true,
  },
  {
    name: 'Atlas Components',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Quantum Devices',
    riskLevel: 'High',
    flaggedAtRisk: true,
  },
  {
    name: 'Evergreen Supply',
    riskLevel: 'Low',
    flaggedAtRisk: false,
  },
  {
    name: 'Titan Industries',
    riskLevel: 'Medium',
    flaggedAtRisk: true,
  },
];

const regions: Region[] = [
  {
    name: 'West Africa',
    country: 'Nigeria',
    countryCode: 'NG',
    currency: 'NGN',
  },
  {
    name: 'East Africa',
    country: 'Kenya',
    countryCode: 'KE',
    currency: 'KES',
  },
  {
    name: 'Ghana',
    country: 'Ghana',
    countryCode: 'GH',
    currency: 'GHS',
  },
  {
    name: 'South Africa',
    country: 'South Africa',
    countryCode: 'ZA',
    currency: 'ZAR',
  },
  {
    name: 'North Africa',
    country: 'Egypt',
    countryCode: 'EG',
    currency: 'EGP',
  },
  {
    name: 'Morocco',
    country: 'Morocco',
    countryCode: 'MA',
    currency: 'MAD',
  },
  {
    name: 'Western Europe',
    country: 'Germany',
    countryCode: 'DE',
    currency: 'EUR',
  },
  {
    name: 'United Kingdom',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
  },
  {
    name: 'France',
    country: 'France',
    countryCode: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Southern Europe',
    country: 'Italy',
    countryCode: 'IT',
    currency: 'EUR',
  },
  {
    name: 'North America',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
  },
  {
    name: 'Canada',
    country: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
  },
  {
    name: 'South America',
    country: 'Brazil',
    countryCode: 'BR',
    currency: 'BRL',
  },
  {
    name: 'Asia Pacific',
    country: 'Singapore',
    countryCode: 'SG',
    currency: 'SGD',
  },
  {
    name: 'East Asia',
    country: 'Japan',
    countryCode: 'JP',
    currency: 'JPY',
  },
  {
    name: 'Australia',
    country: 'Australia',
    countryCode: 'AU',
    currency: 'AUD',
  },
];

const products: Product[] = [
  {
    sku: 'SKU-28491',
    name: 'Smart Hub X',
    category: 'Electronics',
    unitPrice: 142,
    stockLevel: 142,
  },
  {
    sku: 'SKU-28492',
    name: 'Sensor Pro',
    category: 'Electronics',
    unitPrice: 89,
    stockLevel: 318,
  },
  {
    sku: 'SKU-28493',
    name: 'USB Charging Dock',
    category: 'Electronics',
    unitPrice: 45,
    stockLevel: 521,
  },
  {
    sku: 'SKU-28494',
    name: 'Wall Mount Kit',
    category: 'Logistics Equipment',
    unitPrice: 34,
    stockLevel: 190,
  },
  {
    sku: 'SKU-28495',
    name: 'Industrial Scanner',
    category: 'Logistics Equipment',
    unitPrice: 620,
    stockLevel: 74,
  },
  {
    sku: 'SKU-28496',
    name: 'Barcode Reader Pro',
    category: 'Logistics Equipment',
    unitPrice: 380,
    stockLevel: 121,
  },
  {
    sku: 'SKU-28497',
    name: 'Thermal Printer',
    category: 'Electronics',
    unitPrice: 245,
    stockLevel: 96,
  },
  {
    sku: 'SKU-28498',
    name: 'Wireless Router',
    category: 'Electronics',
    unitPrice: 129,
    stockLevel: 240,
  },
  {
    sku: 'SKU-28499',
    name: 'Cotton Work Jacket',
    category: 'Apparel & Textiles',
    unitPrice: 74,
    stockLevel: 430,
  },
  {
    sku: 'SKU-28500',
    name: 'Safety Gloves',
    category: 'Apparel & Textiles',
    unitPrice: 18,
    stockLevel: 920,
  },
  {
    sku: 'SKU-28501',
    name: 'Industrial Boots',
    category: 'Apparel & Textiles',
    unitPrice: 115,
    stockLevel: 280,
  },
  {
    sku: 'SKU-28502',
    name: 'Medical Monitor',
    category: 'Medicals',
    unitPrice: 1250,
    stockLevel: 42,
  },
  {
    sku: 'SKU-28503',
    name: 'Portable ECG',
    category: 'Medicals',
    unitPrice: 870,
    stockLevel: 31,
  },
  {
    sku: 'SKU-28504',
    name: 'Surgical Light',
    category: 'Medicals',
    unitPrice: 2100,
    stockLevel: 19,
  },
  {
    sku: 'SKU-28505',
    name: 'Ceramic Mug Set',
    category: 'Home Goods',
    unitPrice: 32,
    stockLevel: 620,
  },
  {
    sku: 'SKU-28506',
    name: 'Glass Storage Set',
    category: 'Home Goods',
    unitPrice: 48,
    stockLevel: 410,
  },
  {
    sku: 'SKU-28507',
    name: 'Office Organizer',
    category: 'Home Goods',
    unitPrice: 27,
    stockLevel: 360,
  },
  {
    sku: 'SKU-28508',
    name: 'Smart Watch S2',
    category: 'Electronics',
    unitPrice: 199,
    stockLevel: 155,
  },
  {
    sku: 'SKU-28509',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    unitPrice: 79,
    stockLevel: 310,
  },
  {
    sku: 'SKU-28510',
    name: 'Power Bank 20K',
    category: 'Electronics',
    unitPrice: 59,
    stockLevel: 480,
  },
  {
    sku: 'SKU-28511',
    name: 'LED Work Lamp',
    category: 'Logistics Equipment',
    unitPrice: 65,
    stockLevel: 220,
  },
  {
    sku: 'SKU-28512',
    name: 'Heavy Duty Cart',
    category: 'Logistics Equipment',
    unitPrice: 490,
    stockLevel: 62,
  },
  {
    sku: 'SKU-28513',
    name: 'Safety Helmet',
    category: 'Apparel & Textiles',
    unitPrice: 41,
    stockLevel: 570,
  },
  {
    sku: 'SKU-28514',
    name: 'Protective Goggles',
    category: 'Apparel & Textiles',
    unitPrice: 29,
    stockLevel: 690,
  },
  {
    sku: 'SKU-28515',
    name: 'Patient Monitor Mini',
    category: 'Medicals',
    unitPrice: 680,
    stockLevel: 53,
  },
  {
    sku: 'SKU-28516',
    name: 'Digital Thermometer',
    category: 'Medicals',
    unitPrice: 39,
    stockLevel: 840,
  },
  {
    sku: 'SKU-28517',
    name: 'Wireless Keyboard',
    category: 'Electronics',
    unitPrice: 52,
    stockLevel: 340,
  },
  {
    sku: 'SKU-28518',
    name: 'Wireless Mouse',
    category: 'Electronics',
    unitPrice: 39,
    stockLevel: 470,
  },
  {
    sku: 'SKU-28519',
    name: 'USB-C Hub',
    category: 'Electronics',
    unitPrice: 69,
    stockLevel: 380,
  },
  {
    sku: 'SKU-28520',
    name: 'Travel Adapter',
    category: 'Electronics',
    unitPrice: 31,
    stockLevel: 720,
  },
];

function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  const now = new Date();

  const daysAgo = randomInt(0, 365);

  const date = new Date(now);

  date.setDate(date.getDate() - daysAgo);

  return date;
}

async function seedDatabase() {
  const session = driver.session();

  try {
    console.log('🌱 Starting database seed...');

    /*
     * Clear existing database
     *
     * WARNING:
     * This deletes everything.
     */
    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log('🧹 Existing data cleared');

    /*
     * USERS
     */

    const users = [
      {
        name: 'Courage Nduka',
        email: 'courage@nexora.com',
      },
      {
        name: 'Sarah Mitchell',
        email: 'sarah@nexora.com',
      },
      {
        name: 'David Chen',
        email: 'david@nexora.com',
      },
      {
        name: 'Amelia Brown',
        email: 'amelia@nexora.com',
      },
      {
        name: 'Michael Johnson',
        email: 'michael@nexora.com',
      },
    ];

    await session.run(
      `
      UNWIND $users AS user

      CREATE (:User {
        id: randomUUID(),
        name: user.name,
        email: user.email,
        passwordHash: "demo-password-hash",
        avatarUrl: ""
      })
      `,
      { users },
    );

    console.log(`👤 Created ${users.length} users`);

    /*
     * REGIONS
     */

    await session.run(
      `
      UNWIND $regions AS region

      CREATE (:Region {
        id: randomUUID(),
        name: region.name,
        country: region.country,
        countryCode: region.countryCode,
        currency: region.currency
      })
      `,
      { regions },
    );

    console.log(`🌍 Created ${regions.length} regions`);

    /*
     * SUPPLIERS
     */

    await session.run(
      `
      UNWIND $suppliers AS supplier

      CREATE (:Supplier {
        id: randomUUID(),
        name: supplier.name,
        riskLevel: supplier.riskLevel,
        flaggedAtRisk: supplier.flaggedAtRisk
      })
      `,
      { suppliers },
    );

    console.log(`🏭 Created ${suppliers.length} suppliers`);

    /*
     * PRODUCTS
     */

    await session.run(
      `
      UNWIND $products AS product

      CREATE (:Product {
        id: randomUUID(),
        sku: product.sku,
        name: product.name,
        category: product.category,
        unitPrice: product.unitPrice,
        stockLevel: product.stockLevel
      })
      `,
      { products },
    );

    console.log(`📦 Created ${products.length} products`);

    /*
     * SUPPLIER → PRODUCT
     *
     * Each supplier receives between 3 and 8 products.
     */

    for (const supplier of suppliers) {
      const supplierProducts = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, randomInt(3, 8));

      await session.run(
        `
        MATCH (s:Supplier {name: $supplierName})

        UNWIND $productSkus AS sku

        MATCH (p:Product {sku: sku})

        CREATE (s)-[:SUPPLIES]->(p)
        `,
        {
          supplierName: supplier.name,
          productSkus: supplierProducts.map((p) => p.sku),
        },
      );
    }

    console.log('🔗 Supplier/product relationships created');

    /*
     * ORDERS
     *
     * 3000 orders
     */

    const orderCount = 3000;

    const orders = Array.from({ length: orderCount }, () => {
      const product = random(products);
      const region = random(regions);

      const unitsSold = randomInt(1, 35);

      const revenue = unitsSold * product.unitPrice;

      const purchaseDate = randomDate();

      const statuses = ['Pending', 'Shipped', 'Delivered', 'Delayed'];

      const deliveryStatus = random(statuses);

      let deliveryDate: Date | null = null;

      if (deliveryStatus !== 'Pending') {
        deliveryDate = new Date(purchaseDate);

        deliveryDate.setDate(deliveryDate.getDate() + randomInt(2, 14));
      }

      const onTimeDelivery =
        deliveryStatus === 'Delivered' ? Math.random() > 0.15 : false;

      return {
        productSku: product.sku,
        regionName: region.name,
        unitsSold,
        revenue,
        purchaseDate: purchaseDate.toISOString(),
        deliveryStatus,
        deliveryDate: deliveryDate?.toISOString() ?? null,
        onTimeDelivery,
      };
    });

    const batchSize = 500;

    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);

      await session.run(
        `
        UNWIND $orders AS orderData

        MATCH (p:Product {sku: orderData.productSku})
        MATCH (r:Region {name: orderData.regionName})

        CREATE (o:Order {
          id: randomUUID(),
          unitsSold: orderData.unitsSold,
          revenue: orderData.revenue,
          purchaseDate: datetime(orderData.purchaseDate),
          deliveryStatus: orderData.deliveryStatus,
          deliveryDate:
            CASE
              WHEN orderData.deliveryDate IS NULL
              THEN NULL
              ELSE datetime(orderData.deliveryDate)
            END,
          onTimeDelivery: orderData.onTimeDelivery
        })

        CREATE (p)-[:HAS_ORDER]->(o)

        CREATE (o)-[:FROM_REGION]->(r)
        `,
        { orders: batch },
      );

      console.log(
        `📊 Created orders: ${Math.min(
          i + batchSize,
          orders.length,
        )}/${orders.length}`,
      );
    }

    /*
     * PRODUCT BUNDLES
     *
     * Creates realistic co-purchase relationships.
     */

    const bundlePairs = new Set<string>();

    while (bundlePairs.size < 100) {
      const first = random(products);
      const second = random(products);

      if (first.sku === second.sku) continue;

      const key = `${first.sku}-${second.sku}`;
      const reverseKey = `${second.sku}-${first.sku}`;

      if (bundlePairs.has(key) || bundlePairs.has(reverseKey)) {
        continue;
      }

      bundlePairs.add(key);

      const frequency = randomInt(8, 72);

      await session.run(
        `
        MATCH (p1:Product {sku: $primary})
        MATCH (p2:Product {sku: $related})

        CREATE (p1)-[:BUNDLED_WITH {
          frequency: $frequency
        }]->(p2)
        `,
        {
          primary: first.sku,
          related: second.sku,
          frequency,
        },
      );
    }

    console.log('🛍️ Product bundle relationships created');

    console.log('');
    console.log('✅ DATABASE SEED COMPLETE');
    console.log('');
    console.log(`Users:      ${users.length}`);
    console.log(`Suppliers:  ${suppliers.length}`);
    console.log(`Products:   ${products.length}`);
    console.log(`Regions:    ${regions.length}`);
    console.log(`Orders:     ${orderCount}`);
    console.log(`Bundles:    ${bundlePairs.size}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();
