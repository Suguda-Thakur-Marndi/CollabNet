# CollabNet — Resume & Technical Portfolio Master Reference

> **Project Name:** CollabNet — Real-Time Collaborative Developer IDE  
> **Repository:** Suguda-Thakur-Marndi/CollabNet  
> **Status:** Codebase Verified (Strict Implementation Audit)  
> **Architecture Reality:** Distributed In-Memory State & Containerized Microservices; Relational Persistence & Cloud Cluster Scaling are Planned Architectures.

---

## 1. One-Line Project Description

> **CollabNet** is an open-source, full-stack collaborative developer IDE built with React 19, TypeScript, Node.js, and Socket.IO that combines real-time multi-cursor code pairing, an in-browser pseudoterminal, Google Gemini AI pair-programming with credential redaction, collaborative vector whiteboarding, and P2P WebRTC calls in a single browser workspace.

---

## 2. Short Resume Version (3 Bullets)

* **Architected a real-time collaborative IDE** using **React 19, TypeScript, Node.js, Express, and Socket.IO**, developing a custom CodeMirror 6 `StateField` extension for multi-user cursor tracking, remote selection rendering, and room-partitioned state synchronization with server-side authorization boundaries.
* **Engineered an authenticated AI pair-programming assistant** powered by the **Google Gemini API (`@google/generative-ai`)** via **Server-Sent Events (SSE)**, incorporating a pre-flight credential sanitizer scrubbing 12 secret patterns, 4KB context window clipping, 8KB prompt bounds validation, and 30 req/min IP rate limiting.
* **Built an interactive in-browser cloud terminal and execution engine** combining **`@xterm/xterm` (v6.0) and `node-pty`** over bidirectional WebSockets with 50K-character circular scrollback caching, supporting dual-path code execution via remote HTTP execution worker dispatch and local sandboxed process fallback.

---

## 3. Standard Resume Version (5 Bullets)

* **Architecture & Real-Time Collaboration:** Architected a full-stack collaborative developer workspace using **React 19, TypeScript, Node.js, Express, and Socket.IO**, implementing room-partitioned synchronization for multi-file virtual directory trees, `tldraw` v2 vector canvas diffs, and CodeMirror 6 remote cursor presence with deterministic color hashing.
* **AI Copilot & Streaming Infrastructure:** Integrated the **Google Gemini API** (`@google/generative-ai`) via **Server-Sent Events (SSE)** to stream code suggestions and explanations, developing a pre-flight regex sanitization engine matching 12 secret and credential patterns, bounded prompt limits (8,000 characters), and direct editor injection.
* **Interactive Terminal & Code Execution:** Engineered an interactive browser terminal emulator with **`@xterm/xterm` and `node-pty`** supporting VT100 escapes and dynamic window resizing, backed by a dual-mode code runner that dispatches execution to an external worker endpoint or falls back to an isolated workspace sandbox.
* **Authentication & Defense-in-Depth Security:** Implemented session authentication using **Passport.js and Google OAuth 2.0** with HttpOnly/Secure cookies, three-tier IP rate limiting (`express-rate-limit`), Helmet security headers, and server-side socket room verification (`isInSameRoom`) blocking cross-room data leakage.
* **DevOps, Containerization & CI:** Containerized the platform with **multi-stage Dockerfiles** (unprivileged `node` user runner and hardened Nginx 1.27 reverse proxy with gzip compression), orchestrated local Redis 7 via Docker Compose, and automated GitHub Actions CI covering static TypeScript checks, zero-credential smoke tests, and multi-client socket integration testing.

---

## 4. Technically Detailed Version (8 Bullets)

