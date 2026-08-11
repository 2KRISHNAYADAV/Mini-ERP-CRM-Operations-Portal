# API Documentation — Mini ERP + CRM Operations Portal

> **Version:** 1.0  
> **Base URL (local):** `http://localhost:5000/api`  
> **Base URL (production):** `https://your-backend.onrender.com/api`

---

## Overview

This is a RESTful JSON API for the Mini ERP + CRM Operations Portal. All protected endpoints require a valid JWT bearer token in the `Authorization` header.

---

## Authentication

### How It Works

1. Call `POST /api/auth/login` with email and password.
2. Receive a JWT token in the response.
3. Include the token in all subsequent requests:

```
Authorization: Bearer <your_token>
```

### Token Details

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Expires in | 1 day (`1d`) |
| Payload | `{ id: number, role: UserRole }` |

### Roles & Permissions

| Role | Description |
|---|---|
| `Admin` | Full access to all endpoints and operations |
| `Sales` | Customers (CRUD), Products (read), Challans (create/cancel) |
| `Warehouse` | Products (CRUD), Inventory (adjust) |
| `Accounts` | Customers (read), Challans (read) |

> **Admin bypass:** Admin role is never blocked by `requireRole`. If a role restriction says "Sales", Admins can also call it.

---

## Error Response Format

All error responses follow this shape:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation failed, business rule violation) |
| `401` | Unauthorized (no token or expired token) |
| `403` | Forbidden (authenticated but insufficient role) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Rate Limiting

- **Limit:** 200 requests per 15 minutes per IP (applied to all `/api/*` routes)
- **Exceeded response:** `429 Too Many Requests`

---

---

## 1. Authentication APIs

---

### `POST /api/auth/login`

Authenticate a user with email and password. Returns a JWT token.

**Authentication required:** No

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User's registered email |
| `password` | string | Yes | Plain text password |

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Success Response — `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "Admin"
  }
}
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `401` | `"Invalid email or password"` | User not found or wrong password |
| `500` | `"Server error during login"` | Database error |

---

### `GET /api/auth/me`

Return the profile of the currently authenticated user. Useful for session restoration on page reload.

**Authentication required:** Yes (any role)

**Request Body:** None

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@test.com",
  "role": "Admin",
  "created_at": "2024-01-15T08:30:00.000Z"
}
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `401` | `"Unauthorized: No token provided"` | Missing Authorization header |
| `401` | `"Unauthorized: Invalid or expired token"` | Token invalid or expired |
| `404` | `"User not found"` | User deleted after token was issued |

---

---

## 2. Dashboard API

---

### `GET /api/dashboard`

Returns aggregated statistics for the main dashboard page.

**Authentication required:** Yes (any role)

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "totalCustomers": 42,
  "totalProducts": 18,
  "totalConfirmedChallans": 15,
  "totalDraftChallans": 3,
  "lowStockProducts": [
    {
      "id": 5,
      "product_name": "Widget A",
      "sku": "WGT-001",
      "current_stock": 2,
      "min_stock_alert": 10
    }
  ],
  "recentChallans": [
    {
      "id": 12,
      "challan_number": "CH-2024-0012",
      "customer_name": "Ravi Enterprises",
      "total_quantity": 50,
      "status": "Confirmed",
      "created_at": "2024-06-01T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `401` | `"Unauthorized: No token provided"` | Missing or invalid token |
| `500` | `"Failed to load dashboard stats"` | Database error |

---

---

## 3. Customer APIs

---

### `GET /api/customers`

List all customers ordered by creation date (newest first).

**Authentication required:** Yes (any role)

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "customer_name": "Ravi Enterprises",
    "mobile_number": "9876543210",
    "email": "ravi@example.com",
    "business_name": "Ravi Pvt. Ltd.",
    "gst_number": "29ABCDE1234F1Z5",
    "customer_type": "Wholesale",
    "address": "123 Market Street, Mumbai",
    "status": "Active",
    "follow_up_date": "2024-07-15",
    "notes": "High-volume buyer",
    "created_at": "2024-01-10T09:00:00.000Z"
  }
]
```

