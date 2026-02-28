
# 💊 MediStore

### 🏥 Your Trusted Online Medicine Shop

> A full-stack multi-role e-commerce platform for purchasing **Over-The-Counter (OTC)** medicines online.
> Built with secure authentication, role-based authorization, and a scalable relational database architecture using PostgreSQL.

---

## 🌐 Live Links

🔗 **Frontend Live:**
[https://medi-store-client-wheat.vercel.app/](https://medi-store-client-wheat.vercel.app/)

🔗 **Backend Live:**
[https://medi-store-server-eta.vercel.app/](https://medi-store-server-eta.vercel.app/)

📦 **Frontend Repository:**
[https://github.com/Piash2K/medi-store-client.git](https://github.com/Piash2K/medi-store-client.git)

🛠️ **Backend Repository:**
[https://github.com/Piash2K/medi-store-server.git](https://github.com/Piash2K/medi-store-server.git)

🎥 **Demo Video:**
[https://drive.google.com/file/d/11H2vAuP3WRlBmh4mL1i5I9DrC4vr1t81/view?usp=sharing](https://drive.google.com/file/d/11H2vAuP3WRlBmh4mL1i5I9DrC4vr1t81/view?usp=sharing)

---

# 🌟 Project Overview

**MediStore** is a production-ready multi-role medicine marketplace system where:

* 👤 Customers browse and purchase OTC medicines
* 🏪 Sellers manage inventory and fulfill orders
* 🛡️ Admin oversees users, medicines, and platform operations

The system follows a clean layered architecture with relational data modeling and secure API design.

---

# 🎯 Core Features

## 🌍 Public Features

* Browse all OTC medicines
* Search by name & manufacturer
* Filter by category & price
* View detailed product information

---

## 👤 Customer Panel

* Secure Registration & Login
* Add to Cart
* Cash on Delivery Checkout
* Track Order Status
* Leave Reviews
* Manage Profile

---

## 🏪 Seller Dashboard

* Add / Edit / Delete Medicines
* Manage Stock
* View Orders
* Update Order Status

---

## 🛡️ Admin Dashboard

* View All Users
* Ban / Unban Users
* Manage Medicines
* View All Orders
* Manage Categories

---

# 🧑‍💻 Tech Stack

## 🖥️ Frontend

* Next.js
* React.js
* Tailwind CSS
* ShadCN UI
* TanStack Query
* Axios

## 🛠️ Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM / pg
* JWT Authentication
* Role-Based Authorization

---

# 🗄️ Database Architecture (PostgreSQL)

Relational schema with proper foreign key constraints:

## 🧍 Users

* id
* name
* email (unique)
* password
* role (customer | seller | admin)
* status (active | banned)
* created_at

## 📂 Categories

* id
* name
* description

## 💊 Medicines

* id
* name
* description
* manufacturer
* price
* stock
* category_id (FK → Categories)
* seller_id (FK → Users)
* created_at

## 📦 Orders

* id
* customer_id (FK → Users)
* total_price
* shipping_address
* status
* created_at

## 📦 Order_Items

* id
* order_id (FK → Orders)
* medicine_id (FK → Medicines)
* quantity
* price

## ⭐ Reviews

* id
* user_id (FK → Users)
* medicine_id (FK → Medicines)
* rating
* comment
* created_at

---

# 🔄 Order Lifecycle

```text
PLACED → PROCESSING → SHIPPED → DELIVERED
               ↘
            CANCELLED
```

---

# 🔐 Security Implementation

* JWT-based Authentication
* Role-based Middleware (Admin / Seller / Customer)
* Protected API Routes
* Secure Password Hashing (bcrypt)
* SQL Injection Protection (Parameterized Queries / ORM)
* Ownership validation for sellers

---

# 📁 Project Structure

```
medi-store/
│
├── client (Next.js Frontend)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── server (Express Backend)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── prisma/ (if using Prisma)
│   └── config/
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repositories

### Frontend

```bash
git clone https://github.com/Piash2K/medi-store-client.git
cd medi-store-client
npm install
npm run dev
```

### Backend

```bash
git clone https://github.com/Piash2K/medi-store-server.git
cd medi-store-server
npm install
npm run dev
```

---

# 🌍 Environment Variables (Server)

Create a `.env` file inside the server folder:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/medistore
JWT_SECRET=your_secret_key
```

---

# 🏆 Why This Project Stands Out

✔ Multi-role marketplace architecture
✔ Production-style relational database design
✔ Proper foreign key relationships
✔ Clean REST API structure
✔ Secure authentication & authorization
✔ Real-world order lifecycle

---

# 🚀 Future Enhancements

* Stripe Payment Integration
* Transaction-based order processing
* Seller analytics dashboard
* Inventory low-stock alerts
* Dockerized deployment
* CI/CD pipeline

---