1. **Full-Stack Workspace Architecture:** Architected a modular developer workspace using **React 19, TypeScript 6.0, Node.js 20, Express 4.21, and Socket.IO 4.8**, decoupling UI state across 9 specialized React Context providers and enforcing room-isolated event broadcasting across 33 custom socket events.
2. **Custom Collaborative Editor Engine:** Developed a CodeMirror 6 collaborative extension leveraging `StateField`, `WidgetType`, and transaction mapping (`tr.changes`) to render live remote peer cursors, blinking name badges, translucent text selections, and hash-based deterministic user color assignments.
3. **AI Copilot with Credential Sanitization:** Built an SSE streaming pair-programmer endpoint (`POST /api/ai/copilot`) consuming Google Gemini (`gemini-2.5-flash`), enforcing pre-flight regex redaction for 12 credential signatures (API keys, private keys, database URLs), 4,000-character context slicing, and token streaming via async generators.
4. **Interactive PTY Terminal Streaming:** Engineered an in-browser pseudoterminal pairing `@xterm/xterm` (v6.0) with `node-pty`, handling cross-platform shell initialization (PowerShell on Windows, Bash on Linux), ANSI color escapes, window resize dimensions (`cols`/`rows`), and 50,000-character scrollback replay for joining peers.
5. **Dual-Mode Code Execution Engine:** Implemented a multi-language execution pipeline supporting JavaScript, TypeScript, Python, Bash, and PowerShell that dispatches jobs to an authenticated HTTP execution worker with a 30s timeout or falls back to an isolated workspace directory in `os.tmpdir()`.
6. **Collaborative Whiteboard & Mesh P2P Calling:** Integrated `tldraw` v2 infinite vector drawing with transactional document delta broadcasts, alongside a mesh WebRTC voice/video calling subsystem (`simple-peer`) featuring lexicographical socket ID tie-breaking to eliminate connection glare and out-of-order signaling buffers.
7. **Session Authentication & Defense-in-Depth Security:** Implemented Google OAuth 2.0 via Passport.js with 7-day HttpOnly session cookies, developer bypass fallback for offline work, three-tier rate limits (20 req/15min auth, 30 req/min AI, 200 req/min API), and server-side room membership assertions on all data transfer events.
8. **DevOps, Production Parity & Automated CI:** Authored multi-stage Docker builds running under non-root users (`USER node`), deployed an Nginx SPA gateway with immutable asset caching and `/healthz` probes, and built a GitHub Actions CI pipeline executing compiler checks, server readiness smoke tests, and an 11-assertion socket integration test suite.

---

## 5. ATS-Optimized Version

### ATS Keywords

* **Programming Languages:** TypeScript, JavaScript (ESM/Node.js), Bash, PowerShell, HTML5, CSS3
* **Frontend Engineering:** React 19, Vite, Tailwind CSS v4, CodeMirror 6, Monaco Editor, `@xterm/xterm`, `tldraw` v2, Single Page Application (SPA), React Context API, WebRTC
* **Backend & Systems:** Node.js, Express.js, Socket.IO, `node-pty`, Pseudo-terminal (PTY), Server-Sent Events (SSE), Child Process Spawning, REST APIs, WebSockets
* **Artificial Intelligence & LLMs:** Google Gemini API (`@google/generative-ai`), Prompt Engineering, Context Window Management, LLM Streaming, Credential Redaction, Generative AI
* **Security & Authentication:** Google OAuth 2.0, Passport.js, Session Authentication (HttpOnly/Secure Cookies), CORS Whitelisting, Helmet, Express Rate Limiting, Input Validation, Data Sanitization, Cross-Room Isolation
* **DevOps & Infrastructure:** Docker, Multi-Stage Builds, Docker Compose, Nginx (Alpine), Redis 7, GitHub Actions, CI/CD Pipelines, Linux/Alpine, Health Check Probes

---

## 6. Technology Stack

### Frontend
* **Core Framework:** React 19.2.6, React DOM 19.2.6
* **Language & Compiler:** TypeScript ~6.0.3, Vite 8.0.13
* **Styling & UI:** Tailwind CSS v4.0.7, React Icons (`lu`), VS Code Icons JS
* **Code Editor:** CodeMirror 6 (`@uiw/react-codemirror` 4.23.8, `@codemirror/view` 6.34.1, `@codemirror/state`, `@uiw/codemirror-extensions-langs`, `@uiw/codemirror-themes-all` 4.23.0)
* **Terminal Emulator:** `@xterm/xterm` 6.0.0, `@xterm/addon-fit` 0.11.0
* **Vector Whiteboard:** `tldraw` 2.4.4
* **Networking & Protocols:** `socket.io-client` 4.8.3, `simple-peer` 9.11.1 (WebRTC Mesh), Server-Sent Events (SSE via `ReadableStream`)
* **Routing & Utilities:** `react-router-dom` 7.15.1, `react-markdown` 9.0.1, `react-syntax-highlighter` 15.6.1, `jszip` 3.10.1, `file-saver` 2.0.5, `react-hot-toast` 2.4.1

### Backend
* **Runtime & Framework:** Node.js v20+, Express.js 4.21.2
* **Language & Dev Tools:** TypeScript ~5.9.3, `tsx` 4.22.3 (ESM Watch Runner)
* **Real-Time Communication:** Socket.IO 4.8.2 (33 custom events, room broadcasting, cross-room membership validation)
* **Terminal Management:** `node-pty` 1.1.0 (VT100 PTY session manager) with `child_process.spawn` fallback
* **AI Engine:** Google Gemini API (`@google/generative-ai` 0.24.1, `gemini-2.5-flash` model, SSE stream generator)

