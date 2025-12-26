const jwt = require('jsonwebtoken');

function jwtCheck(secret) {
    return function (req, res, next) {
      const { token } = req.query;

      if (!token) {
        return res.status(401).json({ error: 'Token is required' });
      }

      try {
        jwt.verify(token, secret);
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Token verification failed' });
      }
    }
}

module.exports = jwtCheck;
