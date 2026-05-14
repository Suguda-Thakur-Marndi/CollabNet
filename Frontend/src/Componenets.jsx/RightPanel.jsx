const RightPanel = ({ users, width, onDividerMouseDown }) => {
  return (
    <>
      <div
        className='w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors'
        onMouseDown={onDividerMouseDown}
      />
      
      <aside 
        className='h-full bg-slate-800 overflow-y-auto flex flex-col border-l border-slate-700'
        style={{ width: `${width}%` }}
      >
        <div className='p-4 border-b border-slate-700'>
          <h2 className='text-sm font-semibold text-white uppercase tracking-wide'>Participants</h2>
          <span className='text-xs text-slate-400 mt-1 block'>{users.length} online</span>
        </div>
        <ul className='flex-1 p-4 space-y-2 overflow-y-auto'>
          {users.length > 0 ? (
            users.map(({ username }, index) => (
              <li key={index} className='flex items-center gap-2 px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-700 transition'>
                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                <span className='text-sm text-slate-100 font-medium truncate'>{username}</span>
              </li>
            ))
          ) : (
            <li className='text-slate-400 text-sm p-3'>No other users online</li>
          )}
        </ul>
      </aside>
    </>
  )
}

export default RightPanel
