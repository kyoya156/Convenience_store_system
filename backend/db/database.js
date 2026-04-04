const Database = require('better-sqlite3')
const path     = require('path')

// Store the database file in the db/ folder
const db = new Database(path.join(__dirname, 'store.db'), {
  verbose: console.log 
})

// Performance setting
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

/**
 * MIGRATION: Add image_url if it doesn't exist
 * This prevents the 500 error when the table already exists but lacks the new column.
 */
try {
  db.prepare("ALTER TABLE products ADD COLUMN image_url TEXT").run();
  console.log("✅ Database migration: Added image_url column to products table.");
} catch (err) {
  // If it errors, the column likely already exists, which is fine.
}

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
    image_url   TEXT,     -- Added column
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER  NOT NULL REFERENCES users(id),
    status           TEXT     NOT NULL DEFAULT 'confirmed',
    image_url        TEXT,
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

// Seed data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
if (userCount.count === 0) {
  const bcrypt = require('bcryptjs')

  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@store.com', bcrypt.hashSync('admin123', 10), 'admin')

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, stock, category, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  insertProduct.run('Mineral Water 500ml', 'Fresh mineral water', 0.99, 100, 'drinks', 'https://placehold.co/400x400?text=Water')
  insertProduct.run('Instant Noodles', 'Quick and easy meal', 1.49, 50, 'food', 'https://placehold.co/400x400?text=Noodles')
  insertProduct.run('Green Tea', 'Premium green tea', 2.99, 75, 'drinks', 'https://placehold.co/400x400?text=Green+Tea')
  insertProduct.run('Chocolate Bar', 'Milk chocolate', 1.29, 60, 'snacks', 'https://placehold.co/400x400?text=Chocolate')
  insertProduct.run('White Rice 1kg', 'Jasmine white rice', 3.49, 40, 'food', 'https://placehold.co/400x400?text=Rice')

  console.log('✅ Database seeded successfully')
}

module.exports = db