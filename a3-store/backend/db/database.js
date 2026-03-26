const Database = require('better-sqlite3')
const path     = require('path')

// Store the database file in the db/ folder
const db = new Database(path.join(__dirname, 'store.db'), {
  verbose: console.log   // logs every SQL query — helpful while learning, remove in production
})

// Performance setting
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')   // enforce foreign key constraints

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    name       TEXT     NOT NULL,
    email      TEXT     NOT NULL UNIQUE,
    password   TEXT     NOT NULL,
    role       TEXT     NOT NULL DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    description TEXT,
    price       REAL     NOT NULL CHECK(price >= 0),
    stock       INTEGER  NOT NULL DEFAULT 0 CHECK(stock >= 0),
    category    TEXT,
    status      TEXT     NOT NULL DEFAULT 'active',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER  NOT NULL REFERENCES users(id),
    status           TEXT     NOT NULL DEFAULT 'confirmed',
    total            REAL     NOT NULL,
    delivery_address TEXT     NOT NULL,
    notes            TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL    NOT NULL
  );
`)

// Seed an admin account and some products if the DB is fresh
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
if (userCount.count === 0) {
  const bcrypt = require('bcryptjs')

  // Default admin account
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@store.com', bcrypt.hashSync('admin123', 10), 'admin')

  // Sample products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, stock, category)
    VALUES (?, ?, ?, ?, ?)
  `)

  insertProduct.run('Mineral Water 500ml', 'Fresh mineral water', 0.99,  100, 'drinks')
  insertProduct.run('Instant Noodles',     'Quick and easy meal',  1.49,  50,  'food')
  insertProduct.run('Green Tea',           'Premium green tea',    2.99,  75,  'drinks')
  insertProduct.run('Chocolate Bar',       'Milk chocolate',       1.29,  60,  'snacks')
  insertProduct.run('White Rice 1kg',      'Jasmine white rice',   3.49,  40,  'food')

  console.log('✅ Database seeded with admin account and sample products')
  console.log('   Admin login: admin@store.com / admin123')
}

module.exports = db