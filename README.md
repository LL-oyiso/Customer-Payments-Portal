# Customer Payments Portal

A secure international banking payments system built for APDS Part 2.

## Overview

This application allows bank customers to register, log in, and submit international SWIFT payments. Bank staff can log in to verify transactions and submit them to SWIFT for processing.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router + Axios
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) with refresh token rotation
- **Password Hashing:** Argon2id with server-side pepper
- **SSL:** Self-signed certificate (TLS 1.2+)

## Security Features

- Argon2id password hashing with pepper and HaveIBeenPwned breach checking
- Input whitelisting with Joi + express-validator (double-layer)
- HTTPS with TLS 1.2+ and Perfect Forward Secrecy cipher suites
- Helmet security headers (CSP, HSTS, X-Frame-Options DENY, etc.)
- Rate limiting and brute force protection on login
- Role-Based Access Control (RBAC) for customer and staff routes
- SQL injection prevention via Prisma parameterized queries
- CSRF protection via JWT in Authorization header
- Structured security logging with Winston
- DevSecOps pipeline with SAST, SCA, secret scanning, and DAST

## Project Structure

```
Customer-Payments-Portal/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment, DB, SSL configuration
│   │   ├── controllers/    # Auth, transactions, staff controllers
│   │   ├── middleware/     # Auth, RBAC, validation, rate limiting
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic, password, HIBP services
│   │   └── utils/          # Regex validators, crypto helpers, logger
│   ├── prisma/             # Database schema and migrations
│   ├── certs/              # SSL certificate and key (gitignored)
│   └── tests/              # Unit and integration tests
├── frontend/
│   └── src/
│       ├── pages/          # Login, Register, Dashboard, Payment, Staff
│       ├── components/     # ProtectedRoute, RoleGuard, PasswordStrength
│       ├── contexts/       # AuthContext
│       ├── api/            # Axios client with auth interceptor
│       └── utils/          # Client-side regex validators
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipeline
└── README.md
```

## SSL Certificate Details

The SSL certificate was generated using OpenSSL with the following security parameters:

| Parameter | Value |
|---|---|
| Key algorithm | RSA |
| Key size | 4096 bits |
| Signature algorithm | SHA-256 |
| Validity | 365 days (May 1 2026 – May 1 2027) |
| Subject | C=ZA, ST=Gauteng, L=Johannesburg, O=APDS Banking |
| Common Name | localhost |
| Subject Alternative Names | DNS:localhost, IP:127.0.0.1 |

**Generation command:**
```bash
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout server.key -out server.crt \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=APDS Banking/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

Both `server.key` and `server.crt` are stored in `backend/certs/` which is excluded from version control via `.gitignore`. The private key is never committed to GitHub.

The Node.js HTTPS server is configured with:
- Minimum TLS version: TLS 1.2
- Cipher suites: ECDHE-only (Perfect Forward Secrecy)
- HSTS header: `max-age=31536000; includeSubDomains; preload`

## Setup Instructions

Coming soon as the project is built.

## Security Audit Notes
### Known Dependency Vulnerabilities
**@hono/node-server (Moderate - GHSA-92pp-h63x-v22m)**
- Affects: Prisma internal dev tooling only (not production runtime)
- Decision: npm audit fix --force was rejected as it requires a breaking Prisma downgrade
- Risk to production: None - this package is never loaded by our Express API
- Action: Will update when a non-breaking fix is available upstream
