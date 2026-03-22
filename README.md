# Verifind

Verifind is a secure and verified real estate platform focused on the Abuja market. It connects tenants with verified agents and features an escrow payment system to ensure completely secure transactions.

## Features

- Property Listing and Verification Workflow
- Secure Escrow Payments (Paystack Integration)
- Role-based Authentication (Tenant / Agent) with OTP Verification
- Agent Certification Tracking and Dashboard
- Responsive Liquid Glass UI Design

## Tech Stack

- Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide React
- Backend: Node.js, Express.js, MongoDB (Mongoose)
- Security: JSON Web Tokens (JWT), bcrypt, Helmet, Express Rate Limit
- Integrations: Paystack (Payments), Resend (Email)

## Application Architecture

The platform is split into a separate frontend and backend application. 

For frontend development, the application features an intricate Offline Mock Engine. If the frontend cannot reach the backend server, it will automatically intercept API calls and use a simulated IndexedDB/localStorage database to process robust authentication (OTP generation and validation) and property management locally.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or a MongoDB Atlas URI)

### Backend Setup

1. Navigate to the backend directory
   ```bash
   cd backend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Environment Configuration
   Create a `.env` file in the backend directory with the following keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/verifind
   JWT_SECRET=your_super_secret_jwt_key
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   NODE_ENV=development
   
   # Optional: Paystack and Resend keys
   # RESEND_API_KEY=
   # EMAIL_FROM=
   # PAYSTACK_SECRET_KEY=
   ```
4. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```
4. The client will be available at `http://localhost:3000`.

## Scripts

### Backend
- `npm run dev` - Starts the backend server with nodemon for hot-reloading
- `npm start` - Starts the backend server in production mode

### Frontend
- `npm run dev` - Starts the Vite development server
- `npm run build` - Builds the application for production
- `npm run preview` - Locally preview the production build