### Authentication & Security
* **Identity Provider:** Google OAuth 2.0 (`passport` 0.7.0, `passport-google-oauth20` 2.0.0)
* **Sessions:** `express-session` 1.19.0 (HttpOnly, Secure, SameSite, 7-day expiry)
* **Security Middleware:** `helmet` 8.3.0, `cors` 2.8.5 (dynamic origin whitelisting)
* **Abuse Prevention:** `express-rate-limit` 8.7.0 (three independent tiers: auth, AI, general API)
* **Data Protection:** Regex credential sanitization filter (12 secret patterns), room membership authorization (`isInSameRoom`), strict input length bounds

### DevOps & Infrastructure
* **Containerization:** Multi-stage `Dockerfile` (Node 20 Alpine unprivileged `node` runner, Nginx 1.27 Alpine static server)
* **Local Orchestration:** `docker-compose.yml` (Server, Client, Redis 7 Alpine)
* **Deployment Automation:** `scripts/ec2-setup.sh` (Ubuntu 22.04/24.04 automated swap, Docker install, and Compose boot)
* **Continuous Integration:** GitHub Actions (`.github/workflows/ci.yml`)
* **Web Server:** Nginx 1.27 (gzip compression, static asset caching headers, SPA routing, `/healthz` probe)

---

## 7. Engineering Highlights

1. **Room-Scoped Real-Time Synchronization Bus:** Architected a Socket.IO event router supporting 33 events. Rather than naively broadcasting payloads, the server actively enforces tenancy with an `isInSameRoom()` validator on `SYNC_FILE_STRUCTURE`, `SYNC_DRAWING`, and `WEBRTC_SIGNAL`, preventing cross-room data leaks.
2. **Deterministic Color Hashing & Custom CodeMirror 6 Decorators:** Developed a CodeMirror 6 extension combining `StateField.define` and `DecorationSet`. Remote peer cursor badges and selection ranges are derived via a character-code string hash function mapping usernames to a 10-color palette, automatically adjusted during document changes via `tr.changes`.
3. **Pre-Flight Credential Scrubbing & Bounded LLM Streaming:** Integrated Google Gemini via SSE with an automated pre-flight regex scanner scrubbing 12 secret patterns (Google AI Studio keys, RSA/EC private keys, AWS access keys, Redis/DB URLs). Prompt inputs are bounded to 8,000 characters and editor context is clipped to 4,000 characters to prevent token exhaustion and unexpected billing spikes.
4. **Resilient Dual-Mode Execution Architecture:** Built a code execution pipeline in `runner.service.ts` that attempts HTTP dispatch to a remote execution worker (with `Authorization: Bearer` secret validation and a 30s AbortController timeout) and gracefully falls back to an isolated workspace directory in `os.tmpdir()` with live ANSI streaming over Socket.IO to the room's xterm terminal.
5. **Bidirectional PTY Terminal Emulator with Scrollback Buffer:** Designed a collaborative terminal lifecycle manager (`terminalManager.ts`) using `node-pty`. It manages shell spawn processes per room, captures terminal resizes (`cols`/`rows`), replays up to 50,000 characters of buffered output to newly joined collaborators, and kills process trees when all participants disconnect.
6. **Conflict-Free Vector Whiteboarding Diff Sync:** Integrated `tldraw` v2 using `editor.store.listen` to intercept user modifications, broadcasting record diffs (`added`, `updated`, `removed`) over Socket.IO, and merging remote changes cleanly with `editor.store.mergeRemoteChanges()`.
7. **Glare-Free WebRTC Mesh Signaling:** Engineered a peer-to-peer audio/video calling layer with `simple-peer`. It eliminates WebRTC glare (simultaneous dual-offer collisions) via a deterministic lexicographical tie-breaker (`userID > socket.id`) and buffers out-of-order signaling packets in a `pendingSignalsRef` queue before peer initialization.
8. **Hardened Multi-Stage Containerization & CI Pipeline:** Containerized the backend on Alpine Linux running as an unprivileged user (`USER node`) and the frontend via Nginx with gzip compression. Built a GitHub Actions CI pipeline executing type checks, container readiness curl checks (`/healthz`, `/readyz`), high-severity dependency audits, and an 11-step socket integration test suite.

---

## 8. Resume Claim Verification

