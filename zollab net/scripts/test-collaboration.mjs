/**
 * Socket.io integration smoke test for zollab net collaboration.
 * Run: node scripts/test-collaboration.mjs
 */
import { io } from "../client/node_modules/socket.io-client/build/esm/index.js"

const BACKEND = process.env.BACKEND_URL || "http://localhost:3000"
const ROOM = "test-room-12345"
const TIMEOUT_MS = 8000

const events = {
  JOIN_REQUEST: "join-request",
  JOIN_ACCEPTED: "join-accepted",
  USER_JOINED: "user-joined",
  USER_DISCONNECTED: "user-disconnected",
  SYNC_FILE_STRUCTURE: "sync-file-structure",
  FILE_UPDATED: "file-updated",
  TYPING_START: "typing-start",
  USERNAME_EXISTS: "username-exists",
}

function waitFor(socket, event, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler)
      reject(new Error(`Timeout waiting for "${event}"`))
    }, TIMEOUT_MS)

    function handler(payload) {
      try {
        if (!predicate(payload)) return
        clearTimeout(timer)
        socket.off(event, handler)
        resolve(payload)
      } catch (e) {
        clearTimeout(timer)
        socket.off(event, handler)
        reject(e)
      }
    }
    socket.on(event, handler)
  })
}

function connectClient(username) {
  const socket = io(BACKEND, { transports: ["websocket"], forceNew: true })
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Connect timeout: ${username}`)), TIMEOUT_MS)
    socket.on("connect", () => {
      clearTimeout(timer)
      resolve(socket)
    })
    socket.on("connect_error", (err) => {
      clearTimeout(timer)
      reject(err)
    })
  }).then(() => {
    socket.emit(events.JOIN_REQUEST, { roomId: ROOM, username })
    return waitFor(socket, events.JOIN_ACCEPTED).then((payload) => ({ socket, payload }))
  })
}

const results = []

function pass(name) {
  results.push({ name, ok: true })
  console.log(`✓ ${name}`)
}

function fail(name, err) {
  results.push({ name, ok: false, err: String(err) })
  console.error(`✗ ${name}:`, err)
}

async function run() {
  let alice, bob, carol

  try {
    const aliceJoin = await connectClient("alice")
    alice = aliceJoin.socket
    pass("Alice connects and joins room")
    if (aliceJoin.payload.users?.length >= 1) pass("Join accepted returns user list")
    else throw new Error("No users in join-accepted")

    const bobJoinedPromise = waitFor(
      alice,
      events.USER_JOINED,
      (p) => p.user?.username === "bob",
    )
    const bobJoin = await connectClient("bob")
    bob = bobJoin.socket
    pass("Bob connects and joins same room")

    await bobJoinedPromise
    pass("Alice receives user-joined for Bob")

    const mockStructure = {
      id: "root",
      name: "root",
      type: "directory",
      children: [
        { id: "f1", name: "main.js", type: "file", content: "console.log(1)" },
      ],
      isOpen: true,
    }
    const mockOpen = mockStructure.children
    const mockActive = mockStructure.children[0]

    const syncPromise = waitFor(bob, events.SYNC_FILE_STRUCTURE)

    alice.emit(events.SYNC_FILE_STRUCTURE, {
      fileStructure: mockStructure,
      openFiles: mockOpen,
      activeFile: mockActive,
      socketId: bob.id,
    })

    const synced = await syncPromise
    if (synced.fileStructure?.children?.[0]?.content === "console.log(1)") {
      pass("Bob receives file structure sync from Alice")
    } else throw new Error("Sync payload mismatch")

    const fileUpdatePromise = waitFor(bob, events.FILE_UPDATED)
    alice.emit(events.FILE_UPDATED, {
      fileId: "f1",
      newContent: "console.log(2)",
    })
    const updated = await fileUpdatePromise
    if (updated.newContent === "console.log(2)") pass("Bob receives live file update")
    else throw new Error("File update payload mismatch")

    const typingPromise = waitFor(bob, events.TYPING_START)
    alice.emit(events.TYPING_START, {
      cursorPosition: 5,
      selectionStart: 5,
      selectionEnd: 5,
    })
    const typing = await typingPromise
    if (typing.user?.cursorPosition === 5) pass("Bob receives cursor/typing events")
    else throw new Error("Typing payload mismatch")

    const carolJoin = await connectClient("carol")
    carol = carolJoin.socket
    pass("Carol joins (3rd user — multi-peer sync)")

    const carolSync = waitFor(carol, events.SYNC_FILE_STRUCTURE)
    alice.emit(events.SYNC_FILE_STRUCTURE, {
      fileStructure: mockStructure,
      openFiles: mockOpen,
      activeFile: mockActive,
      socketId: carol.id,
    })
    await carolSync
    pass("Carol receives file sync (socket.on, not once)")

    const reconnect = io(BACKEND, { transports: ["websocket"], forceNew: true })
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("reconnect timeout")), TIMEOUT_MS)
      reconnect.on("connect", () => {
        clearTimeout(t)
        res()
      })
      reconnect.on("connect_error", rej)
    })
    reconnect.emit(events.JOIN_REQUEST, { roomId: ROOM, username: "alice" })
    const rejoin = await waitFor(reconnect, events.JOIN_ACCEPTED)
    if (rejoin.user?.username === "alice") pass("Alice can rejoin with same username (reconnect)")
    else throw new Error("Rejoin failed")

    const dup = io(BACKEND, { transports: ["websocket"], forceNew: true })
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("dup timeout")), TIMEOUT_MS)
      dup.on("connect", () => {
        clearTimeout(t)
        res()
      })
    })
    dup.emit(events.JOIN_REQUEST, { roomId: ROOM, username: "bob" })
    const dupJoin = await waitFor(dup, events.JOIN_ACCEPTED)
    if (dupJoin.user?.username === "bob") pass("Bob reconnect replaces stale socket (not username-exists)")
    else throw new Error("Expected rejoin, not block")

    alice.disconnect()
    bob.disconnect()
    carol.disconnect()
    reconnect.disconnect()
    dup.disconnect()
    pass("All sockets disconnected cleanly")
  } catch (err) {
    fail("Test suite", err)
  } finally {
    ;[alice, bob, carol].forEach((s) => s?.disconnect?.())
  }

  const failed = results.filter((r) => !r.ok)
  console.log("\n--- Summary ---")
  console.log(`Passed: ${results.filter((r) => r.ok).length}/${results.length}`)
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "))
    process.exit(1)
  }
  console.log("All collaboration checks passed.")
}

run()
