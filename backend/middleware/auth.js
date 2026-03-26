const jwt = require('jsonwebtoken')

const JWT_SECRET = 'swe30003-a3-store-secret'   // hardcoded for now, fine for assignment

function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const token = header.split(' ')[1]
    req.user    = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET }