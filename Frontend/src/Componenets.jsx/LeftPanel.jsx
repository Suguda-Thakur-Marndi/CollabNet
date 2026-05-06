const LeftPanel = ({ width, onDivider }) => {
  return (
    <>
      <aside 
        className='h-full rounded-lg bg-blue-900 overflow-y-auto'
        style={{ width: `${width}%` }}
      >
        <h2 className='text-2xl font-bold p-4 border-b text-white'>Files</h2>
        <div className='p-4 text-white'>File explorer here</div>
      </aside>

      <div
        className='w-1 bg-gray-600 hover:bg-green-500 cursor-col-resize transition-colors'
        on={onDivider}
      />
    </>
  )
}

export default LeftPanel
