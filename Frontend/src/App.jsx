
import Editor from '@monaco-editor/react'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { MonacoBinding } from "y-monaco"

const App = () => {
  const editorRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username")
  })
  const [users, setUsers] = useState([])
  const [draftName, setDraftName] = useState('')
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
  .

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
    <main className='h-screen w-full p-4 bg-gray-950 flex gap-4'>
      <aside className='h-full w-1/4 rounded-lg bg-amber-50'>
        <h2 className='text-2xl font-bold p-4 border-b'>Users</h2>
        <ul>{users.map(({ username }, index) => (
          <li key={index}>{username}</li>
        ))}</ul>
      </aside>
      <section className='h-full w-3/4 rounded-lg bg-neutral-600 overflow-hidden'>
        <Editor
          height="100%"
          defaultLanguage='javascript'
          defaultValue='// some comment'
          theme='vs-dark'
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App


 