# HealthPulse 🚑

A centralized, real-time healthcare resource coordination platform connecting patients and hospitals. HealthPulse acts as a Command Node, enabling low-latency updates for emergency routing, hospital inventory, and secure patient dispatching across a synchronization network.

---

## 🚀 Key Features

- **Centralized Command Node**: Real-time hospital resource telemetry (beds, blood, oxygen, active crises).
- **Live Synchronization Network**: Instant updates powered by WebSockets (Socket.io) and Redis.
- **Role-Based Access**: Distinct portals and dashboards for Patients and Hospitals.
- **Secure Architecture**: JWT-based authentication, Zod request validation, and strict rate-limiting.
- **Modern UI/UX**: Premium "Clean Light Bento" design aesthetic using Tailwind CSS v4 and Framer Motion.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, custom `globals.css`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Network**: Axios, Socket.io-client

### Backend (Server)
- **Framework**: Node.js, Express 5
- **Database**: MongoDB (Mongoose)
- **Real-Time & Caching**: Redis, Socket.io (with Redis Adapter)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Validation**: Zod
- **Queue & Background Jobs**: BullMQ
- **Uploads**: Cloudinary, Multer

---

## 📁 Project Structure

```text
HealthPulse/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Next.js App Router Pages
│   │   ├── components/       # Reusable UI & Layout Components
│   │   ├── context/          # React Context (AuthContext)
│   │   └── lib/              # Utility functions and API configuration
│   ├── public/               # Static assets
│   └── package.json
│
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Auth, Validation, Error Handling
│   │   ├── models/           # Mongoose DB Schemas
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # Business logic & telemetry
│   │   ├── socket/           # Socket.io event handlers
│   │   └── workers/          # Background tasks (Email, Notifications)
│   ├── server.js             # Server entry point
│   └── package.json
```

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/f7aditya/HealthPulse.git
cd HealthPulse
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
REDIS_URL=redis://localhost:6379
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend/` directory with the following variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
