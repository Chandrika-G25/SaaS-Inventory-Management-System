# StockFlow MVP – API Documentation

Welcome to the API reference documentation for the StockFlow Smart Inventory Management System (SaaS MVP). 

All backend routes are prefixed with `/api` and return standardized JSON responses.

---

## Global Response Format

Successful responses follow this structure:
```json
{
  "success": true,
  "message": "Human readable description.",
  "data": { ... } // Payload (object, array, or null)
}
```

Error responses follow this structure:
```json
{
  "success": false,
  "message": "Detailed error message describing the failure."
}
```

---

## Authentication APIs

Endpoints to manage user signups, logins, and token verification.

### 1. User Signup
Create a new user account and initialize a new organization.

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Valid email address (must be unique). |
  | `password` | String | Yes | Account password (minimum 8 characters). |
  | `confirmPassword` | String | Yes | Must match `password`. |
  | `organizationName` | String | Yes | Name of the workspace/organization. |

- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "token": "JWT_BEARER_TOKEN_STRING",
      "user": {
        "id": "USER_UUID",
        "email": "user@example.com"
      },
      "organization": {
        "id": "ORGANIZATION_UUID",
        "name": "My Store Ltd"
      }
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g. passwords don't match, password < 8 chars).
  - `409 Conflict`: An account with that email already exists.

---

### 2. User Login
Authenticate an existing user and obtain a JWT bearer token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Account email address. |
  | `password` | String | Yes | Account password. |

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User logged in successfully.",
    "data": {
      "token": "JWT_BEARER_TOKEN_STRING",
      "user": {
        "id": "USER_UUID",
        "email": "user@example.com"
      },
      "organization": {
        "id": "ORGANIZATION_UUID",
        "name": "My Store Ltd"
      }
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Email/password parameters are missing.
  - `401 Unauthorized`: Invalid credentials.

---

### 3. Get Current User Session
Verify the current user session and retrieve their details.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Current user retrieved successfully.",
    "data": {
      "user": {
        "id": "USER_UUID",
        "email": "user@example.com"
      },
      "organization": {
        "id": "ORGANIZATION_UUID",
        "name": "My Store Ltd"
      }
    }
  }
  ```

- **Error Responses**:
  - `401 Unauthorized`: No token provided or token has expired.
  - `404 Not Found`: User no longer exists in the database.

---

## Products & Inventory APIs

All endpoints below require authentication. Tenant isolation is enforced automatically (users only see and modify products belonging to their organization).

### 1. List All Products
Fetch all products in the user's organization.

- **URL**: `/api/products`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Products retrieved successfully.",
    "data": [
      {
        "id": "PRODUCT_UUID",
        "name": "Laptop Stand",
        "sku": "LS-100",
        "description": "Ergonomic aluminum stand",
        "quantity": 50,
        "costPrice": 15.00,
        "sellingPrice": 29.99,
        "lowStockThreshold": 10,
        "createdAt": "2026-07-09T09:00:00.000Z",
        "updatedAt": "2026-07-09T09:20:00.000Z"
      }
    ]
  }
  ```

---

### 2. Get Product By ID
Retrieve a single product's details.

- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product retrieved successfully.",
    "data": {
      "id": "PRODUCT_UUID",
      "name": "Laptop Stand",
      "sku": "LS-100",
      "description": "Ergonomic aluminum stand",
      "quantity": 50,
      "costPrice": 15.00,
      "sellingPrice": 29.99,
      "lowStockThreshold": 10,
      "createdAt": "2026-07-09T09:00:00.000Z",
      "updatedAt": "2026-07-09T09:20:00.000Z"
    }
  }
  ```

- **Error Responses**:
  - `404 Not Found`: Product not found or belongs to another organization.

---

### 3. Create Product
Add a new product to the organization's catalog.

- **URL**: `/api/products`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Yes | Name of the product. |
  | `sku` | String | Yes | Stock Keeping Unit (must be unique per organization). |
  | `description` | String | No | Optional description text. |
  | `quantity` | Number | No | Initial stock levels (default `0`). Must be $\ge 0$. |
  | `costPrice` | Number | No | Cost price. Must be $\ge 0$. |
  | `sellingPrice` | Number | No | Selling price. Must be $\ge 0$. |
  | `lowStockThreshold`| Number | No | Custom low-stock threshold limit for this product. |

- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully.",
    "data": {
      "id": "PRODUCT_UUID",
      "name": "Laptop Stand",
      "sku": "LS-100",
      "quantity": 50,
      "costPrice": 15.00,
      "sellingPrice": 29.99,
      "lowStockThreshold": 10,
      "organizationId": "ORGANIZATION_UUID",
      "createdAt": "2026-07-09T09:00:00.000Z",
      "updatedAt": "2026-07-09T09:00:00.000Z"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Missing name or SKU; invalid positive numeric values.
  - `409 Conflict`: SKU already exists in this organization.

---

### 4. Update Product
Update an existing product's metadata or core specifications.

- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Request Body**: (all fields are optional, empty strings or negative numbers fail validation)
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `name` | String | Product name. |
  | `sku` | String | Product SKU. |
  | `description` | String | Product description. |
  | `costPrice` | Number | Product cost price ($\ge 0$). |
  | `sellingPrice` | Number | Product selling price ($\ge 0$). |
  | `lowStockThreshold`| Number | Product-specific low stock alert threshold. |

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product updated successfully.",
    "data": { ... } // Updated product details
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Empty name/SKU fields or negative values.
  - `404 Not Found`: Product not found or belongs to another organization.
  - `409 Conflict`: Target SKU is already claimed by another product.

---

### 5. Inline Stock Adjustment
Adjust stock levels inline by adding or subtracting units.

- **URL**: `/api/products/:id/adjust`
- **Method**: `PATCH`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `adjustment` | Number | Yes | Positive integer to increase stock, negative integer to decrease stock. |
  | `note` | String | No | Reason or memo for the change. |

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Stock adjusted successfully.",
    "data": {
      "id": "PRODUCT_UUID",
      "name": "Laptop Stand",
      "quantity": 45, // Updated from 50 (after a -5 adjustment)
      "lastUpdatedBy": "USER_UUID",
      "lastUpdateNote": "Returned 5 units due to damage"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Adjustment would lead to negative inventory (e.g. quantity < 0).
  - `404 Not Found`: Product not found or belongs to another organization.

---

### 6. Delete Product
Delete a product from the database catalog.

- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully.",
    "data": null
  }
  ```

- **Error Responses**:
  - `404 Not Found`: Product not found or belongs to another organization.

---

## Settings APIs

Manage organization-wide default parameters.

### 1. Get Settings
Retrieve current configuration settings for the user's organization.

- **URL**: `/api/settings`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Settings retrieved successfully.",
    "data": {
      "defaultLowStockThreshold": 5
    }
  }
  ```

---

### 2. Update Settings
Modify organization-wide settings.

- **URL**: `/api/settings`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `defaultLowStockThreshold` | Number | Yes | Default threshold limit used if a product does not specify its own. Must be an integer $\ge 0$. |

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Settings updated successfully.",
    "data": {
      "defaultLowStockThreshold": 15
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Invalid or negative threshold number.

---

## Dashboard APIs

Retrieve aggregated analytics and low-stock alerts.

### 1. Get Dashboard Summary
Retrieve inventory counters and items currently flagged as low-stock.

- **URL**: `/api/dashboard`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <TOKEN>`

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard data retrieved successfully.",
    "data": {
      "totalProducts": 3,
      "totalQuantity": 55,
      "lowStockItems": [
        {
          "id": "PRODUCT_UUID_2",
          "name": "USB Hub",
          "sku": "UH-200",
          "quantity": 3,
          "lowStockThreshold": 10 // Flagged because qty (3) <= threshold (10)
        },
        {
          "id": "PRODUCT_UUID_3",
          "name": "HDMI Cable",
          "sku": "HC-300",
          "quantity": 2,
          "lowStockThreshold": 5 // Flagged because qty (2) <= org default threshold (5)
        }
      ]
    }
  }
  ```
