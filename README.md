# 🛡️ Rakshak AI — Your 360° Health Emergency Shield

A real-time healthcare emergency platform with AI risk prediction, SOS alerts, QR medical passports, and Google Fit integration.

## Features
- 🧠 **Health Risk Prediction** — Rule-based scoring using BMI, age, lifestyle + Google Fit data
- 🚨 **SOS Emergency** — One-click alert with live GPS via Socket.io
- 🪪 **Medical Passport** — QR code linking to your emergency medical profile
- 🗺️ **Hospital Finder** — Live map using Leaflet.js + OpenStreetMap (free)
- 📈 **Recovery Tracker** — Daily vitals logging with trend charts
- 🏃 **Google Fit Sync** — Steps, heart rate, and sleep via OAuth 2.0

## Tech Stack
`React` `Node.js` `Express` `MongoDB` `Socket.io` `Google Fit API` `Leaflet.js` `JWT` `Recharts`

## Quick Start
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Deploy
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://mongodb.com/atlas)

## Google Fit Setup
1. Enable **Fitness API** in Google Cloud Console
2. Create OAuth 2.0 credentials (Web Application)
3. Add redirect URI: `http://localhost:5173/fit-callback`

---
*Built for India's healthcare emergency needs* 🇮🇳
