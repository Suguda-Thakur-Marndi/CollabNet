const LeftPanel = ({ width, onDividerMouseDown }) => {
  return (
    <>
      <aside 
        className='h-full bg-slate-800 overflow-y-auto flex flex-col border-r border-slate-700'
        style={{ width: `${width}%` }}
      >
        <div className='p-4 border-b border-slate-700'>
          <h2 className='text-sm font-semibold text-white uppercase tracking-wide'>Files</h2>
        </div>
        <div className='flex-1 p-4 text-slate-400 text-sm'>
          <p>📁 Open files will appear here</p>
          <p className='mt-4 text-xs text-slate-500'>Start editing to see file structure</p>
        </div>
      </aside>

      <div
        className='w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors'
        onMouseDown={onDividerMouseDown}
      />
    </>
  )
}

export default LeftPanel
