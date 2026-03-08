# Quick Reference Commands

## 🚀 Most Used Commands

### Start Development
```bash
npm run start:dev
```

### Run Tests
```bash
npm run test:all
```

### Build Project
```bash
npm run build
```

### Database Migration
```bash
npx prisma migrate dev
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## 🔧 Development Workflow

### Daily Development
```bash
# 1. Start development server
npm run start:dev

# 2. In another terminal, run tests
npm run test:watch

# 3. Open database GUI
npx prisma studio
```

### Before Committing
```bash
# 1. Run tests
npm run test:all

# 2. Lint code
npm run lint

# 3. Format code
npm run format

# 4. Build project
npm run build
```

### Database Changes
```bash
# 1. Make schema changes
# Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name "description"

# 3. Generate client
npx prisma generate

# 4. Test changes
npm run test:unit
```

## 🐛 Common Debugging

### Application Won't Start
```bash
# Check logs
tail -f logs/app.log

# Check database connection
curl -X GET "http://localhost:3000/health/database"

# Check port usage
netstat -tulpn | grep :3000
```

### Tests Failing
```bash
# Run specific test
npm test -- --testPathPattern=failing-test.spec.ts

# Run with verbose output
npm test -- --verbose

# Debug test
npm run test:debug
```

### Database Issues
```bash
# Check migration status
npx prisma migrate status

# Reset database
npx prisma migrate reset

# Check database health
curl -X GET "http://localhost:3000/health/database"
```

### Performance Issues
```bash
# Monitor CPU usage
top -p $(pgrep -f "node.*main")

# Monitor memory usage
ps aux | grep node

# Check response time
curl -X GET "http://localhost:3000/products" -w "Time: %{time_total}s\n"
```

## 🌐 API Testing

### Test Basic Endpoints
```bash
# Health check
curl -X GET "http://localhost:3000/health"

# Get products
curl -X GET "http://localhost:3000/products"

# Search products
curl -X GET "http://localhost:3000/products/search?q=test"
```

### Test Authentication
```bash
# Login
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Use token
curl -X GET "http://localhost:3000/products" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Deployment

### Production Build
```bash
# Build project
npm run build

# Start production server
npm run start:prod

# Deploy database
npx prisma migrate deploy
```

### Docker Deployment
```bash
# Build image
docker build -t ecommerce-api .

# Run container
docker run -p 3000:3000 ecommerce-api
```

## 🔍 Monitoring

### Health Checks
```bash
# Application health
curl -X GET "http://localhost:3000/health"

# Database health
curl -X GET "http://localhost:3000/health/database"

# Redis health
curl -X GET "http://localhost:3000/health/redis"
```

### Log Monitoring
```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# Search for errors
grep -i "error" logs/app.log
```

## 🛠️ Maintenance

### Cleanup
```bash
# Clean node modules
rm -rf node_modules && npm install

# Clean build files
rm -rf dist

# Clean logs
rm -rf logs/*
```

### Updates
```bash
# Update dependencies
npm update

# Check outdated packages
npm outdated

# Security audit
npm audit
```

### Backup
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Backup code
tar -czf code-backup.tar.gz src/
```

## 📊 Quick Stats

### Project Stats
```bash
# Count lines of code
find src -name "*.ts" -exec wc -l {} + | tail -1

# Count files
find src -type f | wc -l

# Project size
du -sh .
```

### Database Stats
```bash
# Database size
npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Table counts
npx prisma db execute --stdin <<< "SELECT schemaname,tablename,n_tup_ins as inserts,n_tup_upd as updates,n_tup_del as deletes FROM pg_stat_user_tables;"
```

## 🎯 One-Liners

### Quick API Test
```bash
curl -X GET "http://localhost:3000/health" && echo "✅ API is running"
```

### Quick Database Test
```bash
npx prisma db execute --stdin <<< "SELECT 1;" && echo "✅ Database is connected"
```

### Quick Test Run
```bash
npm run test:unit -- --passWithNoTests && echo "✅ Tests passed"
```

### Quick Build Check
```bash
npm run build && echo "✅ Build successful"
```

### Quick Lint Check
```bash
npm run lint && echo "✅ Code is clean"
```
