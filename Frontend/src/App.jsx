import Editor from '@monaco-editor/react'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { MonacoBinding } from "y-monaco"
import LeftPanel from './Componenets.jsx/LeftPanel'
import RightPanel from './Componenets.jsx/RightPanel'
import TopBar from './Componenets.jsx/TopBar'
import Output from './Componenets.jsx/Output'

const App = () => {
  const editorRef = useRef(null)
  const runCodeRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const containerRef = useRef(null)
  const isDraggingRef = useRef(false)
  const [value, setValue] = useState("")
  const activeDividerRef = useRef(null)
  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username")
  })
  const [users, setUsers] = useState([])
  const [draftName, setDraftName] = useState('')
  const [leftPanelWidth, setLeftPanelWidth] = useState(15)
  const [editorWidth, setEditorWidth] = useState(70)
  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText('monaco'), [ydoc])

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy()
      }
      if (providerRef.current) {
        providerRef.current.disconnect()
        providerRef.current.destroy()
}
      ydoc.destroy()
    }
  }, [ydoc])

  const handleLeftDividerMouseDown = () => {
    isDraggingRef.current = true
    activeDividerRef.current = 'left'

    const HandleMouse = (e) => {
      if (!isDraggingRef.current || !containerRef.current || activeDividerRef.current !== 'left') return
      
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      if (newWidth > 5 && newWidth < 40) {
        setLeftPanelWidth(newWidth)
      }
    }

    const HandleMouseUp = () => {
      isDraggingRef.current = false
      activeDividerRef.current = null
      document.removeEventListener('mousemove', HandleMouse)
      document.removeEventListener('mouseup', HandleMouseUp)
    }

    document.addEventListener('mousemove', HandleMouse)
    document.addEventListener('mouseup', HandleMouseUp)
  }

  const handleRightDividerMouseDown = () => {
    isDraggingRef.current = true
    activeDividerRef.current = 'right'

    const HandleMouse = (e) => {
      if (!isDraggingRef.current || !containerRef.current || activeDividerRef.current !== 'right') return
      
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      const minRightPanelWidth = 10
      const maxEditorWidth = 100 - leftPanelWidth - minRightPanelWidth
      const calculatedEditorWidth = newWidth - leftPanelWidth
      
      if (calculatedEditorWidth > 30 && calculatedEditorWidth < maxEditorWidth) {
        setEditorWidth(calculatedEditorWidth)
      }
    }

    const HandleMouseUp = () => {
      isDraggingRef.current = false
      activeDividerRef.current = null
      document.removeEventListener('mousemove', HandleMouse)
      document.removeEventListener('mouseup', HandleMouseUp)
    }

    document.addEventListener('mousemove', HandleMouse)
    document.addEventListener('mouseup', HandleMouseUp)
  }
  

  const handleMount = (editor) => {
    editorRef.current = editor
    if (userName && !providerRef.current) {
      const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
        autoConnect: true,
      })

      provider.awareness.setLocalStateField("user", { username: userName })

      const updateUsers = () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(
          states
            .map((state) => state.user || {})
            .filter((user) => Boolean(user.username))
        )
      }

      updateUsers()
      provider.awareness.on("change", updateUsers)

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }
      window.addEventListener("beforeunload", handleBeforeUnload)
      

     
      

      providerRef.current = provider
      bindingRef.current = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        provider.awareness
      )

      return () => {
        if (bindingRef.current) {
          bindingRef.current.destroy()
        }
        if (providerRef.current) {
          providerRef.current.disconnect()
          providerRef.current.destroy()
        }
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }

  const handleJoin = (e) => {
    e.preventDefault()
    const name = e.target.userName.value.trim()
    if (!name) return
    setUserName(name)
    window.history.pushState({}, "", "?username=" + name)
  }

  const handleLeaveRoom = () => {
    setUserName(null)
    window.history.pushState({}, "", "/")
  }

  const handleRunCode = () => {
    if (runCodeRef.current) {
      runCodeRef.current()
    }
  }

  if (!userName)
    return (
      <main className='h-screen w-full bg-slate-950 flex items-center justify-center'>
        <div className='w-full max-w-md px-6'>
          <div className='mb-8 text-center'>
            <h1 className='text-4xl font-bold text-white mb-2'>CollabNet</h1>
            <p className='text-slate-400'>Real-time collaborative code editor</p>
          </div>
          <form onSubmit={handleJoin} className='space-y-4'>
            <div>
              <input
                className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                type='text'
                name='userName'
                placeholder='Enter your name'
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200'
              type='submit'
            >
              Join Workspace
            </button>
          </form>
        </div>
      </main>
    )
  return (
    <div className='h-screen w-full flex flex-col bg-slate-950'>
      <TopBar onLeaveRoom={handleLeaveRoom} onRunCode={handleRunCode} userName={userName} />
      
      <main className='flex-1 flex gap-1 bg-slate-950 overflow-hidden' ref={containerRef}>
        <LeftPanel 
          width={leftPanelWidth}
          onDividerMouseDown={handleLeftDividerMouseDown}
        />
        
        <section 
          className='h-full bg-slate-800 overflow-hidden flex flex-col'
          style={{ width: `${editorWidth}%` }}
        >
          <div className='flex-1 overflow-hidden'>
            <Editor
              height="100%"
              defaultLanguage='javascript'
              defaultValue='// Welcome to CollabNet\n// Start coding here...'
              theme='vs-dark'
              onMount={handleMount}
              onChange={(newValue) => setValue(newValue || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
          <div className='h-48 border-t border-slate-700 bg-slate-900'>
            <Output editerRef={editorRef} onRunCodeRef={runCodeRef}/>
          </div>
        </section>
        
        <RightPanel 
          users={users}
          width={100 - leftPanelWidth - editorWidth}
          onDividerMouseDown={handleRightDividerMouseDown}
        />
      </main>
    </div>
  )
}

export default App


  