| # | Resume Claim | Evidence in Codebase | Implementation Status | Verification Notes |
|---|---|---|---|---|
| 1 | **CodeMirror 6 Multi-Cursor Pairing** | `client/src/components/editor/Editor.tsx`<br>`client/src/components/editor/collaborativeHighlighting.ts` | **VERIFIED** | Custom `StateField` and `WidgetType` render remote cursors and text selections using user string color hashing. |
| 2 | **Monaco Editor Support** | `client/package.json` (`@monaco-editor/react`) | **PARTIAL** | Monaco package is installed in dependencies, but CodeMirror 6 is the active editor implemented in the workspace. |
| 3 | **Google Gemini AI with SSE Streaming** | `server/src/routes/ai.routes.ts`<br>`server/src/services/ai/gemini.service.ts`<br>`client/src/api/aiApi.ts` | **VERIFIED** | Uses `@google/generative-ai`, streams tokens chunk-by-chunk over `text/event-stream` with client `ReadableStream` reader. |
| 4 | **Pre-Flight Credential Redaction** | `server/src/services/ai/gemini.service.ts#L6-L30` | **VERIFIED** | Scans and replaces 12 secret patterns (`DATABASE_URL`, AWS keys, API keys, private keys) with `[REDACTED]`. |
| 5 | **Interactive xterm.js Cloud Terminal** | `client/src/components/terminal/TerminalPanel.tsx`<br>`server/src/types/terminalManager.ts` | **VERIFIED** | `@xterm/xterm` 6.0 and `@xterm/addon-fit` stream bidirectional PTY data to `node-pty` with 50K-char scrollback caching. |
| 6 | **Dual-Mode Code Execution Engine** | `server/src/services/execution/runner.service.ts`<br>`client/src/context/RunCodeContext.tsx` | **VERIFIED** | Remote HTTP worker dispatch with 30s abort controller and fallback to local temporary folder execution. |
| 7 | **Collaborative tldraw Whiteboard** | `client/src/components/drawing/DrawingEditor.tsx` | **VERIFIED** | `tldraw` v2 document changes captured and merged via `editor.store.mergeRemoteChanges()` over `DRAWING_UPDATE`. |
| 8 | **WebRTC Mesh Video & Voice Calling** | `client/src/components/webcam-stream/utils/peer.ts`<br>`client/src/components/webcam-stream/hooks/usePeerConnections.ts` | **VERIFIED** | `simple-peer` mesh calling with `userID > socket.id` tie-breaking and `pendingSignalsRef` packet queuing. |
| 9 | **Google OAuth 2.0 & Session Auth** | `server/src/auth/passport.ts`<br>`server/src/auth/routes.ts`<br>`server/src/middleware/requireAuth.ts` | **VERIFIED** | Passport.js Google Strategy with session cookies and `/auth/dev-login` fallback for local dev. |
| 10 | **Three-Tier Rate Limiting & Security** | `server/src/middleware/rateLimit.ts`<br>`server/src/types/server.ts` | **VERIFIED** | Express rate limits: 20 req/15min (auth), 30 req/min (AI), 200 req/min (API); Helmet headers and CORS whitelist. |
| 11 | **Cross-Room Data Isolation Verification** | `server/src/types/server.ts#L140-L143`<br>`server/src/types/server.ts#L251-L254` | **VERIFIED** | Server checks `isInSameRoom()` on file sync, drawing, and WebRTC signals before emission. |
| 12 | **Multi-Stage Docker & Nginx Deployment** | `server/Dockerfile`<br>`client/Dockerfile`<br>`client/nginx.conf`<br>`docker-compose.yml` | **VERIFIED** | Multi-stage builds: server runs under unprivileged `node` user; client served via Nginx with gzip and `/healthz`. |
| 13 | **Redis Container & Client Libraries** | `docker-compose.yml`<br>`server/package.json` (`ioredis`, `connect-redis`) | **PARTIAL** | Redis container is defined and npm clients installed; runtime session store currently uses in-memory Map. |
| 14 | **AWS EC2 Worker & Automated Deployment** | `scripts/ec2-setup.sh`<br>`scripts/test-collaboration.mjs` | **PARTIAL** | EC2 deployment script (`ec2-setup.sh`) and remote worker client are implemented; dedicated worker cluster is external/planned. |
| 15 | **PostgreSQL / Aurora Relational DB** | `CollabNet-AWS-Plan.md` | **PLANNED / NOT IMPLEMENTED** | All current state is in-memory (`userStore` Map, `userSocketMap` array). Relational database is planned architecture. |
| 16 | **AWS Cloud Infrastructure (ECS/ALB/Bedrock)**| `CollabNet-AWS-Plan.md` | **PLANNED / NOT IMPLEMENTED** | Documented in AWS blueprint (`CollabNet-AWS-Plan.md`), but not provisioned in current repository code. |

---

## 9. Implemented vs. Planned Architecture

To protect technical credibility during engineering interviews, the boundary between what is currently executing in code and what is designed in architectural roadmaps is clearly defined:

