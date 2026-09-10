# CollabNet — Real-Time Collaborative Developer IDE

> A full-stack real-time collaborative code editor and developer platform built for distributed engineering teams. Code together, manage files, execute programs in an interactive cloud terminal, chat, make WebRTC voice/video calls, and brainstorm on a shared infinite whiteboard — all inside a single browser tab.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## 📖 Table of Contents

1. [Overview & Value Proposition](#-overview--value-proposition)
2. [Tech Stack & Dependency Map](#-tech-stack--dependency-map)
3. [UI/UX Design System](#-uiux-design-system)
4. [Architecture](#️-architecture)
5. [Repository Structure](#-repository-structure)
6. [Key Features](#-key-features)
7. [Keyboard Shortcuts](#️-keyboard-shortcuts)
8. [Getting Started](#-getting-started)
9. [Docker / Production-Parity Setup](#-docker--production-parity-setup)
10. [Socket.IO Event Reference](#-socketio-event-reference)
11. [Production Build](#️-production-build)
12. [AWS Production Architecture](#️-aws-production-architecture)
13. [License](#-license)

---

## 🎯 Overview & Value Proposition

**CollabNet** combines the power and keyboard-centric efficiency of a modern desktop IDE with real-time browser collaboration:

| Feature | Description |
|---|---|
| 🖊️ **Multi-Cursor Code Editing** | Synchronized CodeMirror editor with remote user cursors, selections, and live presence |
| 🖥️ **Interactive Cloud Terminal** | Full `xterm.js` PTY terminal with multi-tab support, drag-to-resize, and bidirectional streaming over WebSockets |
| 📁 **File System Management** | Tree explorer with nesting guides, inline F2 rename, accessible custom modals, and ZIP project export |
| 💬 **Real-Time Group Chat** | Speech-bubble UI with timestamps, word-wrap, auto-scroll, and typing indicators |
| 📹 **P2P Audio & Video Calls** | Low-latency mesh WebRTC calling with camera/microphone device toggles and grid layout |
| 🎨 **Infinite Collaborative Whiteboard** | `tldraw`-powered drawing canvas with live shape/stroke synchronization |
| 🤖 **AI Copilot** | Integrated code generation assistant backed by the Pollinations AI API (upgradeable to Amazon Bedrock) |
| ⚡ **Multi-Language Code Runner** | Run code in 80+ languages via the Piston API with program output panel |
| 📊 **Developer Dashboard** | Workspace home with system status, quick actions, and 1-click recent session rejoin from `localStorage` |

---

## 🧰 Tech Stack & Dependency Map

### Frontend (`client/`)

| Category | Library / Version |
|---|---|
| **Framework** | React `19.2.x` + TypeScript `6.0.x` |
| **Build Tool** | Vite `8.x` |
| **Routing** | React Router DOM `v7.15` |
| **Styling** | Tailwind CSS `v4` + Vanilla CSS design tokens |
| **Code Editor** | `@uiw/react-codemirror` `4.23.x` + `@uiw/codemirror-extensions-langs`, `codemirror-themes-all` |
| **Monaco Editor** | `@monaco-editor/react` `4.7.x` + `monaco-editor` `0.55.x` |
| **Terminal** | `@xterm/xterm` `6.x` + `@xterm/addon-fit` `0.11.x` |
| **Whiteboard** | `tldraw` `2.4.x` |
| **WebRTC** | `simple-peer` `9.11.x` |
| **Sockets** | `socket.io-client` `4.8.x` |
| **Icons** | `react-icons` `5.6.x` + `@iconify/react` `5.x` + `vscode-icons-js` |
| **Notifications** | `react-hot-toast` `2.4.x` |
| **Markdown** | `react-markdown` + `react-syntax-highlighter` |
| **File Export** | `jszip` + `file-saver` |
| **Utilities** | `axios`, `uuid`, `classnames`, `screenfull`, `lang-map`, `react-avatar` |

### Backend (`server/`)

| Category | Library / Version |
|---|---|
| **Runtime** | Node.js `v18+` with TypeScript `5.9.x` |
| **Framework** | Express `4.21.x` |
| **WebSockets** | Socket.IO Server `4.8.x` |
| **PTY Shell** | `node-pty` `1.1.x` — native Windows/Linux PTY with child-process fallback |
| **Dev Runner** | `tsx` `4.22.x` (watch mode) |
| **Env Config** | `dotenv` `16.x` |
| **CORS** | `cors` `2.8.x` |

---

## 🎨 UI/UX Design System

CollabNet follows a strict, developer-first design system:

| Token Category | Value / Specification |
|---|---|
| **Theme & Aesthetic** | Dark Mode (OLED / Deep Slate) — high contrast, low eye fatigue |
| **Density Dial** | `8/10` (Dense / Dashboard) — optimized for screen real estate |
| **Motion Dial** | `3/10` (Subtle) — 150–200ms transitions, `prefers-reduced-motion` compliant |
| **Typography (UI)** | **IBM Plex Sans** (300, 400, 500, 600, 700) |
| **Typography (Code)** | **JetBrains Mono** / Space Mono (monospace code, terminal, breadcrumbs) |
| **Primary Accent** | `#3B82F6` (Electric Blue / Active Focus) |
| **Secondary Accent** | `#22C55E` (Emerald Green / Connected Status / Terminal) |
| **Canvas Background** | `#0B0F17` (Deep Obsidian Canvas) |
| **Surface Panels** | `#111827` (Sidebars & Toolbars) |
| **Elevated Cards** | `#161F30` (Active Tabs, Modals, Dropdowns) |
| **Border Tokens** | `#26334A` (Subtle container divisions) |
| **Icon System** | Lucide SVG icons (`react-icons/lu`) — zero emojis used as UI icons |

> Design system source of truth: [`design-system/collabnet/MASTER.md`](design-system/collabnet/MASTER.md)

---

## 🏗️ Architecture

```
                               ┌────────────────────────────────────────┐
                               │            Client (Browser)            │
                               │  React 19 + TypeScript + Vite + Tailwind │
                               └───────────────────┬────────────────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        │ WebSocket (Socket.IO)              WebRTC (P2P Mesh)│
                        ▼                                                     ▼
        ┌──────────────────────────────┐                       ┌──────────────────────────────┐
        │        Server (Node.js)      │                       │     Peer Collaborators       │
        │ Express + Socket.IO + PTY    │                       │ Video / Voice Calling Stream │
        └───────────────┬──────────────┘                       └──────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│ Local / AWS PTY  │          │    Piston API    │
│  Shell Worker    │          │ Code Executions  │
└──────────────────┘          └──────────────────┘
```

### Client (Frontend)
- **Framework**: React 19 with TypeScript
- **Build Engine**: Vite 8.x
- **Styling**: Tailwind CSS v4 + Vanilla CSS design system tokens
- **Code Editor**: CodeMirror (80+ language modes, themes, remote cursor highlighting)
- **Interactive Terminal**: `@xterm/xterm` with `@xterm/addon-fit` and drag-to-resize
- **Whiteboard**: `tldraw` (infinite canvas, live sync)
- **WebRTC**: Simple-Peer (mesh P2P audio/video)
- **Sockets**: `socket.io-client`
- **Routing**: React Router v7

### Server (Backend)
- **Runtime**: Node.js with TypeScript & TSX Watch
- **Framework**: Express.js
- **WebSockets**: Socket.IO Server (bidirectional real-time event bus)
- **PTY Management**: `node-pty` — native Windows/Linux shell spawning with `child_process` fallback for environments without native binaries

---

## 📁 Repository Structure

```
CollabNet/
├── client/                               # React 19 Frontend Application
│   ├── Dockerfile                        # Multi-stage: Node builder → Nginx runner
│   ├── nginx.conf                        # SPA routing + /healthz endpoint
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── call/                     # WebRTC call panel & video drawer
│       │   │   ├── CallPanel.tsx
│       │   │   └── CallsView.tsx
│       │   ├── chats/                    # Real-time chat bubbles & input
│       │   │   ├── ChatInput.tsx
│       │   │   └── ChatList.tsx
│       │   ├── common/                   # Shared UI primitives
│       │   │   ├── Breadcrumbs.tsx       # IDE file breadcrumbs & sync status
│       │   │   ├── EditorTopBar.tsx      # Top bar with Room ID & call button
│       │   │   ├── Modal.tsx             # Accessible dialog primitive
│       │   │   ├── Select.tsx            # Styled select component
│       │   │   ├── StatusBar.tsx         # Bottom status bar & terminal toggle
│       │   │   └── Users.tsx             # Collaborator cards with typing indicator
│       │   ├── connection/               # Offline & connection failure views
│       │   │   └── ConnectionStatusPage.tsx
│       │   ├── dashboard/                # Home dashboard components
│       │   │   └── RecentRooms.tsx       # localStorage session history & 1-click rejoin
│       │   ├── drawing/                  # tldraw whiteboard integration
│       │   │   └── DrawingEditor.tsx
│       │   ├── editor/                   # CodeMirror editor & tabs
│       │   │   ├── Editor.tsx            # Full-height collaborative editor
│       │   │   ├── EditorComponent.tsx   # Workspace editor container
│       │   │   ├── FileTab.tsx           # VS Code-style tabs with middle-click close
│       │   │   └── collaborativeHighlighting.ts
│       │   ├── files/                    # File tree & accessible modals
│       │   │   ├── FileModals.tsx        # New File/Folder/Delete custom dialogs
│       │   │   ├── FileStructureView.tsx # Tree explorer with guides & context menu
│       │   │   └── RenameView.tsx        # Inline F2 rename input
│       │   ├── forms/                    # Room join & create form card
│       │   │   └── FormComponent.tsx
│       │   ├── sidebar/                  # 48px IDE activity bar & views
│       │   │   ├── Sidebar.tsx
│       │   │   ├── CallPanelButton.tsx
│       │   │   ├── tooltipStyles.ts
│       │   │   └── sidebar-views/
│       │   │       ├── ChatsView.tsx
│       │   │       ├── CopilotView.tsx   # AI Code generation assistant
│       │   │       ├── FilesView.tsx     # Project explorer & ZIP export
│       │   │       ├── RunView.tsx       # Multi-language code execution (Piston)
│       │   │       ├── SettingsView.tsx  # Font & theme preferences
│       │   │       ├── SidebarButton.tsx # Activity bar icon button
│       │   │       └── UsersView.tsx     # Collaborators & invite actions
│       │   ├── terminal/                 # Bottom interactive xterm.js terminal
│       │   │   └── TerminalPanel.tsx     # Tabs, PTY streaming, drag resize, fullscreen
│       │   ├── webcam-stream/            # WebRTC camera grid & device controls
│       │   └── workspace/                # IDE layout assembler
│       │       └── index.tsx
│       ├── context/                      # React Context state providers
│       │   ├── AppContext.tsx
│       │   ├── ChatContext.tsx
│       │   ├── CopilotContext.tsx
│       │   ├── FileContext.tsx
│       │   ├── RunCodeContext.tsx
│       │   ├── SettingContext.tsx
│       │   ├── SocketContext.tsx
│       │   └── ViewContext.tsx
│       ├── pages/
│       │   ├── HomePage.tsx              # Developer workspace dashboard
│       │   └── EditorPage.tsx            # Main IDE workspace route
│       └── styles/
│           └── global.css                # Global CSS tokens & component utilities
│
├── server/                               # Express + Socket.IO Backend
│   ├── Dockerfile                        # Multi-stage: deps → production runner (non-root)
│   └── src/
│       └── types/
│           ├── server.ts                 # Main server & all socket event handlers
│           ├── terminalManager.ts        # PTY and child-process shell session manager
│           ├── socket.ts                 # Socket event name enums
│           └── user.ts                   # User & presence TypeScript types
│
├── scripts/
│   └── test-collaboration.mjs            # Multi-socket collaboration integration test
│
├── design-system/                        # UI/UX Pro Max Design System
│   └── collabnet/
│       ├── MASTER.md                     # Source of truth design tokens
│       └── pages/
│           ├── dashboard.md              # Dashboard page overrides
│           └── editor.md                 # Editor workspace overrides
│
├── docker-compose.yml                    # Production-parity local stack (client, server, Redis)
├── package.json                          # Root workspace scripts
├── CollabNet-AWS-Plan.md                 # Full AWS production architecture blueprint
└── README.md
```

---

## ⚡ Key Features

### 1. Developer Workspace Dashboard (`/`)
- **System Status**: Real-time server connectivity indicator.
- **Quick Action Cards**: Create an instant coding room, jump to a whiteboard, or open the interactive shell.
- **Recent Sessions History**: Preserves recently joined rooms in `localStorage` with user handles, timestamps, and 1-click rejoining.
- **Validated Join Form**: Inline validation, auto-generated Room IDs, and copy-to-clipboard.

### 2. Code Editor & Tab Management
- **VS Code-Style Tabs**: Active top border indicator, middle-click to close, horizontal mousewheel scrolling.
- **Breadcrumb Navigation**: Shows path hierarchy (`workspace > folder > file.js`), language badge, and real-time sync status.
- **Collaborative Cursors**: Live remote user cursors and text selection highlights using `collaborativeHighlighting.ts`.
- **Multi-Theme & Font Customization**: JetBrains Mono, Fira Code, Space Mono — customizable font size and editor theme.
- **80+ Language Modes**: CodeMirror auto-detects language from file extension with full syntax highlighting.

### 3. Bottom Interactive Shell Terminal
- **xterm.js Integration**: Full terminal emulation with `@xterm/addon-fit` for automatic viewport fitting.
- **Bidirectional PTY Streaming**: Real-time terminal I/O over Socket.IO (PowerShell on Windows, Bash on Linux/macOS).
- **Multi-Tab Interface**: Switch between the live interactive PTY shell and program execution output.
- **Drag-to-Resize & Fullscreen**: Grab the top border to resize height (120px → 80vh) or toggle fullscreen mode.
- **Keyboard Shortcut**: `Ctrl + \`` / `Cmd + \`` anywhere in the IDE toggles the terminal panel.

### 4. File Explorer with Accessible Modals
- **Accessible Dialogs**: Replaces browser `prompt()` and `confirm()` with custom accessible `<Modal>` dialogs for New File, New Folder, and Delete Confirmation.
- **Visual Indentation Guides**: Clear directory nesting lines, smooth chevron toggles, and `vscode-icons-js` file-type icons.
- **F2 Inline Rename**: Press `F2` on any highlighted file or folder to rename with inline validation.
- **Clamped Context Menu**: Right-click menu auto-bounds within viewport dimensions.
- **ZIP Export**: Download the entire project as a `.zip` archive using `jszip` + `file-saver`.

### 5. Collaboration, Presence & Chat
- **Presence Indicators**: Status rings for online/offline state and live typing indicators on collaborator cards.
- **Group Chat**: Speech bubbles with timestamps, word-wrapping, and auto-scroll.
- **Invite & Share**: 1-click room URL copying and native Web Share API integration.
- **WebRTC Audio & Video**: Peer-to-peer audio/video streaming via `simple-peer` with camera and microphone toggles, speaker state sync, and grid video layout.

### 6. Infinite Collaborative Whiteboard
- Powered by `tldraw v2` with live shape and stroke synchronization over Socket.IO.
- Dedicated dark mode styling and 1-click toggle between code editing and drawing modes.
- Initial snapshot sync when new collaborators join a room.

### 7. AI Copilot
- Sidebar panel with a prompt input and Markdown-rendered code output using `react-markdown` + `react-syntax-highlighter`.
- Backed by the Pollinations AI API (zero-cost, no API key required for local development).
- Designed to be swapped with **Amazon Bedrock** (Claude 3.5 Sonnet) for production deployments.

### 8. Multi-Language Code Runner
- Executes the active file or selected snippet in 80+ languages via the **Piston API**.
- Output rendered in the terminal output tab with ANSI color support.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + \`` / `Cmd + \`` | Toggle bottom terminal panel |
| `F2` | Rename selected file or directory |
| `Escape` | Close any open modal dialog or context menu |
| `Middle Click` | Close editor tab |
| `Enter` | Submit rename, modal form, or chat message |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-username/CollabNet.git
cd CollabNet

# Install all dependencies from workspace root
npm run install:all

# OR install individually:
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Environment Configuration

Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3000
```

Create `server/.env`:
```env
PORT=3000
NODE_ENV=development
```

### 3. Running in Development

**Terminal 1** — Start the backend server:
```bash
cd server
npm run dev
# Server starts on http://localhost:3000
```

**Terminal 2** — Start the frontend dev server:
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

Or use the root workspace shortcuts:
```bash
# From the repo root:
npm run dev:server   # starts server
npm run dev:client   # starts client
```

Open `http://localhost:5173`, generate a Room ID, enter your name, and share the URL with a collaborator.

---

## 🐳 Docker / Production-Parity Setup

The included `docker-compose.yml` spins up a fully orchestrated local stack mirroring the production AWS architecture:

| Container | Image | Port | Role |
|---|---|---|---|
| `collab-redis` | `redis:7-alpine` | `6379` | Socket.IO multi-node pub/sub adapter |
| `collab-server` | Built from `server/Dockerfile` | `3000` | Express + Socket.IO backend |
| `collab-client` | Built from `client/Dockerfile` | `8080 → 80` | React SPA served via Nginx |

```bash
# Build and start all services
docker compose up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f server
```

> **Note**: The client Dockerfile accepts `VITE_SERVER_URL` and `VITE_PISTON_API_URL` as build-time `ARG`s — set them in `docker-compose.yml` or pass with `--build-arg`.

### Server Dockerfile highlights
- Multi-stage build: `deps` → `runner`
- Non-root execution (`USER node`) for security
- `/healthz` endpoint for ALB health checks

### Client Dockerfile highlights
- Multi-stage build: `node:20-alpine` builder → `nginx:1.27-alpine` runner
- Custom `nginx.conf` with SPA fallback (`try_files $uri /index.html`)
- `/healthz` health check endpoint

---

## 📡 Socket.IO Event Reference

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-request` | Client → Server | `{ username, roomId }` | Request to join a room |
| `join-accepted` | Server → Client | `{ user, users, fileStructure }` | Acknowledgment of joining |
| `user-joined` | Server → Client | `{ user }` | Broadcast when peer joins |
| `user-disconnected` | Server → Client | `{ socketId }` | Broadcast when peer disconnects |
| `file-created` | Both | `{ parentDirId, newFile }` | File creation sync |
| `file-updated` | Both | `{ fileId, newContent }` | Live code edit sync |
| `file-renamed` | Both | `{ fileId, newName }` | File rename sync |
| `file-deleted` | Both | `{ fileId }` | File deletion sync |
| `cursor-move` | Both | `{ cursorPosition, selectionStart, selectionEnd }` | Remote cursor coordinates |
| `typing-start` | Both | `{ cursorPosition }` | User typing activity trigger |
| `typing-pause` | Both | — | Typing pause trigger |
| `send-message` | Client → Server | `{ message }` | Chat message transmission |
| `receive-message` | Server → Client | `{ message }` | Broadcast chat message |
| `terminal:init` | Client → Server | `{ cols, rows }` | Initialize PTY shell session |
| `terminal:data` | Both | `{ data }` | Terminal keystrokes & PTY output |
| `terminal:resize` | Client → Server | `{ cols, rows }` | Terminal viewport dimension resize |
| `terminal:clear` | Client → Server | — | Terminal buffer clear |
| `request-drawing` | Client → Server | — | Request latest whiteboard snapshot |
| `sync-drawing` | Server → Client | `{ drawingData }` | Initial whiteboard snapshot sync |
| `drawing-update` | Both | `{ snapshot }` | Incremental whiteboard change diff |
| `stream-ready` | Client → Server | — | WebRTC media stream ready |
| `webrtc-signal` | Both | `{ userID, signal }` | WebRTC peer negotiation signal |
| `mic-state` | Both | `{ userID, micOn }` | Microphone mute toggle sync |
| `speaker-state` | Both | `{ userID, speakersOn }` | Audio output toggle sync |

---

## 🛠️ Production Build

```bash
# Build frontend (output → client/dist/)
cd client && npm run build

# Build backend (output → server/dist/)
cd ../server && npm run build

# Start production server
npm start

# Or build both from root:
npm run build
```

---

## ☁️ AWS Production Architecture

The full production blueprint is documented in [`CollabNet-AWS-Plan.md`](CollabNet-AWS-Plan.md). The following is an executive summary.

### Current vs. Production State

| Subsystem | Local Implementation | Production Target |
|---|---|---|
| **Frontend** | `npm run dev` (Vite) | **S3 + CloudFront** (Route 53 + ACM TLS) |
| **Backend** | Single Express process, in-memory state | **ECS Fargate** (2+ tasks) behind an **ALB** with sticky sessions |
| **State Sync** | Node.js RAM only | **ElastiCache Redis** (`@socket.io/redis-adapter`) |
| **Database** | None (ephemeral) | **Aurora Serverless v2 (PostgreSQL)** |
| **Code Execution** | Piston API HTTP | **Interactive EC2 Terminal Worker** (sandboxed Docker PTY) |
| **Video / Voice** | WebRTC mesh (simple-peer) | **Coturn TURN Server** → long-term: LiveKit SFU |
| **Auth** | Free-form username string | **Amazon Cognito** + JWT via `aws-jwt-verify` |
| **AI Copilot** | Pollinations public API | **Amazon Bedrock** (Claude 3.5 Sonnet) |
| **Observability** | `console.log` | **CloudWatch Logs & Alarms** + **AWS WAF** |

### Monthly Cost Estimates

| Layer | MVP / Solo Dev | Mid-Scale Production |
|---|---|---|
| **CloudFront + S3 (Frontend)** | ~$1 | ~$15 |
| **ECS Fargate (Backend)** | ~$15 (1 task) | ~$60 (2–4 tasks) |
| **Application Load Balancer** | ~$22 | ~$35 |
| **ElastiCache Redis** | ~$13 (t4g.micro) | ~$52 (t4g.small, Multi-AZ) |
| **Aurora Serverless v2** | ~$43 (0.5 ACU min) | ~$120 (1–4 ACUs) |
| **EC2 Terminal Worker** | ~$15–$30 (t3.medium) | ~$60 (c6i.large) |
| **Coturn TURN Server (EC2)** | ~$8 + egress | ~$25 + egress |
| **NAT Solution** | ~$3.20 (fck-nat) | ~$65 (2x NAT Gateways) |
| **Total Estimate** | **~$120–$145/month** | **~$430–$550/month** |

### Phased Implementation Roadmap

#### Phase 1 — Containerization & Single-Instance Deployment ✅
- [x] Multi-stage `Dockerfile` for `server/` (non-root runner)
- [x] Multi-stage `Dockerfile` for `client/` (Nginx SPA)
- [x] `/healthz` + `/readyz` endpoints for ALB health checking
- [x] Unified `docker-compose.yml` for local multi-service testing

#### Phase 2 — Database Persistence & Cross-Node Sync
- [ ] Deploy Aurora Serverless v2 PostgreSQL and run schema migration
- [ ] Refactor `server.ts` in-memory arrays to Prisma/Drizzle DB queries
- [ ] Connect `@socket.io/redis-adapter` with ElastiCache Redis
- [ ] Stand up ALB with sticky sessions

#### Phase 3 — Auth, Sandboxed Execution & TURN Infrastructure
- [ ] Create Cognito User Pool, integrate `aws-jwt-verify` in Socket.IO middleware
- [ ] Deploy EC2 Terminal Worker in private subnet with sandboxed PTY containers
- [ ] Deploy Coturn on EC2 in Public Subnet with Elastic IP
- [ ] Replace Pollinations AI with Amazon Bedrock streaming route

#### Phase 4 — Production Hardening & Operations
- [ ] AWS WAF with rate-limiting rules on CloudFront and ALB
- [ ] CloudWatch alarms for p95 socket latency and 5xx errors
- [ ] GitHub Actions OIDC deployment workflow (`deploy.yml`)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🎯 Overview & Value Proposition

**CollabNet** combines the density, power, and keyboard-centric efficiency of a modern desktop IDE with real-time browser collaboration:

- **Real-Time Code Pairing**: Synchronized editing with remote collaborator cursors, selections, and presence.
- **Embedded Interactive Terminal**: Full xterm.js terminal with multi-tab support, drag-to-resize, and bidirectional PTY streaming over WebSockets.
- **Developer Workspace Dashboard**: Centralized command center featuring live system metrics, quick-start action cards, and persistent session history with 1-click room rejoining.
- **File System Management**: Tree explorer with directory nesting guides, accessible custom modal dialogs (no browser alerts), inline F2 rename, and project ZIP download.
- **Integrated Whiteboard**: Infinite collaborative drawing canvas powered by `tldraw` with live shape and stroke synchronization.
- **P2P Audio & Video Calls**: Low-latency mesh WebRTC calling with device toggles, grid layout, and speaker state tracking.
- **Multi-Language Execution & AI Copilot**: Run code in 80+ runtimes via Piston API or generate code using the AI Copilot.

---

## 🎨 UI/UX Design System (UI/UX Pro Max)

CollabNet follows a strict, developer-first design system generated using the **UI/UX Pro Max** skill:

| Token Category | Value / Specification |
|---|---|
| **Theme & Aesthetic** | Dark Mode (OLED / Deep Slate) — high contrast, low eye fatigue |
| **Density Dial** | `8/10` (Dense / Dashboard) — optimized for screen real estate |
| **Motion Dial** | `3/10` (Subtle) — 150–200ms transitions, `prefers-reduced-motion` compliant |
| **Typography (UI)** | **IBM Plex Sans** (300, 400, 500, 600, 700) |
| **Typography (Code)** | **JetBrains Mono** / Space Mono (monospace code, terminal, breadcrumbs) |
| **Primary Accent** | `#3B82F6` (Electric Blue / Active Focus) |
| **Secondary Accent** | `#22C55E` (Emerald Green / Connected Status / Terminal) |
| **Canvas Background** | `#0B0F17` (Deep Obsidian Canvas) |
| **Surface Panels** | `#111827` (Sidebars & Toolbars) |
| **Elevated Cards** | `#161F30` (Active Tabs, Modals, Dropdowns) |
| **Border Tokens** | `#26334A` (Subtle container divisions) |
| **Icon System** | Lucide SVG icons (`react-icons/lu`) — zero emojis used as UI icons |

*Design system specifications are persisted in [`design-system/collabnet/MASTER.md`](design-system/collabnet/MASTER.md).*

---

## 🏗️ Architecture

```
                               ┌────────────────────────────────────────┐
                               │            Client (Browser)            │
                               │  React 19 + TypeScript + Vite + Tailwind │
                               └───────────────────┬────────────────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        │ WebSocket (Socket.IO)              WebRTC (P2P Mesh)│
                        ▼                                                     ▼
        ┌──────────────────────────────┐                       ┌──────────────────────────────┐
        │        Server (Node.js)      │                       │     Peer Collaborators       │
        │ Express + Socket.IO + PTY    │                       │ Video / Voice Calling Stream │
        └───────────────┬──────────────┘                       └──────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│ Local / AWS PTY  │          │    Piston API    │
│  Shell Worker    │          │ Code Executions  │
└──────────────────┘          └──────────────────┘
```

### Client (Frontend)
- **Framework**: React 19 with TypeScript
- **Build Engine**: Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System
- **Code Editor**: CodeMirror with language auto-detection, themes, and remote cursor highlighting
- **Interactive Terminal**: `@xterm/xterm` with `@xterm/addon-fit`
- **Whiteboard**: `tldraw`
- **WebRTC**: Simple-Peer (mesh peer-to-peer audio/video)
- **Sockets**: `socket.io-client`
- **Routing**: React Router v7

### Server (Backend)
- **Runtime**: Node.js with TypeScript & TSX Watch
- **Framework**: Express.js
- **WebSockets**: Socket.IO Server
- **PTY Management**: `node-pty` with native Windows/Linux shell spawning and child-process fallback

---

## 📁 Repository Structure

```
CollabNet/
├── client/                               # React 19 Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── call/                     # WebRTC call panel & video drawer
│   │   │   │   ├── CallPanel.tsx
│   │   │   │   └── CallsView.tsx
│   │   │   ├── chats/                    # Real-time chat bubbles & input
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── ChatList.tsx
│   │   │   ├── common/                   # Shared UI primitives
│   │   │   │   ├── Breadcrumbs.tsx       # IDE file breadcrumbs & status
│   │   │   │   ├── EditorTopBar.tsx      # Top bar with Room ID & call button
│   │   │   │   ├── Modal.tsx             # Accessible dialog primitive
│   │   │   │   ├── Select.tsx            # Styled select component
│   │   │   │   ├── StatusBar.tsx         # Bottom status bar & terminal toggle
│   │   │   │   └── Users.tsx             # Collaborator cards with typing indicator
│   │   │   ├── connection/               # Offline & connection failure views
│   │   │   │   └── ConnectionStatusPage.tsx
│   │   │   ├── dashboard/                # Home dashboard components
│   │   │   │   └── RecentRooms.tsx       # LocalStorage session history & 1-click rejoin
│   │   │   ├── drawing/                  # tldraw whiteboard integration
│   │   │   │   └── DrawingEditor.tsx
│   │   │   ├── editor/                   # CodeMirror editor & tabs
│   │   │   │   ├── Editor.tsx            # Full-height collaborative editor
│   │   │   │   ├── EditorComponent.tsx   # Workspace editor container
│   │   │   │   ├── FileTab.tsx           # VS Code-style tabs with middle-click close
│   │   │   │   └── collaborativeHighlighting.ts
│   │   │   ├── files/                    # File tree & accessible modals
│   │   │   │   ├── FileModals.tsx        # New File/Folder/Delete custom dialogs
│   │   │   │   ├── FileStructureView.tsx # Tree explorer with guides & context menu
│   │   │   │   └── RenameView.tsx        # Inline F2 rename input
│   │   │   ├── forms/                    # Room join & create form card
│   │   │   │   └── FormComponent.tsx
│   │   │   ├── sidebar/                  # 48px IDE activity bar & views
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── CallPanelButton.tsx
│   │   │   │   ├── tooltipStyles.ts
│   │   │   │   └── sidebar-views/
│   │   │   │       ├── ChatsView.tsx
│   │   │   │       ├── CopilotView.tsx   # AI Code generation assistant
│   │   │   │       ├── FilesView.tsx     # Project explorer & ZIP export
│   │   │   │       ├── RunView.tsx       # Multi-language code execution
│   │   │   │       ├── SettingsView.tsx  # Font & theme preferences
│   │   │   │       ├── SidebarButton.tsx # Activity bar icon button
│   │   │   │       └── UsersView.tsx     # Collaborators & invite actions
│   │   │   ├── terminal/                 # Bottom interactive xterm.js terminal
│   │   │   │   └── TerminalPanel.tsx     # Tabs, PTY streaming, drag resize, fullscreen
│   │   │   ├── webcam-stream/            # WebRTC camera grid & device controls
│   │   │   └── workspace/                # IDE layout assembler
│   │   │       └── index.tsx
│   │   ├── context/                      # React Context state providers
│   │   │   ├── AppContext.tsx
│   │   │   ├── ChatContext.tsx
│   │   │   ├── CopilotContext.tsx
│   │   │   ├── FileContext.tsx
│   │   │   ├── RunCodeContext.tsx
│   │   │   ├── SettingContext.tsx
│   │   │   ├── SocketContext.tsx
│   │   │   └── ViewContext.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx              # Developer workspace dashboard
│   │   │   └── EditorPage.tsx            # Main IDE workspace route
│   │   ├── styles/
│   │   │   └── global.css                # Global CSS tokens & component utilities
│   │   ├── index.css                     # Tailwind theme tokens & font definitions
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── server/                               # Express + Socket.IO Backend
│   ├── src/
│   │   └── types/
│   │       ├── server.ts                 # Main server & socket event handlers
│   │       ├── terminalManager.ts        # PTY and child-process shell sessions
│   │       ├── socket.ts                 # Socket event enums
│   │       └── user.ts                   # User & presence types
│   ├── package.json
│   └── tsconfig.json
│
├── design-system/                        # UI/UX Pro Max Design System
│   └── collabnet/
│       ├── MASTER.md                     # Source of truth design tokens
│       └── pages/
│           ├── dashboard.md              # Dashboard page overrides
│           └── editor.md                 # Editor workspace overrides
│
├── docker-compose.yml                    # Optional Docker container stack
└── README.md                             # Project documentation
```

---

## ⚡ Key Features

### 1. Developer Workspace Dashboard (`/`)
- **System Metrics**: Real-time server connectivity indicator.
- **Quick Action Cards**: Create an instant coding room, jump to a whiteboard, or inspect the interactive shell.
- **Recent Sessions History**: Preserves recently joined rooms in `localStorage` with user handles, timestamps, and 1-click rejoining.
- **Validated Join Form**: Clean form controls with inline validation, automatic ID generation, and copy-to-clipboard actions.

### 2. Code Editor & Tab Management
- **VS Code-Style Tabs**: Active top border indicator, middle-click to close, and horizontal mousewheel scrolling.
- **Breadcrumb Navigation**: Shows path hierarchy (`workspace > folder > file.js`), language badge, and real-time sync status.
- **Collaborative Cursors**: Live remote user cursors and text selection highlights.
- **Multi-Theme & Font Customization**: Supports JetBrains Mono, Fira Code, Space Mono, and customizable font sizing and themes.

### 3. Bottom Interactive Shell Terminal
- **xterm.js Integration**: Full terminal emulation with `@xterm/addon-fit`.
- **Bidirectional PTY Streaming**: Real-time terminal I/O over Socket.IO (PowerShell on Windows, Bash on Linux/macOS).
- **Multi-Tab Interface**: Switch between the interactive live shell and program execution output.
- **Drag-to-Resize & Fullscreen**: Grab the top border to resize height (120px to 80vh) or toggle fullscreen mode.
- **Keyboard Shortcut**: Press `Ctrl + \`` (or `Cmd + \``) anywhere in the IDE to toggle the terminal.

### 4. File Explorer with Accessible Modals
- **Accessible Dialogs**: Replaces browser `prompt()` and `confirm()` with custom accessible modals for New File, New Folder, and Delete Confirmation.
- **Visual Indentation Guides**: Clear directory nesting lines, smooth chevron toggles, and file-type icons.
- **F2 Inline Rename**: Press `F2` on any highlighted file or folder to rename with inline validation.
- **Clamped Context Menu**: Right-click menu automatically bounds within viewport dimensions.

### 5. Collaboration, Presence & Chat
- **Presence Indicators**: Status rings for online/offline status and live typing indicators.
- **Group Chat**: Speech bubbles with timestamps, word-wrapping, and auto-scroll.
- **Invite & Share**: 1-click room URL copying and native Web Share API integration.
- **WebRTC Audio & Video**: Peer-to-peer audio/video streaming with camera and microphone toggles.

### 6. Infinite Collaborative Whiteboard
- Powered by `tldraw` with live shape and stroke synchronization over Socket.IO.
- Dedicated dark mode styling and 1-click toggle between coding and drawing modes.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + \`` / `Cmd + \`` | Toggle bottom terminal panel |
| `F2` | Rename selected file or directory |
| `Escape` | Close any open modal dialog or context menu |
| `Middle Click` | Close editor tab |
| `Enter` | Submit rename, modal form, or chat message |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-username/CollabNet.git
cd CollabNet

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration

Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3000
```

Create `server/.env`:
```env
PORT=3000
NODE_ENV=development
```

### 3. Running in Development

In terminal 1 (start backend server):
```bash
cd server
npm run dev
```
*Server starts on `http://localhost:3000`.*

In terminal 2 (start frontend dev server):
```bash
cd client
npm run dev
```
*Client starts on `http://localhost:5173`.*

Open your browser to `http://localhost:5173`, generate a Room ID, and enter your workspace.

---

## 📡 Socket.IO Event Reference

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-request` | Client → Server | `{ username, roomId }` | Request to join a room |
| `join-accepted` | Server → Client | `{ user, users, fileStructure }` | Acknowledgment of joining |
| `user-joined` | Server → Client | `{ user }` | Broadcast when peer joins |
| `user-disconnected` | Server → Client | `{ socketId }` | Broadcast when peer disconnects |
| `file-created` | Both | `{ parentDirId, newFile }` | File creation sync |
| `file-updated` | Both | `{ fileId, newContent }` | Live code edit sync |
| `file-renamed` | Both | `{ fileId, newName }` | File rename sync |
| `file-deleted` | Both | `{ fileId }` | File deletion sync |
| `cursor-move` | Both | `{ cursorPosition, selectionStart, selectionEnd }` | Remote cursor coordinates |
| `typing-start` | Both | `{ cursorPosition }` | User typing activity trigger |
| `typing-pause` | Both | — | Typing pause trigger |
| `send-message` | Client → Server | `{ message }` | Chat message transmission |
| `receive-message` | Server → Client | `{ message }` | Broadcast chat message |
| `terminal:init` | Client → Server | `{ cols, rows }` | Initialize PTY shell session |
| `terminal:data` | Both | `{ data }` | Terminal keystrokes & PTY output |
| `terminal:resize` | Client → Server | `{ cols, rows }` | Terminal viewport dimension resize |
| `terminal:clear` | Client → Server | — | Terminal buffer clear |
| `request-drawing` | Client → Server | — | Request latest whiteboard snapshot |
| `sync-drawing` | Server → Client | `{ drawingData }` | Initial whiteboard snapshot sync |
| `drawing-update` | Both | `{ snapshot }` | Incremental whiteboard change diff |
| `stream-ready` | Client → Server | — | WebRTC media stream ready |
| `webrtc-signal` | Both | `{ userID, signal }` | WebRTC peer negotiation signal |
| `mic-state` | Both | `{ userID, micOn }` | Microphone mute toggle sync |
| `speaker-state` | Both | `{ userID, speakersOn }` | Audio output toggle sync |

---

## 🛠️ Production Build & Verification

```bash
# Build frontend
cd client
npm run build
# Output is generated into client/dist

# Build backend
cd ../server
npm run build
# Output is generated into server/dist

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
