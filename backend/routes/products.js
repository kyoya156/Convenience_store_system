const express              = require('express')
const db                   = require('../db/database')
const { requireAdmin }     = require('../middleware/auth')
const router               = express.Router()

// GET /api/products
router.get('/', (req, res) => {
  const { category, search, status } = req.query
  let   query  = "SELECT * FROM products WHERE status = 'active'"
  const params = []

  if (category) { query += ' AND category = ?';       params.push(category) }
  if (search)   { query += ' AND name LIKE ?';         params.push(`%${search}%`) }

  query += ' ORDER BY created_at DESC'
  res.json(db.prepare(query).all(...params))
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

// POST /api/products — admin only
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, stock, category } = req.body

  if (!name?.trim())      return res.status(400).json({ error: 'Product name is required' })
  if (price === undefined) return res.status(400).json({ error: 'Price is required' })
  if (price < 0)          return res.status(400).json({ error: 'Price cannot be negative' })

  const result = db.prepare(`
    INSERT INTO products (name, description, price, stock, category)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), description, price, stock || 0, category)

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(product)
})

// PUT /api/products/:id — admin only
router.put('/:id', requireAdmin, (req, res) => {
  const { name, description, price, stock, category, status } = req.body
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Product not found' })

  db.prepare(`
    UPDATE products
    SET name=?, description=?, price=?, stock=?, category=?, status=?
    WHERE id=?
  `).run(
    name        ?? existing.name,
    description ?? existing.description,
    price       ?? existing.price,
    stock       ?? existing.stock,
    category    ?? existing.category,
    status      ?? existing.status,
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