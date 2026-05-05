const TopBar = ({ onLeaveRoom }) => {
  return (
    <div className='w-full bg-gray-800 text-white flex items-center justify-between px-4 py-2 border-b border-gray-700'>
      
      <div className='flex gap-6 text-sm'>
        <div className='hover:bg-gray-700 px-2 py-1 cursor-pointer rounded'>File</div>
        <div className='hover:bg-gray-700 px-2 py-1 cursor-pointer rounded'>Edit</div>
        <div className='hover:bg-gray-700 px-2 py-1 cursor-pointer rounded'>Selection</div>
        <div className='hover:bg-gray-700 px-2 py-1 cursor-pointer rounded'>View</div>
        <div className='hover:bg-gray-700 px-2 py-1 cursor-pointer rounded'>Help</div>
      </div>

      <div className='flex gap-3'>
        <button className='flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition'>
          ▷ Run Code
        </button>
        <button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition'>
          Share
        </button>
        <button 
          onClick={onLeaveRoom}
          className='flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition'
        >
          Leave room
        </button>
      </div>
    </div>
  )
}

export default TopBar
