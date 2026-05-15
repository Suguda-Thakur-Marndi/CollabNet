import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const Room = ({ onJoin, onCreate }) => {
  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = () => {
    if (createName.trim()) {
      const newRoomId = uuidv4();
      onCreate(createName, newRoomId);
    }
  };

  const handleJoinRoom = () => {
    if (joinName.trim() && roomId.trim()) {
      onJoin(joinName, roomId);
    }
  };

  return (
    <main className='h-screen w-full bg-gradient-to-br from-purple-900 to-slate-950 flex items-center justify-center'>
      <div className='w-full max-w-md px-6 space-y-8'>
        
        <div className='bg-slate-900/50 p-6 rounded-lg'>
          <h2 className='text-2xl font-bold text-white mb-4'>Create a Room</h2>
          <div className='space-y-4'>
            <div>
              <label htmlFor='create-name' className='text-sm font-medium text-slate-300 mb-1 block'>Name</label>
              <input
                id='create-name'
                className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                type='text'
                placeholder='Enter your name'
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center'
              onClick={handleCreateRoom}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Room
            </button>
          </div>
        </div>

        {/* Join Room Section */}
        <div className='bg-slate-900/50 p-6 rounded-lg'>
          <h2 className='text-2xl font-bold text-white mb-4'>Join a Room</h2>
          <div className='space-y-4'>
            <div>
              <label htmlFor='room-id' className='text-sm font-medium text-slate-300 mb-1 block'>Room ID</label>
              <input
                id='room-id'
                className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                type='text'
                placeholder='XXXX-XXXX'
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='join-name' className='text-sm font-medium text-slate-300 mb-1 block'>Name</label>
              <input
                id='join-name'
                className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
                type='text'
                placeholder='Enter your name'
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <button
              className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center'
              onClick={handleJoinRoom}
            >
              Join Room
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Room;
