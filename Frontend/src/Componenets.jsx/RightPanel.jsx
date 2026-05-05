const RightPanel = ({ users, width, onDividerMouseDown }) => {
  return (
    <>
      <div
        className='w-1 bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors'
        onMouseDown={onDividerMouseDown}
      />
      
      <aside 
        className='h-full rounded-lg bg-amber-50 overflow-y-auto'
        style={{ width: `${width}%` }}
      >
        <h2 className='text-2xl font-bold p-4 border-b'>Users</h2>
        <ul>{users.map(({ username }, index) => (
          <li key={index}>{username}</li>
        ))}</ul>
      </aside>
    </>
  )
}

export default RightPanel
