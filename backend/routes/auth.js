const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db/database')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')
const router = express.Router()

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  // Input validation
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  if (!email?.trim()) return res.status(400).json({ error: 'Email is required' })
  if (!password) return res.status(400).json({ error: 'Password is required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email format' })

  try {
    const hashed = bcrypt.hashSync(password, 10)
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name.trim(), email.trim().toLowerCase(), hashed)

    const user = { id: result.lastInsertRowid, name: name.trim(), email, role: 'customer' }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)

    res.status(201).json({ token, user })
  } catch (err) {
    if (err.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'An account with this email already exists' })
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  const user = db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).get(email.trim().toLowerCase())

  if (!user)
    return res.status(404).json({ error: 'No account found with this email' })

  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Incorrect password' })

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
})

// GET /api/auth/me — get current logged in user
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
  ).get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

module.exports = router