### Currently Implemented in Codebase
* **In-Memory State Management:** Active rooms, user presence (`userSocketMap`), auth records (`userStore`), and terminal sessions (`sessions` Map) are maintained in Node.js process memory.
* **Dual-Mode Code Execution:** Client triggers execution through Socket.IO. The server attempts dispatch to an optional HTTP execution worker endpoint, gracefully falling back to spawning child processes in `os.tmpdir()/collabnet-sandbox/<roomId>`.
* **Mesh WebRTC Calling:** P2P video/voice via `simple-peer` without TURN relay infrastructure (sufficient for direct LAN/STUN, but degrades past 4–6 participants).
* **Single-Instance Deployment:** Runs as containerized services orchestrated locally via Docker Compose or standalone on a single EC2 instance via `scripts/ec2-setup.sh`.
* **AI Copilot Integration:** Direct server-side streaming calls to Google Gemini API (`@google/generative-ai`) via SSE with regex secret redaction.

### Planned / Future Roadmap (Documented in `CollabNet-AWS-Plan.md`)
* **Persistent Relational Database:** Replacing the in-memory `userStore` and transient rooms with **Amazon Aurora Serverless v2 (PostgreSQL)** using Drizzle or Prisma ORM.
* **Horizontal Socket.IO Adapter:** Hooking `@socket.io/redis-adapter` into the existing Redis service so multiple Node.js instances can broadcast across rooms behind a load balancer.
* **Isolated Cloud Execution Workers:** Running ephemeral Docker containers or Firecracker microVMs per room on dedicated EC2 instances with strict cgroups memory and CPU quotas.
* **Coturn TURN / SFU Media Server:** Deploying a Coturn relay server or migrating to a Selective Forwarding Unit (LiveKit or Amazon Chime SDK) to reduce client bandwidth from $O(N^2)$ to $O(1)$.
* **Amazon ECS Fargate Cluster:** Multi-AZ container deployment behind an Application Load Balancer with sticky sessions and AWS WAF edge filtering.

---

## 10. Quantitative Metrics (Verified in Codebase)

* **11 Automated Socket Integration Assertions:** Verified in `scripts/test-collaboration.mjs` (testing room join, user presence, tree sync, live updates, cursor broadcasts, 3-peer sync, re-connections, and socket replacement).
* **33 Socket.IO Events:** Enumerable typed real-time events defined in `server/src/types/socket.ts` covering file system, cursor, presence, chat, whiteboard, WebRTC, terminal, and execution.
* **12 Pre-Flight Secret Redaction Patterns:** Regex patterns in `gemini.service.ts` targeting API keys, private keys, database URLs, and AWS access credentials.
* **3 Independent Rate-Limiter Windows:** 20 requests / 15 minutes on `/auth`, 30 requests / minute on `/api/ai/copilot`, and 200 requests / minute on general API routes.
* **50,000-Character Scrollback Buffer:** Circular buffer in `terminalManager.ts` replaying recent terminal activity to incoming room collaborators.
* **512 KB File Update Payload Limit:** Maximum allowed file content payload per socket message (`MAX_FILE_CONTENT_LENGTH = 512 * 1024`).
* **5 MB Max Socket Message Size:** Configured `maxHttpBufferSize: 5e6` on the Socket.IO server to prevent memory exhaustion attacks.
* **8,000-Character AI Prompt Limit:** Validated on `POST /api/ai/copilot` alongside a 4,000-character editor context clip.
* **43 Editor Themes & 30+ Languages:** Pre-configured CodeMirror themes in `Themes.ts` and dynamic syntax loading via `@uiw/codemirror-extensions-langs`.
* **10 Fallback Execution Runtimes:** Bundled in `constants/pistonFallbackLanguages.ts` covering JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, Ruby, and PHP.
* **3 Container Services in Local Stack:** Nginx client, Node.js API server, and Redis 7 Alpine cache defined in `docker-compose.yml`.

---

## 11. Resume Bullet Structure Formula

All resume entries in this portfolio strictly follow the proven engineering impact formula:

$$\textbf{Strong Action Verb} + \textbf{What Was Engineered} + \textbf{Technical Implementation / How} + \textbf{Impact \& Constraints}$$

*Example Breakdown:*
* **Action Verb:** *Architected*
* **What:** *a real-time collaborative developer IDE*
* **How:** *using React 19, TypeScript, Node.js, Express, and Socket.IO, building custom CodeMirror 6 StateField decoration extensions and room-scoped event distribution*
* **Impact:** *enabling synchronized multi-cursor editing, presence awareness, and sub-50ms keystroke broadcasts while enforcing strict cross-room security boundaries.*

---

## 12. Role-Targeted ATS Alignments

### For Full-Stack Software Engineer Roles
> Emphasize end-to-end TypeScript architecture, React 19 component hierarchy, Express REST and SSE endpoints, bidirectional Socket.IO communication, and modular context-driven state management.

