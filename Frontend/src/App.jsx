import Editor from '@monaco-editor/react'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { MonacoBinding } from "y-monaco"
const App = () => {
  const editRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
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
    editRef.current = editor
    const provider = new SocketIOProvider("https://localhost:3000", "monaco", ydoc, {
      autoConnect: true
    })

    providerRef.current = provider

    const monacoBinding = new MonacoBinding(
      ytext,
      editRef.current.getModel(),
      new Set([editor]),
      provider.awareness
    )

    bindingRef.current = monacoBinding
  }
  const handlejoin=(e)=>{
    e.preventDefault()
    
  }
  if(!userName)
    return <main className='h-screen w-full p-4 bg-gray-950 flex gap-4 items-center justify-center'>
      <form action=""></form>
      <input
      type='text'
      placeholder='Enter your name'
      value={userName}
      onChange={(e) => setUserName(e.target.value)}
      />
    </main>
  return (
    <main className='h-screen w-full p-4 bg-gray-950 flex gap-4'> 
    <form action="">
     <aside className='h-full w-1/4 rounded-lg bg-amber-50'>
     </aside>
     <section className='w-3/4 rounded-lg bg-neutral-600'>
     <Editor height="100%"
     defaultLanguage='javascript'
     defaultValue='// some comment'
     theme='vs-dark'
     onMount={handleMount}/>

     </section>
</form>
     
    </main>
  )
}

export default App