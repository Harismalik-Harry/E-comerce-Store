# 🛍️ ShopVerse — Full-Stack E-Commerce Platform

A feature-rich, dual-role e-commerce application built with the **PERN stack** (PostgreSQL, Express, React, Node.js). Designed for scalability with advanced database features like triggers, views, and stored procedures.

## 🎥 Demo Video

[Watch Demo on YouTube](https://youtu.be/xTRiehR0IJ8)


## ✨ Features

### 🛒 For Customers
- **Seamless Shopping**: Browse products with advanced filtering and search.
- **Smart Cart**: Real-time stock validation and management.
- **Secure Checkout**: Integrated checkout flow with order tracking.
- **User Dashboard**: Manage profiles, view order history, and receive notifications.
- **Authentication**: Google OAuth and Email/Password login.

### 🏪 For Sellers
- **Store Management**: Create and customize your own digital storefront.
- **Product Hub**: Add, edit, and manage inventory with real-time stock tracking.
- **Analytics Dashboard**: Vizualize revenue, sales trends, and order statuses.
- **Order Fulfillment**: Process orders and update shipping statuses.

### ⚙️ Technical Highlights
- **Role-Based Access Control (RBAC)**: Strict separation between Customer and Seller routes.
- **Advanced Database**:
  - **Views**: Optimized data retrieval for dashboards and listings.
  - **Triggers**: Auto-updates for ratings, stock checks, and notifications.
  - **Stored Procedures**: Atomic checkout transactions to prevent race conditions.
- **Modern UI**: Built with React, Tailwind CSS, Framer Motion, and Lucide Icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Auth**: @react-oauth/google

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM/Query**: `node-postgres` (pg)
- **Authentication**: JWT, Google OAuth Library
- **Security**: Bcrypt, Helmet, CORS

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shopverse.git
cd shopverse
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following:
```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ecommerce_db

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Run Database Migrations:**
Initialize the database tables and advanced features (triggers, views):
```bash
npm run migrate:all
```
> This command runs both basic table creation and advanced feature setup.

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` (or update existing):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the application:
```bash
npm run dev
```

### 4. Run with Docker 🐳

The project is fully containerized. You can run the entire stack (Frontend, Backend, Database) with a single command.

1. Ensure you have Docker and Docker Compose installed.
2. Create a `.env` file in the root directory (or ensure individual `.env` files are set if needed, though the compose file looks for them in root or uses defaults).
   > **Note**: The `docker-compose.yml` uses environment variables. You can create a `.env` file in the root specific for Docker if needed, or rely on the defaults.

   Example root `.env`:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=ecommerce_store
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   GOOGLE_CLIENT_ID=...
   VITE_GOOGLE_CLIENT_ID=...
   ```

3. Run the stack:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Database: `localhost:5433`

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── db/            # Database connection & migrations
│   │   ├── middlewares/   # Auth & error handling
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   └── server.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios setup & endpoints
│   │   ├── components/    # Reusable UI components
│   │   ├── layouts/       # Main & Seller layouts
│   │   ├── pages/         # Application pages
│   │   ├── stores/        # Zustand state stores
│   │   └── lib/           # Utilities
│   └── App.jsx            # Routing setup
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the ISC License.
