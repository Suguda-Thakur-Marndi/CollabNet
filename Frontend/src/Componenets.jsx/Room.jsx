import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const Room = ({ onJoin, onCreate }) => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = () => {
    if (userName.trim()) {
      const newRoomId = uuidv4();
      onCreate(userName, newRoomId);
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim() && roomId.trim()) {
      onJoin(userName, roomId);
    }
  };

  return (
    <main className='h-screen w-full bg-slate-950 flex items-center justify-center'>
      <div className='w-full max-w-md px-6'>
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-white mb-2'>CollabNet</h1>
          <p className='text-slate-400'>Real-time collaborative code editor</p>
        </div>
        <div className='space-y-4'>
          <input
            className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
            type='text'
            placeholder='Enter your name'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoFocus
          />
          <div className='flex items-center space-x-2'>
            <input
              className='w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition'
              type='text'
              placeholder='Enter Room ID'
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button
              className='px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200'
              onClick={handleJoinRoom}
            >
              Join
            </button>
          </div>
          <div className='flex items-center justify-center'>
            <span className='text-slate-400'>OR</span>
          </div>
          <button
            className='w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200'
            onClick={handleCreateRoom}
          >
            Create New Room
          </button>
        </div>
      </div>
    </main>
  );
};

export default Room;
