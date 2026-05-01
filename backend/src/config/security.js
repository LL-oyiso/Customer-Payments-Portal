const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const { RateLimiterMemory } = require('rate-limiter-flexible')

// Helmet - sets all security HTTP headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
})

// CORS - only allow requests from the React frontend
const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600,
})

// General rate limiter - 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

// Strict rate limiter for auth endpoints - 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
})

// Brute force protection - progressive delays after failed logins
const loginBruteForce = new RateLimiterMemory({
  points: 5,        // 5 attempts
  duration: 60 * 15, // per 15 minutes
  blockDuration: 60 * 60, // block for 1 hour after limit exceeded
})

module.exports = {
  helmetConfig,
  corsConfig,
  generalLimiter,
  authLimiter,
  loginBruteForce,
}
