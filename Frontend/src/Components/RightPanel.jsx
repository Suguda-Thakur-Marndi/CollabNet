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
      </aside>
    </>
  )
}

export default RightPanel;
