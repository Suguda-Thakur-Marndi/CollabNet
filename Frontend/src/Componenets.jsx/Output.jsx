import { useEffect, useState } from 'react'
import axios from 'axios'

const Output = ({ editerRef, onRunCodeRef }) => {
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleRunCode = async () => {
      if (!editerRef?.current) return

      const code = editerRef.current.getValue()
      if (!code.trim()) {
        setError('Please enter some code to execute')
        return
      }

      setIsLoading(true)
      setError('')
      setOutput('')

      try {
        const response = await axios.post('http://localhost:3000/execute', { code })

        if (response.data.success) {
          setOutput(response.data.run.stdout)
          if (response.data.run.stderr) {
            setError(response.data.run.stderr)
          }
        } else {
          setError('Failed to execute code')
        }
      } catch (err) {
        setError(`Error: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (onRunCodeRef) {
      onRunCodeRef.current = handleRunCode
    }
  }, [editerRef, onRunCodeRef])

  return (
    <div className='h-full bg-slate-900 text-slate-100 p-4 overflow-y-auto flex flex-col'>
      <div className='mb-3 pb-3 border-b border-slate-700'>
        <h3 className='font-semibold text-sm uppercase tracking-wide text-white'>Output</h3>
      </div>
      
      <div className='flex-1 overflow-y-auto space-y-2'>
        {isLoading && <div className='text-yellow-400 text-sm'>⏳ Running code...</div>}
        
        {error && (
          <div className='bg-red-900/30 border border-red-700/50 p-3 rounded text-red-200 text-sm'>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {output && (
          <pre className='bg-slate-800 p-3 rounded text-green-400 whitespace-pre-wrap break-words text-xs font-mono border border-slate-700'>
            {output}
          </pre>
        )}
        
        {!isLoading && !output && !error && (
          <div className='text-slate-400 text-sm italic'>Click "Run" to execute and see output</div>
        )}
      </div>
    </div>
  )
}

export default Output