### For Backend / Systems Software Engineer Roles
> Emphasize the PTY lifecycle manager (`node-pty`), child process spawning, Unix/Windows shell abstractions, circular scrollback buffers, three-tier rate limiters, session cookie serialization, and cross-room socket authorization guards.

### For AI / Machine Learning Engineer Roles
> Emphasize LLM integration with Google Gemini, Server-Sent Events (SSE) token streaming via async generators, pre-flight credential redaction regex engines, active context window trimming, and structured prompt engineering.

### For Cloud / DevOps Engineer Roles
> Emphasize multi-stage Docker builds, unprivileged user security (`USER node`), Nginx SPA caching and gzip configuration, automated EC2 deployment scripts with swap management, and GitHub Actions CI pipelines with container health check validation.

---

## 13. Interview Defense

### Socket.IO Real-Time Engine
* **What I built:** A room-partitioned real-time communication bus handling 33 distinct event types.
* **Why I used it:** Needed low-latency, bidirectional event-driven communication with automatic WebSocket transport fallback and built-in room clustering abstractions.
* **How it works:** When a client joins a room, the server validates their username, assigns them to a Socket.IO room (`socket.join(roomId)`), broadcasts their presence to peers, and routes editor, whiteboard, terminal, and WebRTC events exclusively within that room.
* **Important engineering decision:** Implemented server-side tenancy verification (`isInSameRoom(socketId, roomId)`) on critical events like `SYNC_FILE_STRUCTURE`, `SYNC_DRAWING`, and `WEBRTC_SIGNAL`. This prevents malicious clients from emitting events that leak code or drawings to arbitrary sockets across different rooms.
* **Potential limitation:** The current implementation stores room memberships in single-process RAM (`userSocketMap`), meaning it cannot scale horizontally across multiple servers without dropping cross-node broadcasts.
* **Possible future improvement:** Wire `@socket.io/redis-adapter` into the already-provisioned Redis 7 container to establish an inter-process Pub/Sub message bus across horizontal backend instances.

---

### CodeMirror 6 Collaborative Highlighting
* **What I built:** A custom CodeMirror 6 editor extension that tracks and renders remote peer cursors and selections in real time.
* **Why I used it:** CodeMirror 6 provides a functional, modular state architecture (`StateField`, `StateEffect`, `EditorView.decorations`) with superior performance over traditional monolithic DOM editors.
* **How it works:** Cursor movements and selection changes trigger debounced `CURSOR_MOVE` and `TYPING_START` socket events. On remote clients, incoming coordinates dispatch a custom `updateRemoteUsers` effect. The `remoteUsersField` parses the state, translates document positions through recent changes via `tr.changes`, and constructs `CursorWidget` DOM nodes and translucent `Decoration.mark` highlights.
* **Important engineering decision:** Used a deterministic string hashing algorithm on usernames (`username.charCodeAt(i)`) modulo a 10-color palette. This ensures every collaborator sees the exact same color for a given peer without requiring coordinated color state negotiation from the server.
* **Potential limitation:** Large simultaneous concurrent document edits can experience cursor position drift if network latency is high, as the editor currently relies on state replacement rather than full Operational Transformation (OT) or CRDT algorithms.
* **Possible future improvement:** Integrate Yjs (`y-codemirror.next`) or Automerge over Socket.IO to enable CRDT-based character-level conflict resolution.

---

### Google Gemini AI Copilot & Streaming
* **What I built:** An AI coding assistant streaming responses over Server-Sent Events (SSE) with pre-flight credential redaction.
* **Why I used it:** Code generation requires streaming output to minimize time-to-first-token (TTFT) and improve user responsiveness. Developer code frequently contains secrets that must never be transmitted to third-party model providers.
* **How it works:** The frontend issues a `POST /api/ai/copilot` request with prompt and active code context. The server runs the text through 12 regex pattern matchers, clips context to 4,000 characters, initializes the `@google/generative-ai` SDK (`gemini-2.5-flash`), and yields chunks through an async generator over `text/event-stream`.
* **Important engineering decision:** Configured `X-Accel-Buffering: no` and explicit `res.flushHeaders()` on the Express response. This prevents Nginx reverse proxies from buffering SSE chunks into batches, preserving true real-time token streaming in production.
* **Potential limitation:** If a user writes an obfuscated secret or uncommon environment variable name that escapes the 12 regex patterns, it could still be forwarded to the LLM.
* **Possible future improvement:** Implement entropy-based secret detection (e.g., Shannon entropy scanning) to catch high-randomness tokens regardless of naming conventions.

---

