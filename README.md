<div align="center">

# 🚀 DevElite Hub

**A Developer-Focused Creator Subscription Platform**

Build Your Audience · Monetize Your Knowledge · Control Your Content

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-blue?style=flat-square&logo=mysql)](https://mysql.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet?style=flat-square&logo=stripe)](https://stripe.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3-orange?style=flat-square&logo=amazons3)](https://aws.amazon.com/s3/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)](https://docker.com/)

</div>

---

## 📖 Overview

**DevElite Hub** is a production-ready SaaS platform where developers monetize premium technical content through recurring subscriptions — similar to Patreon but built exclusively for the developer ecosystem.

| Role | Capabilities |
|------|-------------|
| **Creator** | Create subscription tiers, publish premium posts, attach files, earn recurring revenue |
| **Subscriber** | Browse creators, subscribe via Stripe, access gated content |
| **Admin** | Monitor platform stats, manage users, suspend accounts |

---

## 🏗️ Architecture

```
devlitehub/
├── frontend/           React 18 + Vite SPA
│   ├── src/
│   │   ├── pages/      Landing, Auth, Creator, Subscriber, Admin, Payment
│   │   ├── components/ Navbar, ProtectedRoute, TierManager, PostManager, FileUpload
│   │   ├── context/    AuthContext (JWT + role management)
│   │   └── services/   authService, creatorService, subscriberService, paymentService, fileService
│   └── Dockerfile
│
├── backend/            Spring Boot 3.x (Java 17) REST API
│   └── src/main/java/com/develitehub/
│       ├── entity/     User, SubscriptionTier, Post, Subscription
│       ├── repository/ JPA repositories with custom JPQL queries
│       ├── service/    AuthService, TierService, PostService, StripeService, S3Service
│       ├── controller/ AuthController, CreatorController, SubscriberController,
│       │               PaymentController, FileController, AdminController
│       ├── security/   JwtService, JwtAuthFilter, UserDetailsServiceImpl
│       └── config/     SecurityConfig (stateless JWT, RBAC)
│
├── scripts/            Database initialization SQL
├── docker-compose.yml  Full-stack local dev environment
└── .env.example        Environment variable template
```

---

## ⚡ Quick Start (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone & configure
```bash
git clone https://github.com/your-org/develitehub.git
cd develitehub
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables)).

### 2. Start all services
```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8080/api |
| MySQL | localhost:3306 |

### 3. Stop services
```bash
docker-compose down
```

---

## 🛠️ Local Development (Without Docker)

### Backend

**Prerequisites:** Java 17, Maven 3.8+, MySQL 8.x

```bash
cd backend

# Copy and fill env (or export vars manually)
cp ../.env.example .env

# First run – create schema
# Set spring.jpa.hibernate.ddl-auto=create in application.yml temporarily

mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API available at: `http://localhost:8080/api`

### Frontend

**Prerequisites:** Node.js 18+, npm

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# ─── Database ─────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_NAME=develitehub
DB_USERNAME=root
DB_PASSWORD=yourpassword

# ─── JWT ──────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 64
JWT_SECRET=your_256_bit_secret_here

# ─── Stripe ───────────────────────────────────────────────────────
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── AWS S3 ───────────────────────────────────────────────────────
# Create an S3 bucket and IAM user with s3:PutObject, s3:GetObject, s3:DeleteObject
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=develitehub-content
AWS_REGION=us-east-1

# ─── App URLs ─────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ─── Vite (Frontend) ──────────────────────────────────────────────
VITE_API_URL=http://localhost:8080/api
```

---

## 🌐 API Reference

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register as CREATOR or SUBSCRIBER |
| POST | `/auth/login` | Public | Login, returns JWT tokens |
| GET | `/auth/me` | JWT | Get current user profile |

### Public / Browse
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/explore/creators` | Public | Paginated creator list |
| GET | `/creators/{id}/profile` | Public | Creator public profile |
| GET | `/creators/{id}/tiers` | Public | Creator's active subscription tiers |
| GET | `/creators/{id}/posts` | Public/JWT | Creator's posts (premium content gated) |
| GET | `/posts/{id}` | Public/JWT | Single post (with view count) |

### Creator (ROLE_CREATOR required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/creator/tiers` | List my tiers |
| POST | `/creator/tiers` | Create a tier |
| PUT | `/creator/tiers/{id}` | Update a tier |
| PATCH | `/creator/tiers/{id}/toggle` | Activate/pause tier |
| DELETE | `/creator/tiers/{id}` | Delete a tier |
| GET | `/creator/posts` | List my posts (paginated) |
| POST | `/creator/posts` | Create a post |
| PUT | `/creator/posts/{id}` | Update a post |
| DELETE | `/creator/posts/{id}` | Delete a post |
| GET | `/creator/dashboard/stats` | Posts + tier counts |
| POST | `/files/posts/{id}` | Attach file to post (multipart) |
| GET | `/files/posts/{id}/url` | Get presigned S3 download URL |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/checkout/{tierId}` | JWT | Create Stripe Checkout session |
| POST | `/payments/cancel/{stripeSubId}` | JWT | Cancel subscription |
| POST | `/stripe/webhook` | Stripe | Stripe webhook receiver |

### Admin (ROLE_ADMIN required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Platform-wide stats |
| GET | `/admin/users` | Paginated user list (role filter) |
| PATCH | `/admin/users/{id}/suspend` | Suspend or reinstate user |

---

## 💳 Stripe Setup

### Development

1. Create a free [Stripe account](https://dashboard.stripe.com/register)
2. Get your **test** keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks locally:

```bash
stripe login
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

Copy the webhook signing secret shown and add to `STRIPE_WEBHOOK_SECRET`.

### Production

1. Switch to **live** Stripe keys
2. Register your webhook endpoint URL in the Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`

---

## ☁️ AWS S3 Setup

1. Create an S3 bucket (e.g., `develitehub-content`)
2. Create an IAM user with **programmatic access** and attach this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::develitehub-content/*"
  }]
}
```

3. Add the IAM credentials and bucket name to `.env`.

> **Note:** S3Service runs in **stub mode** (upload disabled) if AWS credentials are blank — useful for local dev without S3.

---

## 🚀 Production Deployment (AWS EC2)

### Option A: Docker Compose on EC2

```bash
# 1. SSH into your EC2 instance (Ubuntu recommended)
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 3. Clone repo and configure
git clone https://github.com/your-org/develitehub.git
cd develitehub
cp .env.example .env
nano .env   # Fill in production credentials

# 4. Start
docker-compose -f docker-compose.yml up -d --build

# 5. (Optional) Point a domain at the EC2 IP and configure SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option B: Separate Services

| Service | Recommended |
|---------|-------------|
| Backend | AWS Elastic Beanstalk / ECS Fargate |
| Frontend | AWS CloudFront + S3 (static hosting) |
| Database | AWS RDS (MySQL 8.x) |
| Files | AWS S3 |

---

## 🗃️ Database

The project uses MySQL 8.x. Schema is managed by **Hibernate DDL**:

| Profile | DDL Mode | When to use |
|---------|----------|-------------|
| `dev` | `update` | Local development |
| `prod` | `validate` | Production (use Flyway for migrations) |

A seed SQL script is available at `scripts/init.sql` for creating the initial admin user.

---

## 🔒 Security Notes

- JWT tokens are **stateless** (no server-side sessions)
- Passwords hashed with **BCrypt** (strength 10)
- All creator/admin endpoints protected by `@PreAuthorize` RBAC annotations
- Stripe webhooks are **signature-verified** before processing
- Presigned S3 URLs expire after **60 minutes** (configurable)
- CORS restricted to origins defined in `CORS_ORIGINS`

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6, Axios, CSS3 |
| **Backend** | Spring Boot 3.x, Spring Security, Spring Data JPA |
| **Auth** | JWT (JJWT 0.12), BCrypt |
| **Database** | MySQL 8.x, Hibernate ORM |
| **Payments** | Stripe Java SDK |
| **Storage** | AWS S3 (SDK v2) |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
