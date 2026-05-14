const TopBar = ({ onLeaveRoom, onRunCode, userName }) => {
  return (
    <div className='w-full bg-slate-900 text-slate-100 flex items-center justify-between px-6 py-3 border-b border-slate-800 shadow-sm'>
      <div className='flex items-center gap-4'>
        <h1 className='text-lg font-bold text-white'>CollabNet</h1>
        <div className='h-6 w-px bg-slate-700'></div>
        <span className='text-sm text-slate-400'>User: <span className='text-white font-medium'>{userName}</span></span>
      </div>

      <div className='flex gap-2'>
        <button 
          onClick={onRunCode}
          className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white'>
          <span>▶</span> Run
        </button>
        <button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white'>
          <span>↗</span> Share
        </button>
        <button 
          onClick={onLeaveRoom}
          className='flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white'
        >
          <span>✕</span> Leave
        </button>
      </div>
    </div>
  )
}

export default TopBar
