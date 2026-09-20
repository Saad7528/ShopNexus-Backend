# <p align="center">⚙️ ShopNexus — Backend Microservices & API Engine</p>

<p align="center">
  <strong>High-Performance RESTful API, Real-Time Telemetry & Enterprise Authentication Service for the ShopNexus Commerce Ecosystem.</strong>
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-v18.18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express.js-4.19-black?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
  <a href="https://www.mongodb.com/atlas"><img src="https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" /></a>
  <a href="https://jwt.io"><img src="https://img.shields.io/badge/JWT-HTTP--Only_Cookies-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

<p align="center">
  <a href="#-api-directory--endpoints"><strong>API Directory</strong></a> •
  <a href="#-security-architecture--rbac"><strong>Security & RBAC</strong></a> •
  <a href="#-getting-started--local-development"><strong>Quickstart</strong></a> •
  <a href="https://github.com/Saad7528/ShopNexus-Frontend"><strong>Frontend Repository ➔</strong></a>
</p>

---

## ⚡ Overview & Architecture

**ShopNexus Backend** provides the core RESTful services, database layer, authentication pipelines, and telemetry listeners supporting the ShopNexus e-commerce platform.

- **🍃 MongoDB Atlas Cluster**: Schema-modeled product catalog, order states, user LTV data, and audit trails.
- **🔐 Hardware/Software 2FA (RFC 6238)**: TOTP verification pipeline with emergency master key override.
- **🛡️ Real-Time Cyber Defense**: Active IP session tracking and 1-click IP Shield firewall blocking.
- **📦 Multi-Carrier Courier Engine**: 6-step state-machine for order tracking and automated dispatch alerts.

---

## 🔐 Administrative & Security Configuration

| Parameter | Value / Description |
|---|---|
| **Port** | `5000` (Default) |
| **Super Admin Account** | `saad0174742@gmail.com` |
| **Emergency 2FA Master Override** | **`752800`** |
| **TOTP Secret Key** | `SAADNEXUS234567M` |
| **Database** | MongoDB Atlas Cluster via Mongoose |

---

## 📡 API Directory & Endpoints

### 1. Authentication & Security (`/api/auth`)
- `POST /api/auth/login` — Authenticate user / admin with password & 2FA check.
- `POST /api/auth/register` — Create buyer / merchant account with salted password hashing.
- `POST /api/auth/login-requests` — Push notification dispatch for secondary device login approvals.
- `GET /api/auth/me` — Retrieve authenticated session data.

### 2. Admin & Analytics (`/api/admin`)
- `GET /api/admin/metrics` — Aggregate gross revenue, order count, AOV, and customer metrics.
- `GET /api/admin/orders` — Paginated order directory with status filtering & POS invoice triggers.
- `GET /api/admin/users` — Customer directory with automated **Lifetime Value (LTV)** scoring.
- `POST /api/admin/users/:id/fraud-status` — Toggle 1-click customer fraud risk flagging.
- `POST /api/admin/staff/freeze` — 1-click staff account freeze and token invalidation.

### 3. Products & Catalog (`/api/products`)
- `GET /api/products` — Filter catalog by category, price, brand, stock, and flash sale status.
- `GET /api/products/:id` — Single product details with verified reviews and stock countdowns.
- `POST /api/products` — Admin / Merchant product creation.

### 4. Cart & Abandoned Session Recovery (`/api/cart`)
- `POST /api/cart/sync` — Synchronize guest localStorage cart with MongoDB user cart.
- `GET /api/cart/recover` — Decode dynamic recovery link and restore abandoned items.

### 5. Telemetry & IP Shield (`/api/telemetry`)
- `POST /api/telemetry/heartbeat` — 3-second live active user heartbeat pulse.
- `GET /api/telemetry/live-sessions` — Real-time active visitor stream with geo-locations.

---

## 💻 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: v18.18.0 or higher
- **MongoDB**: Connection string for MongoDB Atlas or local MongoDB instance

### 2. Installation

```bash
# 1. Clone the Backend repository
git clone https://github.com/Saad7528/ShopNexus-Backend.git
cd ShopNexus-Backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

### 3. Environment Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT & Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Master 2FA Override
MASTER_ADMIN_EMAIL=saad0174742@gmail.com
MASTER_TOTP_SECRET=SAADNEXUS234567M
EMERGENCY_MASTER_CODE=752800

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Running the Server

```bash
npm run dev
```

Server will start listening on [http://localhost:5000](http://localhost:5000).

---

## 📂 Repository Directory Structure

```text
ShopNexus-Backend/
├── src/
│   ├── config/              # Database connection & environment configuration
│   ├── controllers/         # Request handlers (auth, admin, products, cart, telemetry)
│   ├── middleware/          # JWT verification, RBAC guards, IP Shield firewall
│   ├── models/              # Mongoose Data Schemas (User, Product, Order, Visitor, Coupon)
│   ├── routes/              # Express API Route Declarations
│   ├── services/            # TOTP Engine, SMS/WhatsApp Dispatcher, Analytics Calculator
│   └── utils/               # Helper functions, error handlers, loggers
├── package.json
└── tsconfig.json
```

---

## 🔗 Related Repositories

- **Frontend Repository**: [https://github.com/Saad7528/ShopNexus-Frontend](https://github.com/Saad7528/ShopNexus-Frontend)

---

## 📜 License & Author

Distributed under the **MIT License**.

Developed with ❤️ by **[S.M. Amirul Islam Saad](https://github.com/Saad7528)**.
