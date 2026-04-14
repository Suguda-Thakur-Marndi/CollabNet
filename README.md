# CollabNet

CollabNet is a real-time collaborative code editor built with:

- React + Vite frontend
- Monaco Editor for in-browser code editing
- Node.js + Express backend
- Socket.IO + Yjs (via y-socket.io) for live collaboration

## Project Structure

- `Frontend/` - React client (Vite)
- `Backend/` - Express + Socket.IO collaboration server

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

Install dependencies in both apps.

```bash
cd Frontend
npm install

cd ../Backend
npm install
```

## Running Locally

Run frontend and backend in separate terminals.

Frontend:

```bash
cd Frontend
npm run dev
```

Backend:

```bash
cd Backend
npm start
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## How to Use

1. Start both servers.
2. Open the frontend in your browser.
3. Enter a username in the join form.
4. Open the same app in another tab/window with a different username to test live collaboration.

The editor content is synced across connected clients in real time.

## Available Scripts

Frontend (`Frontend/`):

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

Backend (`Backend/`):

- `npm start` - Start the server (`server.js`)

## Health Check

Backend health endpoint:

- `GET /health` -> http://localhost:3000/health

## Tech Stack

- React 19
- Vite 7
- Monaco Editor
- Yjs
- y-monaco
- Socket.IO
- y-socket.io
- Express
