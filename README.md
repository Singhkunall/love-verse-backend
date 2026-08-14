# ⚙️ Love-Verse Backend 🚀

<div align="center">

![Love-Verse Backend Banner](https://img.shields.io/badge/Love--Verse-Backend%20API-ff4081?style=for-the-badge&logo=express)

**High-Performance Real-Time API Engine & WebSocket Server for Couples**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.2-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Cloud-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Frontend Repo](https://github.com/Singhkunall/love-verse-frontend) • [Report Issue](https://github.com/Singhkunall/love-verse-backend/issues)

</div>

---

## 🌟 Overview

**Love-Verse Backend** is the core server infrastructure powering the Love-Verse couple platform. Built with **Node.js**, **Express 5**, **MongoDB**, and **Socket.io**, it orchestrates bi-directional real-time messaging, WebRTC signaling, dynamic media uploads, live product scraping, payment order creation, game state synchronization, and couple memory tracking.

---

## 🚀 Key Modules & Services

- 🔑 **Authentication & Pairing Engine**: JWT & Google OAuth authentication flow with unique pairing code creation to securely link partners into a private room.
- ⚡ **WebSocket Communication Core**: Socket.io server supporting 25+ events for instant chat, video sync, live location, love nudges, and game moves.
- 📹 **Agora & PeerJS Signaling**: Dynamic RTC token generator for Agora channels + PeerJS WebRTC peer matching for audio/video calling.
- 🛒 **Amazon Scraper & Razorpay Checkout**: Real-time product search with `cheerio` + `axios` and payment order creation via Razorpay SDK.
- ☁️ **Media Cloud Management**: Cloudinary integration for handling high-resolution avatar uploads and voice recordings.
- 🎙️ **Voice Notes Storage**: Voice recording API handling upload, Cloudinary cloud storage, playback, and reaction statuses.
- 📌 **Universe Pin & Routine Tracker**: REST endpoints managing memory locations, daily habits, wishlists, and couple anniversary milestones.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Mongoose 9](https://mongoosejs.com/)
- **WebSockets**: [Socket.io 4](https://socket.io/)
- **Media & File Storage**: [Cloudinary](https://cloudinary.com/), `multer`, `multer-storage-cloudinary`
- **Real-Time Video/Audio**: `agora-token`, `peer`
- **Web Scraping**: `axios`, `cheerio`
- **Payments**: `razorpay`
- **Authentication**: `jsonwebtoken`, `bcryptjs`, `google-auth-library`
- **Mailing**: `nodemailer`, `resend`, `sib-api-v3-sdk`

---

## 📁 Repository Structure

```text
backend/
├── config/
│   └── db.js                  # MongoDB Mongoose connection client
├── controllers/
│   └── authController.js      # Auth, partner pairing, profile, and memory handlers
├── middleware/                # Custom auth and error handling middlewares
├── models/                    # MongoDB Database Schemas
│   ├── Event.js               # Calendar events schema
│   ├── Memory.js              # Romantic memory storage schema
│   ├── Message.js             # Real-time chat messages schema
│   ├── Nudge.js               # Love pokes and hugs log schema
│   ├── Roulette.js            # Spinner wheel items schema
│   ├── Routine.js             # Shared tasks and daily habits schema
│   ├── UniversePin.js         # Map location markers schema
│   ├── User.js                # User profile and partner link schema
│   ├── VoiceNote.js           # Audio recordings metadata schema
│   └── Wishlist.js            # Couple wishlist items schema
├── routes/                    # Express API Router Modules
│   ├── agoraRoutes.js         # Agora RTC token generator endpoint
│   ├── authRoutes.js          # Authentication, pairing, profile, and nudges
│   ├── event.routes.js        # Couple calendar CRUD routes
│   ├── roulette.js            # Date activity spinner wheel routes
│   ├── routineRoutes.js       # Daily habits and routines routes
│   ├── universe.js            # Universe memory pins routes
│   ├── voiceNoteRoutes.js     # Voice notes audio recording routes
│   └── wishlistRoutes.js       # Scraper, wishlist CRUD & Razorpay payment routes
├── uploads/                   # Temporary file upload cache
├── utils/                     # Helper utilities
├── server.js                  # Express application setup & Socket.io handlers
├── vercel.json                # Vercel deployment configuration
└── package.json               # Backend dependencies & npm scripts
```

---

## 📡 API Reference Overview

### 🔑 Authentication & User Profile (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/google-login` | Authenticate user with Google OAuth token |
| `POST` | `/api/auth/connect` | Pair two user accounts using a pair code |
| `GET` | `/api/auth/profile/:id` | Get user profile and linked partner details |
| `POST` | `/api/auth/update-anniversary` | Update couple anniversary date |
| `POST` | `/api/auth/update-mood` | Update user current mood status |
| `POST` | `/api/auth/update-avatar` | Upload profile avatar to Cloudinary |
| `POST` | `/api/auth/send-nudge` | Send love poke/hug to partner |

### 💬 Chat & Voice Notes (`/api/chat`, `/api/voice-notes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/chat/history/:roomId` | Fetch chat history for a couple room |
| `GET` | `/api/voice-notes/:roomId` | Fetch voice notes for a room |
| `POST` | `/api/voice-notes/upload` | Upload audio voice note to Cloudinary |
| `PUT` | `/api/voice-notes/react/:id` | Add reaction emoji to voice note |

### 🎁 Wishlist & Razorpay (`/api/wishlist`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/wishlist/search-products?q=query` | Live product search from Amazon via cheerio |
| `GET` | `/api/wishlist/:roomId` | Fetch all wishlist items for couple |
| `POST` | `/api/wishlist/add` | Add new item to wishlist |
| `POST` | `/api/wishlist/checkout` | Create Razorpay order |
| `POST` | `/api/wishlist/verify` | Verify Razorpay payment & update item status |

### ⚡ Main Socket.io Event Channels

- `join_chat` / `leave_chat` - Enter/Leave couple room
- `send_message` / `receive_message` - Live text & image chat
- `typing` / `display_typing` - Real-time typing status
- `ludo_roll` / `ludo_move` / `ludo_winner` - Synchronized Ludo game
- `send_chess_move` / `receive_chess_move` - Real-time chess sync
- `initiate_memory_game` / `card_flip` - Memory card matching game
- `change_video` / `play_video` / `pause_video` / `seek_video` - YouTube Watch Together sync
- `update_location` / `location_updated` - Real-time location sharing
- `send_call_signal` / `incoming_call_signal` - WebRTC calling signals

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB Atlas** database URI
- **Cloudinary** credentials
- **Agora** App ID & Certificate

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Singhkunall/love-verse-backend.git
cd love-verse-backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` root directory:

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/love-verse?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Agora Configuration
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Running Development Server

Start the backend server with hot-reloading:

```bash
npm run dev
```

The server will start on `http://localhost:8000`.

---

## ☁️ Deployment

### Render / Vercel Deployment

1. Set environment variables in your deployment dashboard (Render/Vercel).
2. Configure build command: `npm install`
3. Configure start command: `npm start` (`node server.js`)

---

## 🔗 Related Repositories

- 🎨 **Frontend**: [love-verse-frontend](https://github.com/Singhkunall/love-verse-frontend)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">

Made with ❤️ by [Kunal Singh](https://github.com/Singhkunall)

</div>
