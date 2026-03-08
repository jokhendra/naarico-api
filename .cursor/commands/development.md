# Development Commands

## 🚀 Quick Development Setup

### Start Development Server
```bash
npm run start:dev
```

### Start with Debug Mode
```bash
npm run start:debug
```

### Build Project
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

## 🔧 Database Management

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name <migration-name>
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Seed Database
```bash
npx prisma db seed
```

## 📊 Code Quality

### Run Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Check Code Coverage
```bash
npm run test:cov
```

## 🔍 Debugging

### Debug Tests
```bash
npm run test:debug
```

### Watch Tests
```bash
npm run test:watch
```

## 📦 Package Management

### Install Dependencies
```bash
npm install
```

### Update Dependencies
```bash
npm update
```

### Audit Dependencies
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```
