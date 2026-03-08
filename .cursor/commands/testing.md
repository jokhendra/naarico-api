# Testing Commands

## 🧪 Test Execution

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Debug Tests
```bash
npm run test:debug
```

## 🗄️ Test Database Setup

### Setup Test Database
```bash
npm run test:db:setup
```

### Reset Test Database
```bash
npm run test:db:reset
```

### Run CI Tests
```bash
npm run test:ci
```

## 🔧 Test Utilities

### Run Specific Test File
```bash
npm test -- --testPathPattern=products.service.spec.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should create product"
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

### Run Tests in Specific Directory
```bash
npm test -- src/modules/products
```

## 📊 Test Analysis

### Generate Coverage Report
```bash
npm run test:cov -- --coverageReporters=html
```

### View Coverage in Browser
```bash
open coverage/index.html
```

### Run Tests with Detailed Output
```bash
npm test -- --detectOpenHandles --forceExit
```

## 🚀 Performance Testing

### Run Performance Tests
```bash
npm test -- --testPathPattern=performance
```

### Run Load Tests
```bash
npm test -- --testPathPattern=load
```

### Run Stress Tests
```bash
npm test -- --testPathPattern=stress
```
