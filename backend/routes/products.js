const express              = require('express')
const db                   = require('../db/database')
const { requireAdmin }     = require('../middleware/auth')
const router               = express.Router()

/**
 * UPDATED: Added 'sort' to query parameters to allow the homepage to sort 
 * by price and newest arrivals as requested.
 */
router.get('/', (req, res) => {
  const { category, search, sort, status } = req.query
  let query = status === 'all' 
    ? "SELECT * FROM products WHERE 1=1" 
    : "SELECT * FROM products WHERE status = 'active'"
  const params = []

  if (category) { query += ' AND category = ?';       params.push(category) }
  if (search)   { query += ' AND name LIKE ?';         params.push(`%${search}%`) }

  // Logic to handle sorting requirements
  if (sort === 'price-low') {
    query += ' ORDER BY price ASC'
  } else if (sort === 'price-high') {
    query += ' ORDER BY price DESC'
  } else {
    query += ' ORDER BY created_at DESC' // Default: Newest first
  }

  res.json(db.prepare(query).all(...params))
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

/**
 * UPDATED: Added 'image_url' to the INSERT statement to support the 
 * high-end visual layout for the homepage.
 */
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body

  if (!name?.trim())      return res.status(400).json({ error: 'Product name is required' })
  if (price === undefined) return res.status(400).json({ error: 'Price is required' })
  if (price < 0)           return res.status(400).json({ error: 'Price cannot be negative' })

  const result = db.prepare(`
    INSERT INTO products (name, description, price, stock, category, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name.trim(), description, price, stock || 0, category, image_url)

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(product)
})

/**
 * UPDATED: Added 'image_url' to the UPDATE statement so Admins can 
 * manage product visuals as required by the Staff/Admin management role.
 */
router.put('/:id', requireAdmin, (req, res) => {
  const { name, description, price, stock, category, status, image_url } = req.body
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Product not found' })

  db.prepare(`
    UPDATE products
    SET name=?, description=?, price=?, stock=?, category=?, status=?, image_url=?
    WHERE id=?
  `).run(
    name        ?? existing.name,
    description ?? existing.description,
    price       ?? existing.price,
    stock       ?? existing.stock,
    category    ?? existing.category,
    status      ?? existing.status,
    image_url   ?? existing.image_url,
    req.params.id
  )

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id))
})

// DELETE /api/products/:id — admin only (soft delete)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Product not found' })

  db.prepare("UPDATE products SET status = 'archived' WHERE id = ?").run(req.params.id)
  res.json({ message: 'Product archived successfully' })
})

module.exports = router