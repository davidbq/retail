const rateLimit = require('express-rate-limit');

const securityMiddleware = {
  addSecurityHeaders: (req, res, next) => {
    res.removeHeader('X-Powered-By');

    res.setHeader('X-XSS-Protection', '1; mode=block');

    res.setHeader('X-Frame-Options', 'DENY');

    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    res.setHeader('Content-Security-Policy', "default-src 'self'");

    next();
  },

  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  })
};

module.exports = securityMiddleware;
