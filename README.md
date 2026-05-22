# CollabNet - Collaborative Code Editor

A real-time collaborative code editor platform built with modern web technologies. CollabNet enables multiple users to code together, communicate via chat and video calls, and share their work seamlessly.

## 🎯 Project Overview

CollabNet is a full-stack web application that allows developers to:
- **Collaborate in real-time** on code files with live synchronization
- **Draw and whiteboard** together using the drawing editor
- **Video & voice calls** with peer-to-peer connections
- **Chat** with other collaborators
- **Run code** in multiple programming languages
- **Share files** and manage project structures
- **View user presence** with user activity tracking

## 🏗️ Architecture

The project consists of three main components:

### Client (Frontend)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Code Editor**: CodeMirror + Monaco Editor
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.IO client
- **P2P Communications**: Simple Peer (WebRTC)
- **Drawing**: tldraw

### Server (Backend)
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time Features**: Socket.IO server
- **CORS**: Enabled for cross-origin requests
- **Environment Config**: dotenv

### Code Execution (Optional)
- **Docker Container**: Piston API for code execution
- **Supported Languages**: 50+ programming languages
- **Deployment**: Can run locally or use public API

## 📁 Project Structure

```
CollabNet/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── editor/        # Code editor components
│   │   │   ├── chats/         # Chat functionality
│   │   │   ├── call/          # Video/voice call
│   │   │   ├── drawing/       # Drawing editor
│   │   │   ├── files/         # File manager
│   │   │   ├── sidebar/       # Navigation
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── api/               # API integrations
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # Global styling
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── types/             # TypeScript definitions
│   │   └── server.ts          # Main server file
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── scripts/                   # Utility scripts
│   └── test-collaboration.mjs
│
├── docker-compose.yml         # Docker configuration for Piston
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional, for running code execution locally)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CollabNet
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

#### Development Mode

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:3000` (or configured port)

2. **Start the client (in a new terminal)**
   ```bash
   cd client
   npm run dev
   ```
   The client will start on `http://localhost:5173`

3. **(Optional) Start Piston for code execution**
   ```bash
   docker compose up -d
   ```
   Configure the client to use local Piston by setting in `client/.env`:
   ```
   VITE_PISTON_API_URL=http://localhost:2000/api/v2
   ```

#### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Build the server**
   ```bash
   cd server
   npm run build
   ```

3. **Start production server**
   ```bash
   cd server
   npm start
   ```

## 🛠️ Key Technologies

### Frontend Stack
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript | Type-safe development |
| Vite | Fast build tool |
| Tailwind CSS | Styling |
| Socket.IO | Real-time communication |
| Simple Peer | P2P video/voice |
| CodeMirror | Code editing |
| Monaco Editor | Advanced code editing |
| tldraw | Drawing/whiteboarding |
| React Router | Navigation |

### Backend Stack
| Technology | Purpose |
|-----------|---------|
| Express.js | Web framework |
| TypeScript | Type safety |
| Socket.IO | WebSocket server |
| CORS | Cross-origin support |
| dotenv | Environment variables |

## 🎨 Core Features

### Real-time Code Collaboration
- Live code synchronization across multiple users
- Collaborative highlighting to see cursor positions
- File tree management with create/rename/delete operations

### Communication
- **Chat System**: Send and receive messages in real-time
- **Video/Voice Calls**: P2P connections using WebRTC
- **User Presence**: See who's active and online

### Code Execution
- Run code in 50+ programming languages
- Output display and error handling
- Integration with Piston API

### Drawing & Whiteboarding
- Collaborative drawing canvas
- Real-time shape synchronization
- Multiple drawing tools

### File Management
- View project file structure
- Create, rename, and delete files
- Download files and projects

## 📝 Configuration

### Environment Variables (Client)
Create `client/.env`:
```
VITE_SERVER_URL=http://localhost:3000
VITE_PISTON_API_URL=https://api.piston.codes/api/v2
```

### Environment Variables (Server)
Create `server/.env`:
```
PORT=3000
NODE_ENV=development
```

## 🔧 Available Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server
```bash
npm run dev      # Start development with hot reload
npm run build    # Compile TypeScript
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 Project Structure Details

### Client Components
- **`Editor`**: Main code editor with syntax highlighting
- **`ChatList/ChatInput`**: Real-time chat interface
- **`CallPanel`**: Video/voice call interface
- **`DrawingEditor`**: Collaborative whiteboard
- **`FileStructureView`**: Project file explorer
- **`Sidebar`**: Navigation and tool buttons
- **`Users`**: Display active collaborators

### Client Context (State Management)
- **`AppContext`**: Global application state
- **`ChatContext`**: Chat messages and state
- **`FileContext`**: File management
- **`SocketContext`**: WebSocket connection
- **`ViewContext`**: UI view preferences
- **`CopilotContext`**: AI assistant state

### Client Hooks
- `useContextMenu`: Right-click menu handler
- `useFullScreen`: Fullscreen mode toggling
- `useLocalStorage`: Browser storage utilities
- `useResponsive`: Responsive design helpers
- `useUserActivity`: Track user interactions
- `useWindowDimensions`: Window size tracking

## 🔌 API Integration

### Piston API (Code Execution)
- Execute code in multiple languages
- Integration point: `src/api/pistonExecute.ts`
- Fallback languages configuration: `src/constants/pistonFallbackLanguages.ts`

### Pollinations API (Optional)
- Image generation or AI features
- Integration point: `src/api/pollinationsApi.ts`

## 📊 Socket Events

Real-time communication events handled by Socket.IO:
- File updates and synchronization
- User presence and activity
- Chat messages
- Code execution results
- Drawing canvas updates
- Call initiation and status

## 🧪 Testing

Run the collaboration test script:
```bash
npm run test
# or
node scripts/test-collaboration.mjs
```

## 🐛 Debugging

### Frontend Debugging
- Use React Developer Tools browser extension
- Check browser console for Socket.IO connection logs
- Enable debug mode in Socket.IO client

### Backend Debugging
- Server logs print to console
- Check Socket.IO connection status
- Monitor incoming/outgoing events

## 📦 Docker Support

Run Piston API locally for code execution:
```bash
docker compose up -d
```

Container details:
- **Image**: ghcr.io/engineer-man/piston:latest
- **Port**: 2000
- **Auto-restart**: Enabled

## 🚀 Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy the `dist/` folder to any static hosting (Vercel, Netlify, AWS S3, etc.)

### Backend Deployment
- Build: `npm run build`
- Run: `npm start`
- Ensure environment variables are set on the hosting platform

### Docker Deployment
- Include docker-compose.yml for Piston container
- Configure container networking and port mappings

## 📖 Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **Socket.IO Documentation**: https://socket.io/docs/
- **React Documentation**: https://react.dev/
- **Express Documentation**: https://expressjs.com/
- **Piston API**: https://piston.readthedocs.io/

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Team

CollabNet is a collaborative project. Contributors include developers working on frontend, backend, and integration features.

---

**Last Updated**: May 2026

For questions or support, please open an issue in the repository.
