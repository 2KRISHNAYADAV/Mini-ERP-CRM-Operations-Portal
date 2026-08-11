# Mini ERP + CRM Operations Portal: A Complete Beginner's Guide

Welcome to the **Mini ERP + CRM Operations Portal**! If you are a complete beginner with zero programming or web development experience, you are in the right place. 

This document is written specifically for you. It explains every tool, file, concept, and line of code in simple, everyday language. By the end of this guide, you will understand how this entire application is built, how data flows through it, and how you can run or modify it yourself.

---

## Table of Contents
1. [Project Introduction & Core Modules](#1-project-introduction)
2. [Complete System Architecture (How Data Flows)](#2-complete-system-architecture)
3. [Deep Dive: The Frontend (React + TypeScript)](#3-explain-frontend-in-deep-detail)
4. [Deep Dive: The Backend (Node.js + Express)](#4-explain-backend-completely)
5. [API Documentation (The Web Bridges)](#5-explain-every-api)
6. [Database Structure (How We Store Data)](#6-explain-database-completely)
7. [Supabase Setup Guide](#7-explain-supabase-setup)
8. [How Authentication & Security Work](#8-explain-authentication)
9. [Business Logic Deep Dive (Sales Challan)](#9-explain-business-logic)
10. [Step-by-Step Code Flow Example](#10-explain-complete-code-flow)
11. [How Deployment Works (Vercel, Render, Supabase)](#11-explain-deployment)
12. [Version Control & GitHub Structure](#12-explain-github-structure)
13. [Absolute Beginner Learning Guide](#13-beginner-learning-section)
14. [Step-by-Step Developer Workflow](#14-developer-workflow)
15. [Visual System Diagrams](#15-add-diagrams)

---

## 1. Project Introduction

### What is this Project?
This project is a **Mini ERP + CRM Portal**. It is a private website used by a business to manage its daily operations, keep track of customers, control its inventory (stock of products), and create delivery documents called **Sales Challans**.

### What is an ERP?
**ERP** stands for **Enterprise Resource Planning**. 
* **Enterprise**: A business or company.
* **Resource**: Everything a company owns or uses (money, products in stock, employees, trucks, etc.).
* **Planning**: Managing these resources so the company doesn't run out of stock, lose money, or forget orders.

*Analogy:* Think of a restaurant. If they don't count how many tomatoes they have, they might run out during dinner. An ERP is like a digital notebook that automatically counts the tomatoes every time a chef makes pasta, alerts them when they are running low, and keeps track of where they buy tomatoes.

### What is a CRM?
**CRM** stands for **Customer Relationship Management**.
* It is a tool to store contact details, purchase histories, and notes about your customers.
* Without a CRM, salespeople might lose customer phone numbers, forget who promised a discount, or forget to follow up with a client.

### Real-World Example: "The Wholesale Candy Distributor"
Let's see how a fictional company, **SweetTreats Distribution**, uses this system in real life:

1. **The Salesperson (CRM)**: A sales rep visits a local candy store (a customer). Using our CRM, the rep registers the store's business details, mobile number, and GST tax number, and sets a follow-up date.
2. **The Warehouse Manager (Inventory)**: In the warehouse, 500 bags of gummy bears are received. The warehouse manager uses the portal to increase the stock level of gummy bears.
3. **Creating an Order (Sales Challan)**: The candy store orders 100 bags of gummy bears. The sales rep logs into the portal and creates a **Sales Challan** (a delivery note) listing the customer and the 100 bags.
4. **Draft vs. Confirmation (Business Logic)**: 
   * The challan starts as a **Draft**. The gummy bears are still sitting on the warehouse shelf.
   * When the delivery truck is ready to leave, the manager clicks **Confirm**. The system automatically checks: *"Are there 100 bags available?"* 
   * Yes! The system immediately decrements the stock from 500 to 400, logs an `OUT` movement, and locks the challan so it can never be altered again.

---

### Explained: Every Single Module in This Portal

*   **Authentication (Security)**: The doorway. Only registered users with a secure password can enter. It checks who you are and decides what you are allowed to see.
*   **Dashboard (The Control Tower)**: The home page. It displays quick cards (e.g., total active customers, how many challans were made today) and flags a list of "Low Stock Alerts" so you know what to order next.
*   **Customer CRM (Client Notebook)**: A digital filing cabinet. You can create new customers, edit their addresses, check their tax IDs, and write notes (e.g., *"Only calls on Tuesdays"*).
*   **Product Management (Item Catalog)**: A catalog of everything you sell. Each item has a unique name, SKU (Stock Keeping Unit ID code), category, and unit price.
*   **Inventory (Stock Tracker)**: A live ledger showing every time items are added (`IN`) or removed (`OUT`) from the warehouse, including timestamps and the name of the user who made the change.
*   **Sales Challan (Delivery Records)**: A formal document listing items being sent to a customer. It acts as proof of delivery and calculates total item amounts dynamically.
*   **User Roles (Access Permissions)**: Different jobs get different screens:
    *   *Admin*: Full access to all modules, including editing/deleting any resource.
    *   *Sales*: Can manage customers and create/draft challans, but cannot change product quantities manually.
    *   *Warehouse*: Can view products, adjust stock levels manually, and verify stock shipments.
    *   *Accounts*: Read-only access to customer logs and challan documents for billing.
*   **Product Image Upload**: Allows warehouse staff to upload real photos of products. These are saved in a cloud storage bucket so everyone can visually identify items.
*   **PDF Challan Export**: A button that compiles the customer details, challan number, and items into a clean PDF document ready to print and hand to the delivery driver.

---

## 2. Complete System Architecture

To understand how a full-stack application works, you must understand how data travels. Here is the lifecycle of an action in our app:

```
┌──────────────┐      HTTP Request      ┌──────────────────────┐
│  Web Browser │   ─────────────────►   │ Node.js/Express App  │
│ (React UI)   │   ◄─────────────────   │ (Backend Server)     │
└──────────────┘      JSON Response     └──────────┬───────────┘
                                                   │
                                                   │ SQL Query
                                                   ▼
                                        ┌──────────────────────┐
                                        │ Supabase PostgreSQL  │
                                        │ (Database)           │
                                        └──────────────────────┘
```

### Detailed Breakdown of the Journey

Let's trace exactly what happens when a user clicks the **"Confirm Challan"** button in their browser:

1.  **The User Action**: The user clicks "Confirm" on their screen.
2.  **React Frontend**: The React browser application detects the click event. It gathers the Challan ID from the screen and calls a helper function.
3.  **Axios (The Delivery Truck)**: Axios is a tool that sends requests across the internet. It packages the information into a standard web packet called an **HTTP POST Request** and sends it to our backend server's URL: `https://our-backend.com/api/challans/45/confirm`.
4.  **Node.js & Express (The Receptionist)**: 
    *   **Node.js** runs our backend code on a computer server.
    *   **Express** is a routing system. It listens for incoming internet requests. When it sees a request directed at `/api/challans/:id/confirm`, it directs it to the right file.
5.  **Middleware (The Security Guard)**: Before reaching the code that confirms the challan, a security middleware script inspects the request. It checks: *"Does this packet contain a valid security token (JWT)? Is this user authorized?"* If yes, the guard lets the packet pass. If no, it blocks it and sends back a `401 Unauthorized` error.
6.  **Controller (The Coordinator)**: The controller receives the request. It is responsible for calling database commands. 
    *   First, it asks the database: *"Fetch the items inside Challan ID 45."*
    *   It checks each product's quantity. If the warehouse has enough stock, it tells the database to execute a **Transaction** (a group of SQL instructions that must all succeed or fail together).
7.  **Database Query (SQL)**: The backend sends SQL code to our database:
    ```sql
    UPDATE products SET current_stock = current_stock - 10 WHERE id = 5;
    UPDATE challans SET status = 'Confirmed' WHERE id = 45;
    ```
8.  **Supabase PostgreSQL (The Vault)**: Supabase runs a secure database named PostgreSQL. It updates the rows inside the database tables and replies back to our server: *"Successfully updated!"*
9.  **Controller Response**: The controller takes this success message, wraps it in a clean format called **JSON**, and tells Express to send it back to the browser.
10. **React Re-renders**: The frontend (Axios) receives the success response. React immediately updates the screen, changing the Challan status badge from yellow `Draft` to green `Confirmed` and decreasing the product counts.

---

## 3. Explain Frontend in Deep Detail

The **Frontend** is what the user sees and interacts with in their web browser.

### What is React?
React is a JavaScript library built by Facebook. Instead of writing massive, messy HTML pages, React lets us build a website using small, self-contained Lego bricks called **Components**.
*   *Without React*: If a button changes a stock number, you have to write manual code to find the number on the screen and replace the text.
*   *With React*: React automatically re-draws the screen whenever the data changes.

### What is TypeScript?
TypeScript is a strict blueprint layer built on top of JavaScript. 
*   In plain JavaScript, if you accidentally type `customer.nme` instead of `customer.name`, the code runs, fails silently, and crashes your site.
*   In TypeScript, the computer warns you *before* you run the code: *"Hey, there is no property 'nme' on a Customer! Did you mean 'name'?"*

### Folder Structure (frontend/)

Here is why each folder exists in our frontend:

```
frontend/
├── src/
│   ├── api/            # Functions that handle Axios calls (sends requests to backend)
│   ├── components/     # Reusable building blocks (buttons, input boxes, modals)
│   ├── context/        # Global state storage (e.g. holding user login details)
│   ├── pages/          # Full pages/screens (Login, Dashboard, Products, Customers)
│   ├── routes/         # Rules determining which Page component shows at which URL
│   ├── types/          # TypeScript structural blueprints (Interfaces)
│   └── utils/          # Universal helper functions (formatting dates, formatting currency)
```

#### Why do we split code this way?
If we put all our code in a single file, it would be thousands of lines long and impossible to read. Splitting files by **responsibility** makes it easy to find bugs. If an API call fails, you check `src/api/`. If a button looks wrong, you check `src/components/`.

---

### Walkthrough Example: Logging In

1.  **User Enters Input**: The user types `admin@test.com` and `password123` into the email and password fields on the Login page.
2.  **React Stores State**: React saves these characters inside its internal temporary memory (`state`).
3.  **Axios Sends Request**: When the user clicks "Login", Axios packages these inputs into a `POST /api/auth/login` request.
4.  **Backend Verifies User**: The backend checks the database, finds the matching user, validates the password hash, and creates a secure key called a **JWT Token**.
5.  **JWT Token Returned**: The backend sends the JWT token back to the frontend.
6.  **Token Stored**: React receives the token, saves it inside the browser's persistent `localStorage`, and routes the user directly to the Dashboard.

---

## 4. Explain Backend Completely

The **Backend** is the engine under the hood. It runs on a remote server, holds the secrets, talks to the database, and processes data.

### What is Node.js?
Normally, JavaScript only runs inside web browsers (like Chrome or Safari) to make buttons click. **Node.js** is a program that lets us run JavaScript directly on a computer or server system, outside the browser. This allows us to read files, run servers, and connect to databases.

### What is Express.js?
Express is a framework built on top of Node.js that makes it easy to handle incoming web traffic. It listens to specific web paths (URLs) and forwards requests to the correct controller code.

### What is a Server?
A server is simply a computer connected to the internet 24/7. It sits waiting for browsers to send it requests, processes them, and returns responses.

### What is an API?
**API** stands for **Application Programming Interface**. It is a designated window through which different software programs talk to each other. 
*   *Analogy*: In a restaurant, you (the frontend) cannot go into the kitchen (the database). You look at a menu and tell the waiter (the API) what you want. The waiter goes to the kitchen, gets the food, and brings it back to your table.

### What is a REST API?
A REST API is an organized, standard way of structuring web requests using standard actions:
*   `GET`: Fetch data (Read)
*   `POST`: Create new data (Write)
*   `PUT`/`PATCH`: Update existing data (Edit)
*   `DELETE`: Remove data (Delete)

### Folder Structure (backend/)

```
backend/
├── src/
│   ├── config/         # Credentials and database setup configurations
│   ├── controllers/    # Receives HTTP requests, executes DB logic, returns responses
│   ├── middleware/     # Verification checks that block or allow requests
│   ├── routes/         # Links URL endpoints to their corresponding controllers
│   ├── types/          # Blueprint structures for server data
│   ├── db.ts           # The portal code connecting our server to Supabase
│   └── server.ts       # Starting point of the server that opens the network port
```

### Request Flow: `GET /api/products`

Here is what happens when the frontend requests the product catalog:

```
[Frontend Axios Request]
         │
         ▼
  [Route Handler]   --> Matches GET /api/products
         │
         ▼
   [Middleware]     --> Checks if user JWT token is valid
         │
         ▼
   [Controller]     --> Runs database query SELECT * FROM products
         │
         ▼
[Database Response] --> Returns rows to server
         │
         ▼
[HTTP JSON Response]--> Sends product list back to the browser
```

---

## 5. Explain Every API

Below is the list of web routes (endpoints) our backend server exposes. The frontend uses Axios to talk to these paths.

### Authentication API

#### `POST /api/auth/login`
*   **Purpose**: Log in a user.
*   **Auth Required**: No (anyone can access this to log in).
*   **Request Body**:
    ```json
    {
      "email": "admin@test.com",
      "password": "password123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@test.com",
        "role": "Admin"
      }
    }
    ```

---

### Customers API

#### `GET /api/customers`
*   **Purpose**: Fetch all customers.
*   **Auth Required**: Yes.
*   **Response**: Array of customer objects containing IDs, business details, types, and mobile numbers.

#### `POST /api/customers`
*   **Purpose**: Create a new customer.
*   **Auth Required**: Yes (restricted to Sales / Admin).
*   **Request Body**:
    ```json
    {
      "customer_name": "Acme Corp",
      "mobile_number": "9876543210",
      "email": "contact@acme.com",
      "business_name": "Acme Candy LLC",
      "gst_number": "27AAAAA0000A1Z5",
      "customer_type": "Wholesale",
      "address": "123 Sugar Street"
    }
    ```
*   **Response (201 Created)**: The newly created customer object including its generated database ID.

#### `GET /api/customers/:id`
*   **Purpose**: Get details of a single customer by ID.
*   **Auth Required**: Yes.

#### `PUT /api/customers/:id`
*   **Purpose**: Update an existing customer's details.
*   **Auth Required**: Yes (restricted to Sales / Admin).

#### `DELETE /api/customers/:id`
*   **Purpose**: Delete a customer.
*   **Auth Required**: Yes (restricted to Admin only).

---

### Products API

#### `GET /api/products`
*   **Purpose**: Get a list of all products.
*   **Auth Required**: Yes.

#### `POST /api/products`
*   **Purpose**: Add a new product to the catalog.
*   **Auth Required**: Yes (restricted to Warehouse / Admin).
*   **Request Body**:
    ```json
    {
      "product_name": "Chocolate Gummy Bears",
      "sku": "CHOC-GUM-001",
      "category": "Confectionery",
      "unit_price": 4.50,
      "current_stock": 100,
      "min_stock_alert": 10
    }
    ```
*   **Response (201 Created)**: The created product object.

#### `PUT /api/products/:id`
*   **Purpose**: Edit product price, stock level, or details.
*   **Auth Required**: Yes (Warehouse / Admin).

---

### Inventory API

#### `GET /api/inventory/movements`
*   **Purpose**: View history log of stock changes.
*   **Auth Required**: Yes.

#### `POST /api/inventory/movement` (Implemented on `/api/inventory/adjust`)
*   **Purpose**: Manually adjust stock levels (IN or OUT).
*   **Auth Required**: Yes (Warehouse / Admin).
*   **Request Body**:
    ```json
    {
      "product_id": 5,
      "quantity_changed": 50,
      "movement_type": "IN",
      "reason": "Restocked due to new shipment"
    }
    ```

---

### Sales Challan API

#### `POST /api/challans`
*   **Purpose**: Create a new sales challan (defaults to Draft).
*   **Auth Required**: Yes (Sales / Admin).
*   **Request Body**:
    ```json
    {
      "customer_id": 2,
      "status": "Draft",
      "products": [
        { "product_id": 1, "quantity": 10 },
        { "product_id": 3, "quantity": 5 }
      ]
    }
    ```

#### `GET /api/challans`
*   **Purpose**: Get all challans.
*   **Auth Required**: Yes.

#### `GET /api/challans/:id`
*   **Purpose**: Fetch details of a single challan including all its item lines.
*   **Auth Required**: Yes.

#### `POST /api/challans/:id/confirm`
*   **Purpose**: Process and seal the challan, subtracting quantities from warehouse inventory.
*   **Auth Required**: Yes (Sales / Admin).

#### `POST /api/challans/:id/cancel`
*   **Purpose**: Mark a Draft challan as Cancelled.
*   **Auth Required**: Yes (Sales / Admin).

---

## 6. Explain Database Completely

The database is the system's long-term memory. We use **PostgreSQL**, hosted on **Supabase**.

*   **What is PostgreSQL?** A robust, open-source relational database. It stores data inside tables (similar to Excel spreadsheets) with strict rules.
*   **What is Supabase?** A platform that hosts our database in the cloud and provides tools like user management, file storage (for images), and real-time APIs.

### Database Tables & Structure

#### 1. `users` (Employees who log in)
Stores staff accounts.
*   `id` (Primary Key): Unique ID number.
*   `name`: Name of the user.
*   `email`: Email used to log in.
*   `password_hash`: Secure, scrambled version of the user's password.
*   `role`: Level of access ('Admin', 'Sales', 'Warehouse', 'Accounts').

#### 2. `customers` (CRM records)
Stores customer businesses.
*   `id` (Primary Key): Unique customer ID.
*   `customer_name`, `business_name`, `mobile_number`, `gst_number`, `address`, `status`.

#### 3. `products` (Inventory catalog)
Stores inventory items.
*   `id` (Primary Key): Unique product ID.
*   `sku`: Stock Keeping Unit (unique code like `GUM-BEAR-01`).
*   `current_stock`: How many we have in the warehouse.
*   `min_stock_alert`: Warn us if stock drops below this number.

#### 4. `stock_movements` (Stock Ledger)
Logs every inventory change.
*   `id` (Primary Key): Unique record ID.
*   `product_id` (Foreign Key): Tells us *which* product changed.
*   `quantity_changed`: Quantity changed.
*   `movement_type`: `IN` (added) or `OUT` (removed).
*   `reason`: e.g., "Challan CH-2026-0004" or "Manual adjustment".

#### 5. `challans` (Delivery headers)
Stores the cover information of a delivery.
*   `id` (Primary Key): Unique challan ID.
*   `challan_number`: Friendly code like `CH-2026-0001`.
*   `customer_id` (Foreign Key): Which customer receives this.
*   `status`: 'Draft', 'Confirmed', or 'Cancelled'.

#### 6. `challan_items` (Delivery line items)
Stores the products listed inside each challan.
*   `id` (Primary Key): Unique item record ID.
*   `challan_id` (Foreign Key): Which challan does this line item belong to?
*   `product_id` (Foreign Key): Link to the original product.
*   `product_name_snapshot`: The name of the product at the time of order.
*   `unit_price_snapshot`: The price at the time of order.
*   `quantity`: Quantity ordered.

---

### Crucial Database Concepts

*   **Primary Key**: A unique ID that identifies a single row in a table. No two rows can share the same Primary Key.
*   **Foreign Key**: A link pointing to a Primary Key in another table. For example, `challans.customer_id` is a Foreign Key referencing `customers.id`. This ensures you cannot create a challan for a customer that does not exist.
*   **Indexes**: Like the index at the back of a textbook. Instead of reading the entire database line-by-line, indexes help PostgreSQL locate records instantly (e.g. looking up a product by its SKU code).
*   **Timestamps (`created_at`)**: Automatically records the exact second a database row was created.

---

## 7. Supabase Setup Guide

To get this application running, you must set up a Supabase account:

1.  **Create Project**: Go to [Supabase](https://supabase.com), log in, and click "New Project". Give it a name and password.
2.  **Initialize Tables**: Open the **SQL Editor** tab in the Supabase sidebar. Paste the text from [backend/schema.sql](file:///d:/project%20system/caseinfo/backend/schema.sql) and click **Run**. This builds the tables, indexes, and constraints.
3.  **Get Credentials**: Go to Project Settings -> Database. Under **Connection string**, select **URI**. It will look like this:
    `postgresql://postgres.[YOUR_PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`

### The `.env` File (Environment Variables)
*   **What is it?** A text file storing configuration values and secret API keys.
*   **Why is it important?** It separates credentials from the code.
*   **Why keep it secret?** **Never upload `.env` files to GitHub!** If you do, anyone can view your credentials, access your database, delete your data, or steal user information.

#### Environment Variables Used
*   `SUPABASE_URL`: The URL to your Supabase cloud services.
*   `DATABASE_URL`: The direct database connection login URI (starts with `postgresql://`).
*   `SUPABASE_SERVICE_KEY`: The secure key giving administrative access to storage and database operations.

---

## 8. How Authentication & Security Work

We use **JWT (JSON Web Token)** authentication to verify user identities.

```
1. User logs in with Email/Password ──► 2. Backend checks password with bcrypt
                                                    │
5. Browser sends token with future requests ◄── 3. Backend signs & generates a JWT
```

### Step-by-Step Authentication Flow

1.  **Password Hashing (bcrypt)**: When a user registers or logs in, we never store plain text passwords. We hash them using `bcrypt`.
    *   *Plaintext*: `password123`
    *   *Hashed version*: `$2b$10$xyz789ABC...` (completely irreversible).
2.  **Verification**: When logging in, `bcrypt` compares the entered password with the stored hash. If they match, the backend generates a **JWT**.
3.  **What is a JWT?** A JSON Web Token is a secure string that contains user information:
    ```json
    {
      "id": 5,
      "role": "Sales",
      "name": "Jane Doe"
    }
    ```
    This data is digitally signed by the backend using the secret key (`JWT_SECRET`). It cannot be modified by the user.
4.  **Token Storage**: The backend sends the JWT to the browser. The React application saves it in the browser's storage (`localStorage`).
5.  **Headers**: Every time the browser makes an API request (e.g. fetching customers), Axios attaches the token inside the HTTP headers:
    `Authorization: Bearer <token_string>`
6.  **Role-Based Access Control (RBAC)**: The backend middleware reads the token, identifies the user, and blocks the request if the user's role is not authorized.

---

## 9. Business Logic Deep Dive (Sales Challan)

The **Sales Challan** module contains the core business logic of the ERP.

```
[Create Draft Challan] ──► [Wait for Delivery] ──► [Confirm Challan]
                                                          │
                                         ┌────────────────┴────────────────┐
                                         ▼                                 ▼
                                 [Check Stock]                    [Deduct Inventory]
```

### Why Stock Cannot Become Negative
If stock goes below zero, the company is committing to sell items it does not own. This leads to delivery failures, administrative confusion, and accounting errors. The database enforces a `CHECK (current_stock >= 0)` constraint, and the backend verifies stock levels before confirming orders.

### Why Product Snapshot is Stored
Inside `challan_items`, we store duplicate columns named `product_name_snapshot` and `unit_price_snapshot`. 
*   **Why?** Suppose you sell 10 notebooks for $5.00 each on January 1st. On February 1st, you change the notebook's price in your catalog to $7.00.
*   **The Problem**: If the invoice queries the `products` table directly, your old January invoice will suddenly show a price of $7.00, breaking past accounting records.
*   **The Solution**: Storing a snapshot captures the price at the exact moment of sale. The snapshot remains locked even if you update the catalog price later.

---

## 10. Step-by-Step Code Flow Example

Let's follow the lifecycle of creating a new customer:

```
[CustomerForm.tsx] (UI Form)
        │
        ▼ (Calls API function)
[customerService.ts] (Axios Request)
        │
        ▼ (Sends over the internet)
[customer.routes.ts] (Express Routing)
        │
        ▼ (Validates & Processes)
[customer.controller.ts] (SQL Query Execution)
        │
        ▼ (Inserts into DB)
[Supabase Database] (PostgreSQL Table)
```

1.  **User Interface (`CustomerForm.tsx`)**:
    *   The user fills out the name "Acme Corp" in a text box and clicks "Save".
2.  **API Function (`customerService.ts`)**:
    *   The React app calls `customerService.createCustomer({ name: 'Acme Corp', ... })`.
    *   Axios sends a `POST` request containing the user's JWT token to `/api/customers`.
3.  **Routing (`customer.routes.ts`)**:
    *   The Express backend receives the request. It matches `/api/customers` and routes it to the `createCustomer` controller.
4.  **Security & Validation (`auth.ts` middleware)**:
    *   The middleware checks the JWT. It confirms the user has permissions to write customer records.
5.  **Controller Processing (`customers.controller.ts`)**:
    *   The controller extracts the customer fields and executes an SQL query:
        ```sql
        INSERT INTO customers (customer_name, business_name, ...) VALUES ($1, $2, ...) RETURNING *;
        ```
6.  **Database Success**:
    *   Supabase inserts the customer row, generates a new ID, and returns the saved row.
7.  **The Response**:
    *   The backend responds with `201 Created` and sends back the saved customer details.
    *   The React frontend receives this, adds it to the list, and triggers a toast notification: *"Customer added successfully!"*

---

## 11. How Deployment Works

Once your code works locally, you deploy it to the web so anyone can use it.

### 1. Frontend: Vercel
Vercel is a static hosting platform.
*   It takes your React code, builds it into plain HTML, CSS, and JS files, and serves it globally on super-fast delivery networks.
*   **Env Variables**: You must add `VITE_API_URL` pointing to your deployed backend URL.

### 2. Backend: Render
Render runs continuous server containers in the cloud.
*   It downloads your backend project, installs Node.js dependencies, compiles TypeScript to JavaScript, and runs `npm start` to keep your server running 24/7.
*   **Env Variables**: You must add `DATABASE_URL`, `JWT_SECRET`, and `PORT`.

### 3. Database & Storage: Supabase
*   **PostgreSQL**: Supabase runs the database engine.
*   **Storage**: A cloud folder structure. When you upload a product photo, the backend sends it to Supabase Storage and gets back a public URL, which is then stored in the product's database record.

---

## 12. Version Control & GitHub Structure

When working on code, we use **Git** (managed on **GitHub**).

*   **Why use Git?** Git acts like a timeline generator. If you make a mistake that crashes the app, you can roll back to a time when it worked.
*   **Commits**: A commit is like saving your game progress. You write descriptive commit messages explaining *what* was modified (e.g. `"feat: added JWT authorization middleware"`).
*   **The `.gitignore` File**: A text file telling Git which folders to ignore. We put `.env` and `node_modules` inside it so they are never uploaded, keeping our code repository secure and lightweight.

---

## 13. Absolute Beginner Learning Guide

Before building or customizing this codebase, make sure you understand these base concepts:

1.  **JavaScript Basics**: Learn about variables (`const`, `let`), arrays, array methods (`.map()`, `.filter()`), objects, functions, and asynchronous operations (`async/await`).
2.  **TypeScript Basics**: Learn what types are (`string`, `number`, `boolean`) and how to define structures using `interface`.
3.  **React Basics**: Understand how components receive inputs called `props`, how components store internal memory with `useState`, and how components run setup functions with `useEffect`.
4.  **Node.js & Express Basics**: Understand ports (e.g. `localhost:5000`), request headers, parameters, and query options.
5.  **SQL Basics**: Understand the four CRUD operations: `SELECT` (read), `INSERT` (write), `UPDATE` (edit), and `DELETE` (delete). Learn how `JOIN` combines multiple tables together.
6.  **Authentication**: Understand client-server communication, headers, cookie-based or bearer token tokens, and encryption hashing.

---

## 14. Step-by-Step Developer Workflow

This is the standard workflow developers follow when writing a new feature:

```
Step 1: DB Schema  ──►  Step 2: Backend Routes  ──►  Step 3: Controller Logic
                                                                │
Step 6: UI Design  ◄──  Step 5: Frontend API   ◄──  Step 4: API Testing (Postman)
```

1.  **Update Database**: Write the SQL script to create or update tables in Supabase (e.g. adding a new table for suppliers).
2.  **Create Backend Routes**: Define the new API paths in the backend routes directory.
3.  **Write Controller Logic**: Create functions to query the database and validate request parameters.
4.  **Test Backend**: Run the server and test endpoints using tools like Postman or VS Code REST Client.
5.  **Write Frontend API Call**: Add Axios helper functions in the frontend `api/` directory.
6.  **Build UI Component**: Create React pages or buttons to display the new information.
7.  **Commit & Deploy**: Push your clean code to GitHub and watch Vercel and Render automatically update your live site!

---

## 15. Diagrams

### Complete System Architecture Map
```
               ┌────────────────────────────────────────────────────────┐
               │                     Web Browser                        │
               │                                                        │
               │  ┌───────────────────────┐      ┌──────────────────┐    │
               │  │       React UI        │ ◄─── │  Global Context  │    │
               │  │  (Pages & Components) │      │  (User / Auth)   │    │
               │  └──────────┬────────────┘      └──────────────────┘    │
               │             │                                          │
               │             ▼ (Axios API Helper Calls)                 │
               │  ┌───────────────────────┐                             │
               │  │     API Services      │                             │
               │  └──────────┬────────────┘                             │
               └─────────────┼──────────────────────────────────────────┘
                             │
                             │ HTTP POST / GET / PATCH Requests
                             ▼
               ┌────────────────────────────────────────────────────────┐
               │                 Node.js Express Server                 │
               │                                                        │
               │             Routes (/api/challans)                     │
               │                       │                                │
               │                       ▼                                │
               │             Auth / Role Middleware                     │
               │                       │                                │
               │                       ▼                                │
               │             Controllers (Challan Handler)              │
               │                       │                                │
               │                       ▼                                │
               │             Direct DB SQL execution                    │
               └───────────────────────┬────────────────────────────────┘
                                       │
                                       │ SQL Connection Pool
                                       ▼
               ┌────────────────────────────────────────────────────────┐
               │                  Supabase PostgreSQL                   │
               │                                                        │
               │   ┌───────────────┐           ┌────────────────────┐   │
               │   │    products   │ ◄──────── │    challan_items   │   │
               │   └───────────────┘           └─────────┬──────────┘   │
               │                                         │              │
               │                                         ▼              │
               │   ┌───────────────┐           ┌────────────────────┐   │
               │   │   customers   │ ◄──────── │      challans      │   │
               │   └───────────────┘           └────────────────────┘   │
               └────────────────────────────────────────────────────────┘
```

### Database Entity Relationship Diagram (ERD)
```
  ┌───────────────┐               ┌───────────────────────┐
  │     users     │               │    stock_movements    │
  ├───────────────┤               ├───────────────────────┤
  │ id (PK)       │ ◄──────────┐  │ id (PK)               │
  │ name          │            │  │ product_id (FK) ──────┼───┐
  │ email         │            └──│ created_by (FK)       │   │
  │ password_hash │               │ quantity_changed      │   │
  │ role          │               │ movement_type         │   │
  └───────────────┘               └───────────────────────┘   │
          ▲                                                   │
          │                                                   │
          │ ┌─────────────────────────────────────────────────┘
          │ │
          ▼ ▼
  ┌───────────────┐               ┌───────────────────────┐
  │   products    │               │     challan_items     │
  ├───────────────┤               ├───────────────────────┤
  │ id (PK)       │ ◄──────────┐  │ id (PK)               │
  │ product_name  │            │  │ challan_id (FK) ──────┼───┐
  │ sku           │            └──│ product_id (FK)       │   │
  │ unit_price    │               │ product_name_snapshot │   │
  │ current_stock │               │ unit_price_snapshot   │   │
  └───────────────┘               └───────────────────────┘   │
                                                              │
                                                              │
          ┌───────────────────────────────────────────────────┘
          ▼
  ┌───────────────┐               ┌───────────────────────┐
  │   customers   │               │       challans        │
  ├───────────────┤               ├───────────────────────┤
  │ id (PK)       │ ◄──────────┐  │ id (PK)               │
  │ customer_name │            └──│ customer_id (FK)      │
  │ mobile_number │               │ challan_number        │
  │ business_name │               │ status                │
  └───────────────┘               └───────────────────────┘
```

---

Good luck on your learning journey! You now possess the foundation of a complete full-stack web developer. Explore the files in this directory to see how they bring this documentation to life.