---

### `POST /api/customers`

Create a new customer.

**Authentication required:** Yes  
**Required role:** `Sales` (or `Admin`)

**Request Body:**
```json
{
  "customer_name": "Ravi Enterprises",
  "mobile_number": "9876543210",
  "email": "ravi@example.com",
  "business_name": "Ravi Pvt. Ltd.",
  "gst_number": "29ABCDE1234F1Z5",
  "customer_type": "Wholesale",
  "address": "123 Market Street, Mumbai",
  "status": "Active",
  "follow_up_date": "2024-07-15",
  "notes": "High-volume buyer"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `customer_name` | string | Yes | Any string |
| `mobile_number` | string | Yes | Phone number |
| `email` | string | No | Valid email |
| `business_name` | string | No | Company name |
| `gst_number` | string | No | GST number |
| `customer_type` | string | Yes | `"Retail"` \| `"Wholesale"` \| `"Distributor"` |
| `address` | string | No | Full address |
| `status` | string | Yes | `"Active"` \| `"Inactive"` |
| `follow_up_date` | string | No | ISO date `"YYYY-MM-DD"` |
| `notes` | string | No | Free text |

**Success Response — `201 Created`:** Returns the created customer object.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | Validation error | Missing required fields |
| `403` | `"Forbidden: Insufficient permissions"` | Non-Sales/Admin role |

---

### `PUT /api/customers/:id`

Update an existing customer.

**Authentication required:** Yes  
**Required role:** `Sales` (or `Admin`)

**URL Parameter:** `id` — customer ID (integer)

**Request Body:** Same fields as `POST /api/customers`. All fields are optional (send only what changed).

**Success Response — `200 OK`:** Returns the updated customer object.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `404` | `"Customer not found"` | Invalid ID |
| `403` | `"Forbidden: Insufficient permissions"` | Insufficient role |

---

### `DELETE /api/customers/:id`

Permanently delete a customer.

**Authentication required:** Yes  
**Required role:** `Admin` only

**URL Parameter:** `id` — customer ID (integer)

**Success Response — `200 OK`:**
```json
{ "message": "Customer deleted" }
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `404` | `"Customer not found"` | Invalid ID |
| `403` | `"Forbidden: Insufficient permissions"` | Non-Admin role |

---

---

## 4. Product APIs

---

### `GET /api/products`

List all products ordered by name.

**Authentication required:** Yes (any role)

**Success Response — `200 OK`:**
```json
[
  {
    "id": 3,
    "product_name": "Steel Rod 10mm",
    "sku": "STL-ROD-10",
    "category": "Raw Materials",
    "unit_price": "450.00",
    "current_stock": 250,
    "min_stock_alert": 50,
    "location": "Warehouse A - Shelf 3",
    "created_at": "2024-02-01T08:00:00.000Z"
  }
]
```

---

### `POST /api/products`

Create a new product.

**Authentication required:** Yes  
**Required role:** `Warehouse` (or `Admin`)

