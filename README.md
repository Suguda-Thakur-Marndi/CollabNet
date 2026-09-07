# CollabNet — Real-Time Collaborative Developer IDE

> A real-time collaborative code editor and developer platform built for distributed engineering teams. Code together, manage files, execute programs in an interactive shell, chat, make WebRTC voice/video calls, and brainstorm on a shared whiteboard.

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
