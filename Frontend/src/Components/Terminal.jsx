import { useEffect, useRef } from "react"
import { Terminal as XTermTerminal } from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"

export function Terminal({ buildOutput }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize xterm
    const term = new XTermTerminal({
      rows: 20,
      cols: 80,
      theme: {
        background: "#1e293b",
        foreground: "#e2e8f0",
        cursor: "#60a5fa",
        selection: "rgba(96, 165, 250, 0.3)",
      },
      fontFamily: "Courier New, monospace",
      fontSize: 13,
      lineHeight: 1.4,
    })

    term.open(terminalRef.current)
    xtermRef.current = term

    // Welcome message
    term.writeln("\r\n\x1B[36m> Build Terminal\x1B[0m")
    term.writeln("\x1B[90m> Waiting for build output...\x1B[0m\r\n")

    return () => {
      term.dispose()
    }
  }, [])

  // Handle new build output
  useEffect(() => {
    if (buildOutput && xtermRef.current) {
      xtermRef.current.writeln(buildOutput)
    }
  }, [buildOutput])

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 overflow-hidden rounded-lg">
      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
        <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Terminal</h3>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden"
      />
    </div>
  )
}
