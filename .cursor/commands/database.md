# Database Commands

## 🗄️ Prisma Operations

### Generate Prisma Client
```bash
npx prisma generate
```

### Create New Migration
```bash
npx prisma migrate dev --name <migration-name>
```

### Apply Pending Migrations
```bash
npx prisma migrate deploy
```

### Reset Database (Development)
```bash
npx prisma migrate reset
```

### Reset Database (Force)
```bash
npx prisma migrate reset --force
```

### Check Migration Status
```bash
npx prisma migrate status
```

### Resolve Migration Issues
```bash
npx prisma migrate resolve --applied <migration-name>
```

## 🎨 Database GUI

### Open Prisma Studio
```bash
npx prisma studio
```

### Open Prisma Studio on Specific Port
```bash
npx prisma studio --port 5556
```

## 🌱 Database Seeding

### Run Seed Script
```bash
npx prisma db seed
```

### Seed with Specific Data
```bash
npx prisma db seed --preview-feature
```

## 🔍 Database Introspection

### Introspect Database Schema
```bash
npx prisma db pull
```

### Push Schema Changes
```bash
npx prisma db push
```

### Validate Schema
```bash
npx prisma validate
```

### Format Schema File
```bash
npx prisma format
```

## 🚀 Database Deployment

### Deploy to Production
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Deploy with Custom URL
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma --url="postgresql://user:password@host:port/database"
```

## 🔧 Database Utilities

### Execute Raw SQL
```bash
npx prisma db execute --file ./scripts/cleanup.sql
```

### Execute SQL Query
```bash
npx prisma db execute --stdin
```

### Database Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Database Restore
```bash
psql $DATABASE_URL < backup.sql
```

## 📊 Database Monitoring

### Check Database Health
```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Monitor Database Connections
```bash
npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_stat_activity;"
```

### Check Database Size
```bash
npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size(current_database()));"
```
