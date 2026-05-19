import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export function Terminal({ socket }) {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!socket) {
      console.log('Socket not available yet')
      return
    }

    console.log('Terminal: Socket is available, initializing terminal')

    // Initialize terminal
    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
      rows: 24,
      cols: 80,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    // Mount terminal
    if (terminalRef.current) {
      term.open(terminalRef.current)
      fitAddon.fit()
      term.write('\r\n$ Welcome to Terminal\r\n$ ')
    }
    terminalInstanceRef.current = term
    setIsReady(true)

    console.log('Terminal initialized')

    socket.on('connect', () => {
      console.log('Socket connected in Terminal')
      term.write('\r\n$ Connected to server\r\n$ ')
    })

    socket.on('terminal:output', (data) => {
      console.log('Received terminal output:', data)
      term.write(data)
    })

    socket.on('disconnect', () => {
      term.write('\r\n$ Connection lost\r\n')
    })

    // Handle terminal input
    let commandBuffer = ''
    term.onData((data) => {
      if (data === '\r') {
        // Execute command
        console.log('Sending command:', commandBuffer)
        socket.emit('terminal:command', commandBuffer)
        commandBuffer = ''
        term.write('\r\n')
      } else if (data === '\x7f') {
        // Backspace
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1)
          term.write('\b \b')
        }
      } else if (data === '\x03') {
        // Ctrl+C
        commandBuffer = ''
        term.write('^C\r\n$ ')
      } else {
        // Regular character
        commandBuffer += data
        term.write(data)
      }
    })

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit()
      } catch (e) {
        console.log('Resize error:', e)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      console.log('Cleaning up Terminal')
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [socket])

  return (
    <div
      ref={terminalRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#1e1e1e',
      }}
    >
      {!isReady && <div style={{ color: '#d4d4d4', padding: '20px' }}>Initializing terminal...</div>}
    </div>
  )
}
