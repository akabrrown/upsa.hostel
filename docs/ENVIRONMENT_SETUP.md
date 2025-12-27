# Environment Setup Guide - UPSA Hostel Management System

## Overview
This comprehensive guide covers setting up the development and production environments for the UPSA Hostel Management System.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [External Services](#external-services)
- [Production Environment](#production-environment)
- [Docker Setup](#docker-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Git**: Latest version
- **PostgreSQL**: Version 14.x or higher (recommended)
- **Redis**: Version 6.x or higher (for caching/sessions)

### Development Tools
- **VS Code**: Recommended IDE
- **Postman**: For API testing
- **pgAdmin**: Database management
- **Redis Desktop Manager**: Redis management

### System Requirements
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 20GB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

---

## Development Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/upsa/hostel-management-system.git
cd hostel-management-system
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install development dependencies
npm install --dev

# Verify installation
npm --version
node --version
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment file
code .env.local
```

### 4. Database Setup
```bash
# Install PostgreSQL if not already installed
# Create database
createdb hostel_management

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Server
```bash
# Start Next.js development server
npm run dev

# Start Redis (if not running as service)
redis-server

# Alternative: Use Docker Compose for all services
docker-compose up -d
```

### 6. Verify Setup
Open browser and navigate to:
- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Database Admin**: http://localhost:5050 (pgAdmin)

---

## Environment Variables

### Required Variables
Create `.env.local` file with the following:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hostel_management"
POSTGRES_USER="your_username"
POSTGRES_PASSWORD="your_password"
POSTGRES_DB="hostel_management"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-256-bit-secret-key-here"

# Redis Configuration
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5242880"  # 5MB in bytes

# Email Configuration (for production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Cloudflare Turnstile (optional)
CLOUDFLARE_TURNSTILE_SECRET="your-turnstile-secret"

# Application Configuration
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"
```

### Optional Variables
```bash
# Development Only
DEBUG="true"
ENABLE_ANALYTICS="false"

# Testing
TEST_DATABASE_URL="postgresql://test:test@localhost:5432/hostel_management_test"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### Environment-Specific Files
- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Testing environment

---

## Database Setup

### PostgreSQL Installation

#### Windows
```powershell
# Using Chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database user
createuser -s postgres
```

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Configuration
```bash
# Create database
createdb hostel_management

# Create user (optional)
createuser --interactive hostel_user

# Grant privileges
psql -d hostel_management -c "GRANT ALL PRIVILEGES ON DATABASE hostel_management TO hostel_user;"

# Test connection
psql -d hostel_management -c "\l"
```

### Prisma Setup
```bash
# Initialize Prisma
npx prisma init

# Create initial migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate

# View database schema
npx prisma studio
```

### Database Seeding
Create `prisma/seed.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@upsamail.edu.gh',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      is_active: true,
      email_verified: true,
    },
  })

  // Create sample hostel
  const hostel = await prisma.hostel.create({
    data: {
      name: 'Main Hostel',
      code: 'MH001',
      address: 'UPSA Campus, Accra',
      total_floors: 3,
      total_rooms: 60,
      capacity: 120,
      is_active: true,
    },
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

---

## External Services

### Redis Setup

#### Local Installation
```bash
# Windows (using Chocolatey)
choco install redis-64

# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
```

#### Docker Redis
```bash
# Pull and run Redis container
docker run -d -p 6379:6379 --name redis redis:alpine

# Or use Docker Compose
docker-compose up -d redis
```

#### Redis Configuration
```bash
# Test Redis connection
redis-cli ping

# Check Redis status
redis-cli info server
```

### Supabase Setup

1. **Create Supabase Project**
   - Visit https://supabase.com
   - Create new project
   - Note project URL and keys

2. **Configure Database**
   - Enable required extensions
   - Set up RLS policies
   - Create storage buckets

3. **Update Environment Variables**
   ```bash
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

### Cloudflare Turnstile (Optional)

1. **Create Turnstile Site**
   - Cloudflare dashboard → Turnstile
   - Add new site
   - Get site key and secret

2. **Configure Application**
   ```bash
   CLOUDFLARE_TURNSTILE_SECRET="your-secret-key"
   ```

---

## Production Environment

### Environment Preparation

#### Server Requirements
- **CPU**: 2 cores minimum, 4 cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **Network**: Stable internet connection

#### Security Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Create application user
sudo adduser --system --group appuser
```

### Production Deployment

#### Build Application
```bash
# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Create production environment file
cp .env.example .env.production
```

#### Environment Configuration
```bash
# Production environment variables
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="postgresql://user:pass@host:5432/db"
LOG_LEVEL="info"
```

#### Process Management
```bash
# Install PM2
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hostel-management',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### SSL Certificate Setup

#### Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL
```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate CSR
openssl req -new -key private.key -out certificate.csr

# Submit CSR to CA for certificate
```

---

## Docker Setup

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/hostel_management
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: hostel_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### Docker Commands
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Scale application
docker-compose up -d --scale app=3
```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d hostel_management

# Reset database
dropdb hostel_management && createdb hostel_management
npx prisma migrate reset
```

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis

# Clear Redis cache
redis-cli flushall
```

#### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .

# Fix upload directory permissions
mkdir -p uploads
chmod 777 uploads
```

### Development Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep -E "(DATABASE|REDIS|NODE)"

# Reload environment
source .env.local

# Test database connection
npx prisma db pull
```

### Production Issues

#### Application Not Starting
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs hostel-management

# Restart application
pm2 restart hostel-management
```

#### SSL Certificate Issues
```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Issues

#### Database Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('hostel_management'));

-- Analyze table statistics
ANALYZE;
```

#### Application Performance
```bash
# Monitor memory usage
pm2 monit

# Check application metrics
curl http://localhost:3000/api/health

# Profile application
npm run build:analyze
```

### Log Analysis

#### Application Logs
```bash
# View real-time logs
tail -f logs/combined.log

# Filter error logs
grep "ERROR" logs/combined.log

# Analyze log patterns
awk '{print $1}' logs/access.log | sort | uniq -c | sort -nr
```

#### Database Logs
```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Check for connection issues
grep "connection" /var/log/postgresql/postgresql-14-main.log
```

---

## Support and Resources

### Documentation
- **API Documentation**: `/docs/API.md`
- **Component Documentation**: `/docs/COMPONENTS.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Security Guide**: `/SECURITY.md`

### Community Support
- **GitHub Issues**: Report bugs and feature requests
- **Discord Channel**: Real-time support and discussion
- **Email Support**: support@upsamail.edu.gh

### Additional Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Redis Documentation**: https://redis.io/documentation

### Emergency Contacts
- **System Administrator**: admin@upsamail.edu.gh
- **Database Administrator**: dba@upsamail.edu.gh
- **DevOps Team**: devops@upsamail.edu.gh

This environment setup guide should help you get the UPSA Hostel Management System running in both development and production environments.
