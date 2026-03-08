# API Testing Commands

## 🌐 HTTP Testing with curl

### Test Product Endpoints

#### Get All Products
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json"
```

#### Get Product by ID
```bash
curl -X GET "http://localhost:3000/products/{id}" \
  -H "Content-Type: application/json"
```

#### Search Products
```bash
curl -X GET "http://localhost:3000/products/search?q=iphone" \
  -H "Content-Type: application/json"
```

#### Create Product (Authenticated)
```bash
curl -X POST "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Product",
    "price": 99.99,
    "description": "A test product",
    "storeId": "store-id"
  }'
```

#### Update Product
```bash
curl -X PATCH "http://localhost:3000/products/{id}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Product",
    "price": 149.99
  }'
```

#### Delete Product
```bash
curl -X DELETE "http://localhost:3000/products/{id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Authentication Endpoints

#### User Registration
```bash
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### User Login
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Refresh Token
```bash
curl -X POST "http://localhost:3000/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Test Order Endpoints

#### Create Order
```bash
curl -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

#### Get User Orders
```bash
curl -X GET "http://localhost:3000/orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Cart Endpoints

#### Add to Cart
```bash
curl -X POST "http://localhost:3000/carts/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "product-id",
    "quantity": 1
  }'
```

#### Get Cart
```bash
curl -X GET "http://localhost:3000/carts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Cart Item
```bash
curl -X PATCH "http://localhost:3000/carts/items/{itemId}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 3
  }'
```

#### Remove from Cart
```bash
curl -X DELETE "http://localhost:3000/carts/items/{itemId}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 API Health Checks

### Check API Health
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

## 📊 Performance Testing

### Load Test Products Endpoint
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -w "Time: %{time_total}s\nSize: %{size_download} bytes\n"
```

### Test Pagination Performance
```bash
curl -X GET "http://localhost:3000/products?page=1&limit=50" \
  -H "Content-Type: application/json" \
  -w "Time: %{time_total}s\n"
```

### Test Search Performance
```bash
curl -X GET "http://localhost:3000/products/search?q=test" \
  -H "Content-Type: application/json" \
  -w "Time: %{time_total}s\n"
```

## 🛡️ Security Testing

### Test Rate Limiting
```bash
for i in {1..15}; do
  curl -X GET "http://localhost:3000/products" \
    -H "Content-Type: application/json" \
    -w "Request $i: %{http_code}\n"
done
```

### Test CORS
```bash
curl -X OPTIONS "http://localhost:3000/products" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### Test Authentication Required
```bash
curl -X POST "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
```

## 🔧 Debugging Commands

### Test with Verbose Output
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -v
```

### Test with Headers
```bash
curl -X GET "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -H "User-Agent: TestClient/1.0" \
  -H "Accept: application/json"
```

### Test with Query Parameters
```bash
curl -X GET "http://localhost:3000/products?search=iphone&categoryId=123&minPrice=100&maxPrice=1000" \
  -H "Content-Type: application/json"
```
