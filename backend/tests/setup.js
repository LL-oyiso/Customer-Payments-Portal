// Test environment variables — set before any module loads so dotenv cannot overwrite them
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-ok'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-32-chars-ok'
process.env.JWT_ACCESS_EXPIRY = '15m'
process.env.JWT_REFRESH_EXPIRY = '7d'
process.env.ARGON2_PEPPER = 'test-pepper-value'
process.env.NODE_ENV = 'test'
process.env.FRONTEND_URL = 'http://localhost:5173'
