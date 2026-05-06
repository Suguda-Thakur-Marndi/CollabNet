const TopBar = ({ LeaveRoom }) => {
  return (
    <div className='w-full bg-gray-900 text-gray-100 flex items-center justify-between px-6 py-3 border-b border-gray-700 shadow-md'>
      
      <div className='flex gap-8 text-sm font-medium'>
        <button className='hover:text-white transition-colors duration-200'>File</button>
        <button className='hover:text-white transition-colors duration-200'>Edit</button>
        <button className='hover:text-white transition-colors duration-200'>Selection</button>
        <button className='hover:text-white transition-colors duration-200'>View</button>
        <button className='hover:text-white transition-colors duration-200'>Help</button>
      </div>

      <div className='flex gap-2'>
        <button className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200'>
          ▶ Run Code
        </button>
        <button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200'>
          Share
        </button>
        <button 
          onClick={LeaveRoom}
          className='flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200'
        >
          Leave
        </button>
      </div>
    </div>
  )
}

export default TopBar
