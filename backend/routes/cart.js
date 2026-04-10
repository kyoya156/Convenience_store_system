const express = require('express')
const db = require('../db/database')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()

// GET /api/cart
router.get('/', requireAuth, (req, res) => {
    const items = db.prepare(`
    SELECT ci.id,
           ci.product_id as productId,
           p.name,
           p.price as unitPrice,
           ci.quantity
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(req.user.id)

    res.json(items)
})

// POST /api/cart
router.post('/', requireAuth, (req, res) => {
    const { productId, quantity } = req.body

    if (!productId || !quantity)
        return res.status(400).json({ error: 'Missing product or quantity' })

    try {
        db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, product_id)
      DO UPDATE SET quantity = quantity + excluded.quantity
    `).run(req.user.id, productId, quantity)

        res.json({ message: 'Item added to cart' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to add item' })
    }
})

// PUT /api/cart/:productId
router.put('/:productId', requireAuth, (req, res) => {
    const { quantity } = req.body

    db.prepare(`
    UPDATE cart_items
    SET quantity = ?
    WHERE user_id = ? AND product_id = ?
  `).run(quantity, req.user.id, req.params.productId)

    res.json({ message: 'Cart updated' })
})

// DELETE /api/cart/:productId
router.delete('/:productId', requireAuth, (req, res) => {
    db.prepare(`
    DELETE FROM cart_items
    WHERE user_id = ? AND product_id = ?
  `).run(req.user.id, req.params.productId)

    res.json({ message: 'Item removed' })
})

// DELETE /api/cart (clear cart)
router.delete('/', requireAuth, (req, res) => {
    db.prepare(`
    DELETE FROM cart_items WHERE user_id = ?
  `).run(req.user.id)

    res.json({ message: 'Cart cleared' })
})

module.exports = router