# Debugging Commands

## 🐛 Application Debugging

### Start with Debug Mode
```bash
npm run start:debug
```

### Debug with Inspector
```bash
node --inspect dist/main.js
```

### Debug with Breakpoint
```bash
node --inspect-brk dist/main.js
```

### Debug Tests
```bash
npm run test:debug
```

### Debug Specific Test
```bash
npm test -- --testPathPattern=products.service.spec.ts --detectOpenHandles
```

## 🔍 Log Analysis

### View Application Logs
```bash
tail -f logs/app.log
```

### View Error Logs
```bash
tail -f logs/error.log
```

### View Debug Logs
```bash
tail -f logs/debug.log
```

### Search Logs for Errors
```bash
grep -i "error" logs/app.log
```

### Search Logs by Date
```bash
grep "2023-01-01" logs/app.log
```

### Search Logs by User ID
```bash
grep "user-id-123" logs/app.log
```

### Count Error Occurrences
```bash
grep -c "ERROR" logs/app.log
```

## 🗄️ Database Debugging

### Check Database Connection
```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Check Active Connections
```bash
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity;"
```

### Check Database Size
```bash
npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### Check Slow Queries
```bash
npx prisma db execute --stdin <<< "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Check Table Sizes
```bash
npx prisma db execute --stdin <<< "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Check Index Usage
```bash
npx prisma db execute --stdin <<< "SELECT schemaname,tablename,indexname,idx_scan,idx_tup_read,idx_tup_fetch FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

## 🔧 Performance Debugging

### Monitor CPU Usage
```bash
top -p $(pgrep -f "node.*main")
```

### Monitor Memory Usage
```bash
ps aux | grep node | head -5
```

### Monitor Memory with Details
```bash
pmap $(pgrep -f "node.*main")
```

### Check Memory Leaks
```bash
node --expose-gc --inspect dist/main.js
```

### Profile Memory Usage
```bash
node --prof dist/main.js
```

### Analyze Profile
```bash
node --prof-process isolate-*.log
```

## 🌐 Network Debugging

### Check Port Usage
```bash
netstat -tulpn | grep :3000
```

### Check Network Connections
```bash
ss -tulpn | grep :3000
```

### Monitor Network Traffic
```bash
tcpdump -i lo port 3000
```

### Check DNS Resolution
```bash
nslookup localhost
```

### Test Local Connection
```bash
telnet localhost 3000
```

### Check Firewall Rules
```bash
iptables -L
```

## 🔍 API Debugging

### Test API Endpoint
```bash
curl -X GET "http://localhost:3000/health" -v
```

### Test with Headers
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

### Test Response Time
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -w "Time: %{time_total}s\nSize: %{size_download} bytes\n"
```

### Test with Different Methods
```bash
curl -X OPTIONS "http://localhost:3000/products" -v
```

### Test Error Handling
```bash
curl -X GET "http://localhost:3000/products/invalid-id" -v
```

## 🚨 Error Investigation

### Check Application Status
```bash
curl -X GET "http://localhost:3000/health"
```

### Check Database Health
```bash
curl -X GET "http://localhost:3000/health/database"
```

### Check Redis Health
```bash
curl -X GET "http://localhost:3000/health/redis"
```

### Check Elasticsearch Health
```bash
curl -X GET "http://localhost:3000/health/elasticsearch"
```

### Check System Resources
```bash
free -h
df -h
```

### Check Process Status
```bash
ps aux | grep node
```

### Check System Load
```bash
uptime
```

## 🔧 Development Tools

### Open Prisma Studio
```bash
npx prisma studio
```

### Open Database GUI
```bash
npx prisma studio --port 5556
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Validate Prisma Schema
```bash
npx prisma validate
```

### Format Prisma Schema
```bash
npx prisma format
```

### Check Prisma Version
```bash
npx prisma --version
```

## 📊 Monitoring Commands

### Monitor Application Metrics
```bash
curl -X GET "http://localhost:3000/metrics"
```

### Check Application Uptime
```bash
curl -X GET "http://localhost:3000/health/uptime"
```

### Monitor Request Count
```bash
curl -X GET "http://localhost:3000/metrics/requests"
```

### Check Error Rate
```bash
curl -X GET "http://localhost:3000/metrics/errors"
```

### Monitor Response Time
```bash
curl -X GET "http://localhost:3000/metrics/response-time"
```
