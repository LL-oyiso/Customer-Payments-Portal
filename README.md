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