### Terminal Emulator (`@xterm/xterm` & `node-pty`)
* **What I built:** An in-browser interactive terminal connected to a live OS pseudoterminal process.
* **Why I used it:** Developers need to run test suites, install packages, and navigate directories using standard command-line tools without leaving the collaborative workspace.
* **How it works:** The client instantiates an `@xterm/xterm` terminal with `@xterm/addon-fit`. Keystrokes are transmitted via `terminal:data` socket events to `terminalManager.ts`, which writes them to a spawned `node-pty` session. Terminal output is captured, appended to a 50,000-character buffer, and broadcast back to the room.
* **Important engineering decision:** Implemented cross-platform shell detection (spawning `powershell.exe` on Windows and `$SHELL` or `/bin/bash -l` on Linux) with a graceful fallback to Node.js `child_process.spawn` if native `node-pty` compilation fails on the host machine.
* **Potential limitation:** Spawning PTY sessions directly on the host server creates security risks (fork bombs, CPU starvation, filesystem tampering) if untrusted users have terminal access.
* **Possible future improvement:** Isolate each room's terminal session inside an ephemeral, unprivileged Docker container or Firecracker microVM with strict memory and CPU quotas (`pids-limit 100`, memory limit 512MB).

---

### WebRTC Mesh Audio & Video (`simple-peer`)
* **What I built:** A peer-to-peer audio and video calling system embedded directly into the collaborative IDE.
* **Why I used it:** Pair-programming is significantly more effective when developers can communicate verbally and visually while viewing the same codebase.
* **How it works:** Clients announce media readiness via `STREAM_READY`. The server emits `USER_READY` events to room peers. Clients negotiate WebRTC connections using `simple-peer`, exchanging SDP offers, answers, and ICE candidates through the server over `WEBRTC_SIGNAL` events.
* **Important engineering decision:** Implemented a deterministic lexicographical tie-breaker (`userID > socket.id`) to determine which peer acts as the WebRTC initiator. This prevents glare where two peers simultaneously send connection offers to each other, causing connection failures.
* **Potential limitation:** A mesh topology requires each participant to upload their media stream to every other participant ($N-1$ outbound streams), exhausting client upload bandwidth and CPU beyond 4–6 participants.
* **Possible future improvement:** Transition from mesh architecture to a Selective Forwarding Unit (SFU) such as LiveKit or mediasoup, allowing each client to send a single stream ($O(1)$) to a media server that fans it out to participants.

---

### Authentication & Defense-in-Depth Security
* **What I built:** Session-based authentication via Google OAuth 2.0 with rate-limiting and security headers.
* **Why I used it:** Prevents user impersonation, protects AI endpoints from unauthenticated token exhaustion, and provides verified user identities for collaborative presence.
* **How it works:** Unauthenticated users are redirected to Google's OAuth consent screen via Passport.js. Upon callback, their profile is stored in an in-memory user map and serialized to an encrypted `collabnet.sid` session cookie with `HttpOnly`, `Secure`, and `SameSite` flags.
* **Important engineering decision:** Created an automatic `/auth/dev-login` fallback that activates when Google OAuth client credentials are not configured in `.env`. This allows developers to test authenticated features locally without requiring live GCP cloud console credentials.
* **Potential limitation:** The `userStore` is stored in Node.js heap memory, so user sessions and profiles are lost whenever the server process restarts.
* **Possible future improvement:** Persist user profiles and session stores to a PostgreSQL database with Prisma ORM and configure `connect-redis` for distributed session persistence.

---

### Docker & Production Parity
* **What I built:** Multi-stage container images and Docker Compose orchestration for local and production deployment.
* **Why I used it:** Ensures consistent execution environments across developer machines and eliminates "works on my machine" issues related to native C++ dependencies like `node-pty`.
* **How it works:** The server Dockerfile uses a three-stage build (`base` → `deps` → `runner`), compiling `node-pty` native modules with `python3`, `make`, and `g++`, and drops privileges to `USER node`. The client Dockerfile compiles TypeScript and Vite in a builder stage and copies static assets to an Nginx 1.27 Alpine web server configured with gzip compression and SPA routing.
* **Important engineering decision:** Added dedicated `/healthz` HTTP endpoints to both services and configured Docker `HEALTHCHECK` probes to ensure dependent containers only start once prerequisite services are confirmed healthy.
* **Potential limitation:** In the current Docker Compose setup, terminal processes executed inside the server container have access to the server's own container filesystem.
* **Possible future improvement:** Implement Docker-out-of-Docker (DooD) or a dedicated Docker worker daemon to spawn terminal commands in completely isolated sibling containers.

---

## 14. 30-Second Interview Explanation

