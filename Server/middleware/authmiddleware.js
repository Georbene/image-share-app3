// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.userId = decoded.userId; // Attach user ID to request for later use
      next(); // Good token → proceed to route
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Not authorized - invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized - no token provided' });
  }
};

module.exports = protect;