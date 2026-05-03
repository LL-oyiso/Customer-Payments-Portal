# RAND — Customer Payments Portal

A secure international banking payments system built for APDS Part 2.

![CI/CD Pipeline](https://github.com/LL-oyiso/Customer-Payments-Portal/actions/workflows/ci.yml/badge.svg)

---

## Overview

RAND is a full-stack secure banking portal that allows customers to register, log in, and submit international SWIFT payments. Bank staff can log in separately to verify transactions and forward them to SWIFT for processing. The system is built with security-first principles throughout the entire stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + React Router + Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT (15-min access token + 7-day refresh token rotation) |
| Password Hashing | Argon2id with server-side pepper |
| Transport Security | TLS 1.2+ with ECDHE cipher suites (Perfect Forward Secrecy) |
| DevSecOps | GitHub Actions CI/CD with SAST, SCA, Secret Scanning, DAST |

---

## Rubric Security Controls

### 1. Password Security — Exceeds Standard

| Control | Implementation | Reference |
|---|---|---|
| Argon2id hashing | `backend/src/services/passwordService.js` | OWASP Password Storage Cheat Sheet |
| Server-side pepper | `ARGON2_PEPPER` env variable prepended before hash | Iron-Clad Java Ch.2 |
| HaveIBeenPwned breach check | k-anonymity API — only first 5 chars of SHA-1 sent | HIBP API v3 |
| Password strength meter | zxcvbn library — score 0–4 shown on register page | Dropbox zxcvbn |
| Minimum 12 characters | Enforced client-side (regex) and server-side (validator) | NIST SP 800-63B |
| Constant-time comparison | Argon2 verify always runs even if user not found | Iron-Clad Java Ch.2 |
| Generic error messages | Login never reveals whether username exists | Account Enumeration Prevention |
| Account lockout | rate-limiter-flexible — 5 attempts per 15 min, 1-hour block | OWASP Brute Force Prevention |

### 2. Input Whitelisting — Exceeds Standard

| Control | Implementation | Reference |
|---|---|---|
| Whitelist-only regex | All fields validated against strict patterns — reject if no match | Iron-Clad Java Ch.4 |
| ISO 4217 currency codes | Whitelist of 26 allowed codes only | ISO Standard 4217 |
| ISO 9362 SWIFT/BIC codes | Regex `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/` | ISO Standard 9362 |
| SA ID number validation | 13 digits, rejects all-zero IDs | SA ID Format Specification |
| SA bank account number | 7–11 digit whitelist regex | Banking standard |
| Double-layer validation | express-validator (backend) + client-side regex (frontend) | Defense in depth |
| HPP prevention | `hpp` middleware strips duplicate query parameters | OWASP HPP |
| Body size limits | 100kb max request size | DoS prevention |
| ReDoS mitigation | All regex patterns anchored with `^$` and bounded quantifiers | OWASP ReDoS |

### 3. Securing Data in Transit — Exceeds Standard

| Control | Implementation | Reference |
|---|---|---|
| Self-signed certificate | RSA 4096-bit key, SHA-256, with SAN (DNS + IP) | OpenSSL |
| TLS 1.2+ enforced | `minVersion: 'TLSv1.2'` in server config | OWASP TLS Cheat Sheet |
| ECDHE-only cipher suites | Perfect Forward Secrecy — past sessions safe if key compromised | RFC 7919 |
| HTTP → HTTPS redirect | Separate HTTP server on port 5001 redirects all traffic | OWASP HTTPS |
| HSTS preload | `max-age=31536000; includeSubDomains; preload` | RFC 6797 |
| Conditional HTTPS in dev | Vite dev server uses same certs as backend | Consistent security model |

**SSL Certificate Details:**

| Parameter | Value |
|---|---|
| Key algorithm | RSA 4096-bit |
| Signature algorithm | SHA-256 |
| Validity | 365 days (May 1 2026 – May 1 2027) |
| Subject | C=ZA, ST=Gauteng, L=Johannesburg, O=APDS Banking |
| Subject Alternative Names | DNS:localhost, IP:127.0.0.1 |

### 4. Protecting Against Attacks — Exceeds Standard

| Attack | Control | Implementation |
|---|---|---|
| Brute Force | Rate limiting + account lockout | `rate-limiter-flexible` — 5 attempts/15 min |
| XSS | React JSX auto-escaping + DOMPurify available | No `dangerouslySetInnerHTML` used |
| Clickjacking | X-Frame-Options DENY | Helmet `frameguard: { action: 'deny' }` |
| CSRF | JWT in Authorization header (not cookie) | Stateless auth model |
| SQL Injection | Prisma parameterized queries | ORM — no raw SQL |
| IDOR | Ownership check on every transaction endpoint | `customerId === req.user.id` |
| Session Hijacking | Short-lived JWT (15 min) + refresh token rotation | Token revocation on logout |
| Information Disclosure | Generic errors, no stack traces in responses | `errorHandler.js` |
| Account Enumeration | Identical messages for all auth failures | Iron-Clad Java Ch.2 |
| HPP | `hpp` middleware | Express middleware |
| MITM | TLS 1.2+ ECDHE-only, HSTS preload | Transport layer |
| ReDoS | Bounded, anchored regex patterns | OWASP ReDoS |
| CSP | Content-Security-Policy via Helmet | Prevents inline script injection |
| COOP/COEP | Cross-Origin-Opener/Embedder-Policy headers | Spectre mitigation |
| Referrer Leakage | Referrer-Policy: no-referrer | Privacy and security |
| Role Escalation | RBAC middleware on every route | `requireCustomer` / `requireStaff` |
| Audit Logging | All auth and transaction events logged | Winston structured logging |

### 5. DevSecOps Pipeline — Exceeds Standard

| Tool | Type | What it checks |
|---|---|---|
| Gitleaks | Secret Scanning | Passwords, API keys, tokens in commit history |
| ESLint + eslint-plugin-security | SAST | Insecure code patterns in Node.js source |
| ESLint (React) | SAST | Hook violations, unsafe patterns in React |
| npm audit | SCA | Known CVEs in all third-party dependencies |
| GitHub CodeQL | SAST (Advanced) | Data flow analysis — XSS, injection, path traversal |
| Build Verification | CI | Confirms frontend compiles and artifact is produced |
| OWASP ZAP | DAST | OWASP Top 10 scan against running application |

Pipeline triggers on every push to `main` and every pull request.

---

## Default Credentials (Development Only)

| Role | Username | Account Number | Password |
|---|---|---|---|
| Staff | `staff01` | `10000001` | `StaffSecure@2026!` |
| Staff | `staff02` | `10000002` | `StaffSecure@2026!` |

> Customers register themselves at `/register`

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL 18
- OpenSSL (for certificate generation)

### 1. Clone and install
```bash
git clone https://github.com/LL-oyiso/Customer-Payments-Portal.git
cd Customer-Payments-Portal
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Fill in your PostgreSQL password, JWT secrets, and Argon2 pepper
```

### 3. Generate SSL certificates
```bash
cd backend/certs
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout server.key -out server.crt \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=APDS Banking/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

### 4. Set up database
```bash
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

### 5. Run the application
```bash
# Terminal 1 — Backend (HTTPS on port 5000)
cd backend && npm start

# Terminal 2 — Frontend (HTTPS on port 5173)
cd frontend && npm run dev
```

Open **`https://localhost:5173`** in your browser.

---

## Security Audit Notes

### Known Dependency Vulnerabilities
**@hono/node-server (Moderate - GHSA-92pp-h63x-v22m)**
- Affects: Prisma internal dev tooling only — not production runtime
- Decision: `npm audit fix --force` rejected as it requires a breaking Prisma downgrade
- Risk to production: None — this package is never loaded by the Express API
- Action: Will update when a non-breaking fix is available upstream
