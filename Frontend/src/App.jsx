import "./index.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { Terminal } from "./Components/Terminal"
import axios from "axios"

function App() {

  const editorRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [ users, setUsers ] = useState([])
  const [ buildOutput, setBuildOutput ] = useState("")

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

  const handleBuild = async () => {
    setBuildOutput("")
    try {
      const response = await axios.post("http://localhost:5000/api/build", {
        username,
      })
      setBuildOutput(response.data.output || "Build initiated...")
    } catch (error) {
      setBuildOutput(`Error: ${error.message}`)
    }
  }

  const handleRun = async () => {
    setBuildOutput("")
    try {
      const code = editorRef.current?.getValue() || ""
      const response = await axios.post("http://localhost:5000/api/run", {
        code,
        username,
      })
      setBuildOutput(response.data.output || "Code executed...")
    } catch (error) {
      setBuildOutput(`Error: ${error.message}`)
    }
  }

  useEffect(() => {

    console.log(username)

    if (username) {

      const provider = new SocketIOProvider("/", "monaco", ydoc, {
        autoConnect: true,
      })

      provider.awareness.setLocalStateField("user", { username })


      const states = Array.from(provider.awareness.getStates().values())

      console.log(states)

      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      // Listen for build output
      provider.on("build-output", (data) => {
        setBuildOutput((prev) => prev + "\r\n" + data.output)
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
        className="w-3/4 h-full bg-neutral-800 rounded-lg overflow-hidden flex flex-col gap-2">
        <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 rounded-t-lg">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Editor</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
            >
              Run
            </button>
            <button
              onClick={handleBuild}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              Build
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            theme="vs-dark"
            onMount={handleMount}
          />
        </div>
        <div className="h-1/3 overflow-hidden">
          <Terminal buildOutput={buildOutput} />
        </div>
      </section>

    </main>
  )
}

export default App