> "CollabNet is a full-stack real-time collaborative IDE designed for distributed pair-programming. I built it with React 19, TypeScript, Express, and Socket.IO.
>
> The core technical challenge was coordinating multiple real-time streams concurrently: we synchronize CodeMirror 6 editor cursors using custom transaction decorations, stream bidirectional PTY terminal sessions over WebSockets via `node-pty` and `xterm.js`, and sync vector whiteboard drawings with `tldraw`. 
>
> On the backend, I built an SSE-streamed AI copilot powered by Google Gemini, engineering a pre-flight credential sanitizer that scrubs 12 secret patterns before prompts leave the server. 
>
> For security, the system enforces three-tier IP rate limiting, Google OAuth 2.0 session auth, and strict room authorization boundaries to prevent cross-tenant data leakage. The entire platform is containerized using multi-stage Docker builds and validated by an automated GitHub Actions CI pipeline."

---

## 15. "Tell Me About Your Project" Answer (1–2 Minutes)

> "The project I'm most proud of is CollabNet, a browser-based collaborative developer IDE built for distributed software teams. The motivation came from seeing how fragmented remote pair-programming often is—developers are usually jumping between VS Code, Zoom screen-sharing, Slack huddles, and external whiteboards.
>
> I wanted to engineer a unified developer workspace that could handle all of that inside a single browser tab. The architecture consists of a React 19 single-page application and a Node.js/Express backend communicating over Socket.IO.
>
> The most technically complex aspect was managing state synchronization across multiple disparate domains. For code editing, I implemented a custom CodeMirror 6 extension using `StateField` and `WidgetType` that maps remote cursor coordinates through document transactions, assigning deterministic colors based on username hashes. For terminal access, I connected `@xterm/xterm` to a native `node-pty` process on the backend, implementing cross-platform shell detection, window resizing, and a 50,000-character circular scrollback buffer that replays terminal history to new participants.
>
> Another component I invested heavily in was the AI pair-programmer. I integrated Google Gemini using Server-Sent Events to stream token responses. Because developers routinely paste configuration files containing sensitive data, I engineered a pre-flight redaction engine that scrubs 12 credential patterns—such as private keys, database connection strings, and AWS keys—before the request ever touches Gemini's API.
>
> On the infrastructure side, I implemented defense-in-depth security: Google OAuth 2.0 with session cookies, three-tier IP rate limiting, and server-side room validation checks that verify socket membership to prevent cross-room data leaks. I containerized the entire stack using multi-stage Dockerfiles running as an unprivileged user, and built a GitHub Actions CI pipeline that runs TypeScript validation, container readiness checks, and an 11-step automated socket integration test suite.
>
> Building CollabNet gave me deep hands-on experience with WebSocket architecture, state reconciliation, LLM integration, and containerized deployment."

---

## 16. Project Title Options

1. **CollabNet — Real-Time Collaborative Developer IDE**  
   *(Recommended for general Software Engineering, Full-Stack, and Web Development roles)*

2. **CollabNet — Distributed Real-Time Developer Workspace & AI Copilot**  
   *(Recommended for AI Engineering, Full-Stack, and Product Engineering roles)*

3. **CollabNet — High-Concurrency Cloud IDE & Interactive Terminal Platform**  
   *(Recommended for Backend, Distributed Systems, Cloud, and DevOps roles)*

---

# FINAL RECOMMENDED RESUME ENTRY

```text
COLLABNET — REAL-TIME COLLABORATIVE DEVELOPER IDE
Tech Stack: React 19, TypeScript, Node.js, Express, Socket.IO, Google Gemini API, WebRTC, CodeMirror 6, xterm.js, Docker, Nginx, Redis, GitHub Actions

• Architected a real-time collaborative IDE supporting multi-cursor code pairing, interactive pseudoterminal streaming, collaborative tldraw whiteboarding, and P2P WebRTC audio/video calls in a unified React 19 SPA.
• Built an SSE-streamed AI copilot using the Google Gemini API (@google/generative-ai) with pre-flight credential redaction scrubbing 12 secret patterns, 4KB active-file context truncation, and 1-click editor code injection.
• Engineered an interactive cloud terminal via @xterm/xterm (v6.0) and node-pty over bidirectional WebSockets, featuring a dual-mode code execution engine with remote worker HTTP dispatch and local sandboxed process fallback.
• Implemented defense-in-depth security including Google OAuth 2.0 session auth, three-tier IP rate limiting, input payload sanitization, and server-side room boundary validation preventing cross-tenant data leaks.
• Containerized the application using multi-stage Dockerfiles (unprivileged Node runner, Nginx SPA compression) and established GitHub Actions CI automating type checking, health checks, and 11-assertion socket integration tests.
```
