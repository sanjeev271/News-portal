# 📰 News Portal

> A full-stack, real-time news publishing and live broadcasting platform built with the MERN stack.

News Portal is a modern digital media platform designed for publishers, news agencies, and content creators. It provides a complete ecosystem for publishing articles, managing content, broadcasting live events, and delivering real-time updates to readers.

The platform combines a powerful Content Management System (CMS), live streaming capabilities, reader engagement features, and role-based administration into a single scalable application.

---

## 🚀 Features

### 👥 Reader Experience

* Breaking news ticker
* Latest and featured stories
* Category-based article browsing
* Full-text article search
* Trending news section
* Rich article pages with images and videos
* Article bookmarking
* Comments and likes
* Dark mode support
* English & Hindi language support
* Real-time content updates

### 📰 Content Management

* Create, edit, publish, and delete articles
* Draft and scheduled publishing
* Rich text editor
* Media uploads
* SEO metadata support
* Category management
* Slug-based SEO-friendly URLs

### 📡 Live Broadcasting

#### WebRTC Broadcasting

* Live webcam streaming
* Real-time viewer delivery
* Socket.io signaling
* Automatic recording support

#### External Streaming

* YouTube Live integration
* HLS stream support
* Embedded iframe streams

### 👨‍💼 Administration

* Analytics dashboard
* User management
* Role management
* Category management
* Advertisement management
* SEO settings
* Live broadcast scheduling
* Platform monitoring

### ⚡ Real-Time Features

* Instant article publishing updates
* Live broadcast status notifications
* Real-time engagement events
* Socket.io powered communication
* WebRTC signaling events

---

## 🛠 Technology Stack

| Layer                | Technology                       |
| -------------------- | -------------------------------- |
| Frontend             | React 19, React Router 7, Vite 8 |
| Styling              | Tailwind CSS 4                   |
| Backend              | Node.js, Express 5               |
| Database             | MongoDB, Mongoose 9              |
| Real-Time            | Socket.io 4                      |
| Live Streaming       | WebRTC                           |
| Authentication       | JWT, bcryptjs                    |
| Uploads              | Multer                           |
| Internationalization | i18next                          |
| HTTP Client          | Axios                            |

---


## 📂 Project Structure

```text
news-portal/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── socket/
│   │   └── utils/
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## 📋 Prerequisites

Before running the application, ensure the following are installed:

* Node.js 18+
* MongoDB 6+
* npm or yarn
* Webcam (optional for live broadcasting)

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone <repository-url>

cd news-portal
```

---

## 2. Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/newsportal

JWT_SECRET=your-super-secret-jwt-key

ADMIN_EMAIL=admin@newsportal.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

Start the backend server:

```bash
npm run dev
```

or

```bash
npm start
```

Backend will run on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 🔐 Default Admin Credentials

On first startup, the application automatically creates a default administrator account.

| Field    | Value                                               |
| -------- | --------------------------------------------------- |
| Email    | [admin@newsportal.com](mailto:admin@newsportal.com) |
| Password | admin123                                            |
| Role     | Admin                                               |

### Access Admin Dashboard

```text
http://localhost:5173/admin
```

---

## 🚀 Running the Application

### Start MongoDB

```bash
mongod
```

### Start Backend

```bash
cd backend

npm run dev
```

### Start Frontend

```bash
cd frontend

npm run dev
```

### Open Browser

```text
http://localhost:5173
```

---

## 👥 User Roles

| Role     | Permissions                   |
| -------- | ----------------------------- |
| Admin    | Full platform control and can create Editor and Reporter|
| Editor   | No Special access |
| Reporter | No Special access    |
| User     | Read, comment, like, bookmark |

---

## 🔌 API Overview

### Authentication

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/auth/register` |
| POST   | `/api/auth/login`    |
| GET    | `/api/auth/profile`  |

### Articles

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/api/articles`           |
| GET    | `/api/articles/:slug`     |
| GET    | `/api/articles/search?q=` |
| GET    | `/api/articles/trending`  |
| POST   | `/api/articles`           |

### Live Broadcast

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/api/live/active` |
| POST   | `/api/live`        |
| PUT    | `/api/live/:id`    |

### Engagement

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/api/comments`         |
| POST   | `/api/likes/:articleId` |
| GET    | `/api/bookmarks`        |

---

## 📡 Socket.io Events

| Event             | Purpose                    |
| ----------------- | -------------------------- |
| new_article       | New article published      |
| live_status       | Live stream status changed |
| join_live_room    | Join live stream           |
| webrtc_offer      | WebRTC signaling           |
| webrtc_answer     | WebRTC signaling           |
| webrtc_ice        | ICE candidate exchange     |
| push_notification | Real-time notifications    |

---

## 🔒 Security

* JWT Authentication
* Role-Based Access Control
* Password Hashing using bcryptjs
* Protected Admin Routes
* Secure File Uploads
* Environment Variable Configuration