**Request Body:**
```json
{
  "product_name": "Steel Rod 10mm",
  "sku": "STL-ROD-10",
  "category": "Raw Materials",
  "unit_price": 450.00,
  "current_stock": 250,
  "min_stock_alert": 50,
  "location": "Warehouse A - Shelf 3"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `product_name` | string | Yes | Product display name |
| `sku` | string | Yes | Unique stock-keeping unit code |
| `category` | string | No | Product category |
| `unit_price` | number | Yes | Price per unit in Rs. |
| `current_stock` | integer | No | Starting stock (default: 0) |
| `min_stock_alert` | integer | No | Low-stock alert threshold (default: 5) |
| `location` | string | No | Warehouse bin/shelf location |

**Success Response — `201 Created`:** Returns the created product object.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | `"SKU already exists"` | Duplicate SKU |
| `403` | `"Forbidden: Insufficient permissions"` | Insufficient role |

---

### `PUT /api/products/:id`

Update an existing product. SKU cannot be changed after creation.

**Authentication required:** Yes  
**Required role:** `Warehouse` (or `Admin`)

**URL Parameter:** `id` — product ID (integer)

**Request Body:** Same as POST, minus `sku` and `current_stock` (stock is managed via inventory adjustments, not direct edit).

**Success Response — `200 OK`:** Returns the updated product object.

---

### `DELETE /api/products/:id`

Permanently delete a product.

**Authentication required:** Yes  
**Required role:** `Admin` only

**URL Parameter:** `id` — product ID (integer)

**Success Response — `200 OK`:**
```json
{ "message": "Product deleted" }
```

---

---

## 5. Inventory APIs

---

### `GET /api/inventory/movements`

Retrieve stock movement history (all IN/OUT entries), newest first.

**Authentication required:** Yes (any role)

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `product_id` | integer | No | Filter movements for a specific product |

**Example:** `GET /api/inventory/movements?product_id=3`

**Success Response — `200 OK`:**
```json
[
  {
    "id": 22,
    "product_id": 3,
    "product_name": "Steel Rod 10mm",
    "quantity_changed": 100,
    "movement_type": "IN",
    "reason": "Received from supplier",
    "created_by": 2,
    "created_by_name": "Warehouse Manager",
    "created_at": "2024-06-05T11:00:00.000Z"
  }
]
```

---

### `POST /api/inventory/adjust`

Manually adjust stock for a product (IN or OUT).

**Authentication required:** Yes  
**Required role:** `Warehouse` (or `Admin`)

**Request Body:**
```json
{
  "product_id": 3,
  "quantity": 50,
  "movement_type": "IN",
  "reason": "Received from supplier"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `product_id` | integer | Yes | Valid product ID |
| `quantity` | integer | Yes | Must be ≥ 1 |
| `movement_type` | string | Yes | `"IN"` \| `"OUT"` |
| `reason` | string | No | Free text description |

**Success Response — `200 OK`:**
```json
{
  "message": "Stock adjusted",
  "newStock": 300,
  "movement": {
    "id": 23,
    "product_id": 3,
    "quantity_changed": 50,
    "movement_type": "IN",
    "reason": "Received from supplier",
    "created_at": "2024-06-05T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | `"Insufficient stock for OUT movement"` | OUT quantity exceeds current stock |
| `404` | `"Product not found"` | Invalid product_id |
| `403` | `"Forbidden: Insufficient permissions"` | Non-Warehouse/Admin role |

---

---

## 6. Challan APIs

---

### `GET /api/challans`

List all sales challans, newest first.

**Authentication required:** Yes (any role)

**Success Response — `200 OK`:**
```json
[
  {
    "id": 12,
    "challan_number": "CH-2024-0012",
    "customer_id": 1,
    "customer_name": "Ravi Enterprises",
    "status": "Confirmed",
    "total_quantity": 50,
    "created_by": 3,
    "created_by_name": "Sales User",
    "created_at": "2024-06-01T10:00:00.000Z"
  }
]
```

---

### `GET /api/challans/:id`

Get full detail of a single challan including all line items.

**Authentication required:** Yes (any role)

**URL Parameter:** `id` — challan ID (integer)

**Success Response — `200 OK`:**
```json
{
  "id": 12,
  "challan_number": "CH-2024-0012",
  "customer_name": "Ravi Enterprises",
  "customer_mobile": "9876543210",
  "business_name": "Ravi Pvt. Ltd.",
  "status": "Confirmed",
  "total_quantity": 50,
  "created_by_name": "Sales User",
  "created_at": "2024-06-01T10:00:00.000Z",
  "items": [
    {
      "id": 31,
      "challan_id": 12,
      "product_id": 3,
      "product_name_snapshot": "Steel Rod 10mm",
      "sku_snapshot": "STL-ROD-10",
      "unit_price_snapshot": "450.00",
      "quantity": 50
    }
  ]
}
```

> **Note on snapshots:** `product_name_snapshot`, `sku_snapshot`, and `unit_price_snapshot` are the values at time of challan creation, frozen so the challan is not affected by future product edits.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `404` | `"Challan not found"` | Invalid ID |

---

### `POST /api/challans`

Create a new sales challan. Can be saved as `"Draft"` or immediately `"Confirmed"`.

**Authentication required:** Yes  
**Required role:** `Sales` (or `Admin`)

> When `status` is `"Confirmed"`, stock availability is checked and stock is deducted atomically in a database transaction.

**Request Body:**
```json
{
  "customer_id": 1,
  "status": "Draft",
  "products": [
    { "product_id": 3, "quantity": 50 },
    { "product_id": 7, "quantity": 20 }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `customer_id` | integer | Yes | Valid active customer ID |
| `status` | string | Yes | `"Draft"` \| `"Confirmed"` |
| `products` | array | Yes | At least 1 product line |
| `products[].product_id` | integer | Yes | Valid product ID |
| `products[].quantity` | integer | Yes | Must be ≥ 1 |

**Success Response — `201 Created`:** Returns the created challan object.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | `"At least one product is required"` | Empty products array |
| `400` | `"Insufficient stock for \"...\"..."` | Stock too low for Confirmed challan |
| `403` | `"Forbidden: Insufficient permissions"` | Non-Sales/Admin role |

---

### `PATCH /api/challans/:id/cancel`

Cancel a challan. Only `Draft` challans can be cancelled. Stock is NOT reversed (it was never deducted for drafts).

**Authentication required:** Yes  
**Required role:** `Sales` (or `Admin`)

**URL Parameter:** `id` — challan ID (integer)

**Request Body:** None

**Success Response — `200 OK`:** Returns the updated challan with `status: "Cancelled"`.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | `"Only Draft challans can be cancelled"` | Challan is already Confirmed or Cancelled |
| `404` | `"Challan not found"` | Invalid ID |

---

### `PATCH /api/challans/:id/confirm`

Confirm a Draft challan. Checks stock availability for all items and deducts stock atomically.

**Authentication required:** Yes  
**Required role:** `Sales` (or `Admin`)

**URL Parameter:** `id` — challan ID (integer)

**Request Body:** None

**Success Response — `200 OK`:** Returns the updated challan with `status: "Confirmed"`.

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `400` | `"Only Draft challans can be confirmed"` | Already Confirmed or Cancelled |
| `400` | `"Insufficient stock for \"...\"..."` | A product has insufficient stock |
| `404` | `"Challan not found"` | Invalid ID |

---

### `GET /api/challans/:id/pdf`

Generate and download a professional PDF of the challan.

**Authentication required:** Yes (any role)

**URL Parameter:** `id` — challan ID (integer)

**Response:**  
- `Content-Type: application/pdf`  
- `Content-Disposition: attachment; filename="challan-CH-2024-0012.pdf"`
- Binary PDF stream

**PDF Contents:**
- Company header with portal name
- Challan number, date, and status badge
- Customer details (name, business, mobile, GST)
- Line-item table: Product Name | SKU | Qty | Unit Price | Total
- Grand Total
- Created By + generation timestamp

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| `404` | `"Challan not found"` | Invalid ID |
| `500` | `"Failed to generate PDF"` | PDF generation error |

---

---

## Appendix — Example: Full Auth Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Response:
# { "token": "eyJ...", "user": { "id":1, "name":"Admin", "role":"Admin" } }

# 2. Use token
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer eyJ..."

# 3. Download PDF
curl http://localhost:5000/api/challans/1/pdf \
  -H "Authorization: Bearer eyJ..." \
  --output challan-CH-2024-0001.pdf
```
