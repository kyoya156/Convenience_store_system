const express          = require('express')
const db               = require('../db/database')
const { requireAuth }  = require('../middleware/auth')
const router           = express.Router()

// POST /api/orders
router.post('/', requireAuth, (req, res) => {
  const { items, deliveryAddress, notes } = req.body

  if (!items?.length)   return res.status(400).json({ error: 'Cart is empty' })
  if (!deliveryAddress) return res.status(400).json({ error: 'Delivery address is required' })

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const placeOrder = db.transaction(() => {
    const order = db.prepare(`
      INSERT INTO orders (user_id, total, delivery_address, notes)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, total, deliveryAddress, notes || null)

    const insertItem  = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `)
    const deductStock = db.prepare(`
      UPDATE products SET stock = stock - ?
      WHERE id = ? AND stock >= ?
    `)

    for (const item of items) {
      insertItem.run(order.lastInsertRowid, item.productId, item.quantity, item.unitPrice)
      const result = deductStock.run(item.quantity, item.productId, item.quantity)
      if (result.changes === 0)
        throw new Error(`Not enough stock for product ID ${item.productId}`)
    }

    return order.lastInsertRowid
  })

  try {
    const orderId = placeOrder()
    res.status(201).json({ orderId, message: 'Order placed successfully. Payment simulated ✓' })
  } catch (err) {
    res.status(409).json({ error: err.message })
  }
})

// GET /api/orders — current user's orders
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*,
           json_group_array(json_object(
             'id',        oi.id,
             'productId', oi.product_id,
             'name',      p.name,
             'quantity',  oi.quantity,
             'unitPrice', oi.unit_price
           )) as items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON p.id = oi.product_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user.id)

  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })))
})

// GET /api/orders/:id
router.get('/:id', requireAuth, (req, res) => {
  const order = db.prepare(`
    SELECT o.*,
           json_group_array(json_object(
             'productId', oi.product_id,
             'name',      p.name,
             'quantity',  oi.quantity,
             'unitPrice', oi.unit_price
           )) as items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON p.id = oi.product_id
    WHERE o.id = ? AND o.user_id = ?
    GROUP BY o.id
  `).get(req.params.id, req.user.id)

  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json({ ...order, items: JSON.parse(order.items) })
})

module.exports = router