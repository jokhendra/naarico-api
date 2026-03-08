# Deployment Commands

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

### Build Docker Image
```bash
docker build -t ecommerce-api .
```

### Run Docker Container
```bash
docker run -p 3000:3000 ecommerce-api
```

### Run with Environment Variables
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:port/database" \
  -e JWT_SECRET="your-jwt-secret" \
  -e REDIS_URL="redis://host:port" \
  ecommerce-api
```

## 🐳 Docker Commands

### Build Docker Image
```bash
docker build -t ecommerce-api:latest .
```

### Build with Specific Tag
```bash
docker build -t ecommerce-api:v1.0.0 .
```

### Run Container in Background
```bash
docker run -d --name ecommerce-api -p 3000:3000 ecommerce-api
```

### View Container Logs
```bash
docker logs ecommerce-api
```

### Follow Container Logs
```bash
docker logs -f ecommerce-api
```

### Stop Container
```bash
docker stop ecommerce-api
```

### Remove Container
```bash
docker rm ecommerce-api
```

### Remove Image
```bash
docker rmi ecommerce-api
```

### List Running Containers
```bash
docker ps
```

### List All Containers
```bash
docker ps -a
```

### List Images
```bash
docker images
```

## 🗄️ Database Deployment

### Deploy Database Migrations
```bash
npx prisma migrate deploy
```

### Deploy with Custom Schema
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Deploy to Production Database
```bash
DATABASE_URL="postgresql://user:password@prod-host:port/database" \
npx prisma migrate deploy
```

### Generate Prisma Client for Production
```bash
npx prisma generate
```

## 🔧 Environment Setup

### Set Production Environment
```bash
export NODE_ENV=production
```

### Set Development Environment
```bash
export NODE_ENV=development
```

### Set Test Environment
```bash
export NODE_ENV=test
```

### Load Environment Variables
```bash
source .env.production
```

## 📊 Monitoring Commands

### Check Application Health
```bash
curl -X GET "http://localhost:3000/health"
```

### Check Database Connection
```bash
curl -X GET "http://localhost:3000/health/database"
```

### Check Redis Connection
```bash
curl -X GET "http://localhost:3000/health/redis"
```

### Check Elasticsearch Connection
```bash
curl -X GET "http://localhost:3000/health/elasticsearch"
```

### Monitor Application Logs
```bash
tail -f logs/app.log
```

### Monitor Error Logs
```bash
tail -f logs/error.log
```

## 🔄 CI/CD Commands

### Run Pre-deployment Tests
```bash
npm run test:ci
```

### Run Security Audit
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

### Build and Test
```bash
npm run build && npm run test:unit
```

### Deploy with Zero Downtime
```bash
# Blue-green deployment commands
docker-compose -f docker-compose.prod.yml up -d --scale app=2
docker-compose -f docker-compose.prod.yml down --scale app=1
```

## 🌐 Load Balancer Commands

### Check Load Balancer Health
```bash
curl -X GET "http://localhost:8080/health"
```

### Test Load Distribution
```bash
for i in {1..10}; do
  curl -X GET "http://localhost:8080/products" \
    -H "Content-Type: application/json" \
    -w "Request $i: %{http_code}\n"
done
```

## 📈 Performance Monitoring

### Monitor CPU Usage
```bash
top -p $(pgrep -f "node.*main")
```

### Monitor Memory Usage
```bash
ps aux | grep node
```

### Monitor Network Connections
```bash
netstat -tulpn | grep :3000
```

### Monitor Database Connections
```bash
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity;"
```

## 🔐 Security Commands

### Generate SSL Certificate
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Test SSL Configuration
```bash
curl -k -X GET "https://localhost:3000/health"
```

### Check Security Headers
```bash
curl -I -X GET "http://localhost:3000/products"
```

### Test Rate Limiting
```bash
for i in {1..20}; do
  curl -X GET "http://localhost:3000/products" \
    -H "Content-Type: application/json" \
    -w "Request $i: %{http_code}\n"
done
```
