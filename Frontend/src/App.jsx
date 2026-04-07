import Editor from '@monaco-editor/react'

const App = () => {
  return (
    <main className='h-screen w-full p-4 bg-gray-950 flex gap-4'> 
     <aside className='h-full w-1/4 rounded-lg bg-amber-50'>
     </aside>
     <section className='w-3/4 rounded-lg bg-neutral-600'>
     <Editor height="100%"
     defaultLanguage='javascript'
     defaultValue='// some comment'
     theme='vs-dark'/>

     </section>

     
    </main>
  )
}

export default App