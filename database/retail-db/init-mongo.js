db = db.getSiblingDB('retail');

db.createCollection('products');
db.createCollection('categories');
db.createCollection('brands');
db.createCollection('suppliers');

db.categories.insertMany([
  { category_id: 'C001', name: 'Rings', parent: null },
  { category_id: 'C002', name: 'Engagement Rings', parent: 'C001' },
  { category_id: 'C003', name: 'Necklaces', parent: null },
  { category_id: 'C004', name: 'Earrings', parent: null },
  { category_id: 'C005', name: 'Bracelets', parent: null }
]);

db.brands.insertMany([
  { brand_id: 'B001', name: 'Elegance', country: 'Italy' },
  { brand_id: 'B002', name: 'Diamond Dreams', country: 'USA' },
  { brand_id: 'B003', name: 'GoldenGlow', country: 'France' }
]);

db.suppliers.insertMany([
  { supplier_id: 'S001', name: 'Precious Gems Co.', contact: 'info@preciousgems.com' },
  { supplier_id: 'S002', name: 'Gold & Silver Traders', contact: 'sales@goldsilver.com' },
  { supplier_id: 'S003', name: 'Luxury Findings Ltd.', contact: 'orders@luxuryfindings.com' }
]);

db.products.insertMany([
  {
    product_id: 'P001',
    name: 'Diamond Solitaire Engagement Ring',
    description: 'Classic 1 carat diamond solitaire in 18k white gold',
    category: { category_id: 'C002', name: 'Engagement Rings' },
    brand: { brand_id: 'B002', name: 'Diamond Dreams' },
    supplier: { supplier_id: 'S001', name: 'Precious Gems Co.' },
    attributes: [
      { name: 'Metal', value: '18k White Gold' },
      { name: 'Diamond Carat', value: '1.0' },
      { name: 'Diamond Clarity', value: 'VS1' },
      { name: 'Diamond Color', value: 'F' }
    ],
    price: {
      current: 4999.99,
      currency: 'USD',
      history: [
        { price: 5299.99, date: new Date('2023-01-01') },
        { price: 4999.99, date: new Date('2023-06-01') }
      ]
    },
    stock: {
      quantity: 10,
      lastUpdated: new Date()
    }
  },
  {
    product_id: 'P002',
    name: 'Pearl Strand Necklace',
    description: 'Elegant 18-inch strand of Akoya pearls',
    category: { category_id: 'C003', name: 'Necklaces' },
    brand: { brand_id: 'B001', name: 'Elegance' },
    supplier: { supplier_id: 'S003', name: 'Luxury Findings Ltd.' },
    attributes: [
      { name: 'Pearl Type', value: 'Akoya' },
      { name: 'Length', value: '18 inches' },
      { name: 'Clasp', value: '14k White Gold' },
      { name: 'Pearl Size', value: '7-7.5mm' }
    ],
    price: {
      current: 1299.99,
      currency: 'USD',
      history: [
        { price: 1399.99, date: new Date('2023-01-01') },
        { price: 1299.99, date: new Date('2023-07-01') }
      ]
    },
    stock: {
      quantity: 15,
      lastUpdated: new Date()
    }
  },
  {
    product_id: 'P003',
    name: 'Gold Hoop Earrings',
    description: 'Classic 14k gold hoop earrings',
    category: { category_id: 'C004', name: 'Earrings' },
    brand: { brand_id: 'B003', name: 'GoldenGlow' },
    supplier: { supplier_id: 'S002', name: 'Gold & Silver Traders' },
    attributes: [
      { name: 'Metal', value: '14k Yellow Gold' },
      { name: 'Diameter', value: '30mm' },
      { name: 'Style', value: 'Hoop' }
    ],
    price: {
      current: 299.99,
      currency: 'USD',
      history: [
        { price: 349.99, date: new Date('2023-01-01') },
        { price: 299.99, date: new Date('2023-05-01') }
      ]
    },
    stock: {
      quantity: 25,
      lastUpdated: new Date()
    }
  }
]);

// Create indexes
db.products.createIndex({ "product_id": 1 });
db.products.createIndex({ "category.category_id": 1 });
db.products.createIndex({ "brand.brand_id": 1 });
db.products.createIndex({ "supplier.supplier_id": 1 });
db.products.createIndex({ "stock.quantity": 1 });

console.log("Retail database for jewelry store initialized with sample data and indexes.");
