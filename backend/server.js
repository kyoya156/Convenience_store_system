const express = require('express')
const cors = require('cors')
const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Health check — visit http://localhost:3000/api/health to confirm backend works
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/cart', require('./routes/cart'))

// Global error handler — catches anything that goes wrong in routes
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong' })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})