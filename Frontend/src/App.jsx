import "./index.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { Terminal } from "./Components/Terminal"
import io from "socket.io-client"

function App() {

  const editorRef = useRef(null)
  const socketRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [ users, setUsers ] = useState([])
  const [ activeTab, setActiveTab ] = useState("editor")
  const [ socketReady, setSocketReady ] = useState(false)

  const handleRun = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue()
      console.log('Running code:', code)
      if (socketRef.current) {
        console.log('Emitting editor:run event')
        socketRef.current.emit("editor:run", code)
        setActiveTab("terminal")
      } else {
        console.log('Socket not connected')
      }
    } else {
      console.log('Editor not mounted')
    }
  }

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])


  const handleMount = (editor) => {
    editorRef.current = editor

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
    )
  }




  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)



  }

  useEffect(() => {

    console.log(username)

    if (username) {

      const provider = new SocketIOProvider("/", "monaco", ydoc, {
        autoConnect: true,
      })

      // Store socket reference for code execution
      socketRef.current = provider.socket
      
      // Wait for socket to be ready
      if (provider.socket.connected) {
        setSocketReady(true)
      } else {
        provider.socket.on('connect', () => {
          console.log('Socket connected')
          setSocketReady(true)
        })
      }

      provider.awareness.setLocalStateField("user", { username })


      const states = Array.from(provider.awareness.getStates().values())

      console.log(states)

      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)


      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [
    username
  ])

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center" >
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    )
  }

  return (
    <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      <aside
        className="h-full w-1/4 bg-amber-50 rounded-lg "
      >
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>

      </aside>
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "editor"
                ? "bg-amber-50 text-gray-950"
                : "bg-neutral-700 text-white hover:bg-neutral-600"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "terminal"
                ? "bg-amber-50 text-gray-950"
                : "bg-neutral-700 text-white hover:bg-neutral-600"
            }`}
          >
            Terminal
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "editor" ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-end p-2 bg-neutral-700 border-b border-gray-600">
                <button
                  onClick={handleRun}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                >
                  ▶ Run
                </button>
              </div>
              <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue="// some comment"
                theme="vs-dark"
                onMount={handleMount}
              />
            </div>
          ) : socketReady ? (
            <Terminal socket={socketRef.current} />
          ) : (
            <div style={{ color: '#d4d4d4', padding: '20px' }}>Connecting to server...</div>
          )}
        </div>
      </section>

    </main>
  )
}

export default App