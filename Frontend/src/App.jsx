import Editor from '@monaco-editor/react'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { MonacoBinding } from "y-monaco"
import LeftPanel from './Componenets.jsx/LeftPanel'
import RightPanel from './Componenets.jsx/RightPanel'
import TopBar from './Componenets.jsx/TopBar'

const App = () => {
  const editorRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const containerRef = useRef(null)
  const isDraggingRef = useRef(false)
  const activeDividerRef = useRef(null)
  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username")
  })
  const [users, setUsers] = useState([])
  const [draftName, setDraftName] = useState('')
  const [leftPanelWidth, setLeftPanelWidth] = useState(20)
  const [editorWidth, setEditorWidth] = useState(60)
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

    const HandelMouse = (e) => {
      if (!isDraggingRef.current || !containerRef.current || activeDividerRef.current !== 'left') return
      
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      if (newWidth > 5 && newWidth < 70) {
        setLeftPanelWidth(newWidth)
      }
    }

    const HandelMouseUp = () => {
      isDraggingRef.current = false
      activeDividerRef.current = null
      document.removeEventListener('mousemove', HandelMouse)
      document.removeEventListener('mouseup', HandelMouseUp)
    }

    document.addEventListener('mousemove', HandelMouse)
    document.addEventListener('mouseup', HandelMouseUp)
  }

  const handleRightDividerMouseDown = () => {
    isDraggingRef.current = true
    activeDividerRef.current = 'right'

    const HandelMouse = (e) => {
      if (!isDraggingRef.current || !containerRef.current || activeDividerRef.current !== 'right') return
      
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      const minRightPanelWidth = 10
      const maxEditorWidth = 100 - leftPanelWidth - minRightPanelWidth
      const calculatedEditorWidth = newWidth - leftPanelWidth
      
      if (calculatedEditorWidth > 20 && calculatedEditorWidth < maxEditorWidth) {
        setEditorWidth(calculatedEditorWidth)
      }
    }

    const HandelMouseUp = () => {
      isDraggingRef.current = false
      activeDividerRef.current = null
      document.removeEventListener('mousemove', HandelMouse)
      document.removeEventListener('mouseup', HandelMouseUp)
    }

    document.addEventListener('mousemove', HandelMouse)
    document.addEventListener('mouseup', HandelMouseUp)
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

  if (!userName)
    return (
      <main className='h-screen w-full p-4 bg-gray-950 flex gap-4 items-center justify-center'>
        <form onSubmit={handleJoin}>
          <input
            className='bg-red-600'
            type='text'
            name='userName'
            placeholder='Enter your name'
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <button className='bg-red-600' type='submit'>Join</button>
        </form>
      </main>
    )
  return (
    <div className='h-screen w-full flex flex-col bg-gray-950'>
      <TopBar onLeaveRoom={handleLeaveRoom} />
      
      <main className='flex-1 p-4 bg-gray-950 flex gap-4' ref={containerRef}>
        <LeftPanel 
          width={leftPanelWidth}
          onDividerMouseDown={handleLeftDividerMouseDown}
        />
        
        <section 
          className='h-full rounded-lg bg-neutral-600 overflow-hidden'
          style={{ width: `${editorWidth}%` }}
        >
          <Editor
            height="100%"
            defaultLanguage='javascript'
            defaultValue='// some comment'
            theme='vs-dark'
            onMount={handleMount}
          />
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


  