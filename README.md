# CollabNet

CollabNet contains a React frontend and a Node.js backend for real-time collaboration.

## Project Structure

- `Frontend/` - Vite + React client application
- `Backend/` - Express + Socket.IO server

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Setup

Install dependencies for both apps:

```bash
cd Frontend
npm install

cd ../Backend
npm install
```

## Run the Project

Start frontend and backend in separate terminals.

Terminal 1 (frontend):

```bash
cd Frontend
npm run dev
```

Terminal 2 (backend):

```bash
cd Backend
node server.js
```

By default:

- Frontend runs on Vite's dev server (usually `http://localhost:5173`)
- Backend runs on `http://localhost:3000`

## Frontend Scripts

Run inside `Frontend/`:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Notes

- Server entry file: `Backend/server.js`
- Uses `express`, `socket.io`, and `y-socket.io`
