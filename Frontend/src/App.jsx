import Editor from '@monaco-editor/react'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { MonacoBinding } from "y-monaco"

const App = () => {
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const [draftName, setDraftName] = useState("")
  const [userName, setUserName] = useState("")
  const ydoc = useMemo(() => new Y.Doc(), [])
  const ytext = useMemo(() => ydoc.getText('monaco'), [ydoc])

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

  const handleMount = (editor) => {
    const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
      autoConnect: true
    })

    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: '#ef4444'
    })

    providerRef.current = provider

    const monacoBinding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )

    bindingRef.current = monacoBinding
  }

  const handleJoin = (e) => {
    e.preventDefault()
    const trimmedName = draftName.trim()
    if (!trimmedName) return
    setUserName(trimmedName)
  }

  if (!userName)
    return <main className='h-screen w-full p-4 bg-gray-950 flex gap-4 items-center justify-center'>
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
  return (
    <main className='h-screen w-full p-4 bg-gray-950 flex gap-4'> 
     <aside className='h-full w-1/4 rounded-lg bg-amber-50'>
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