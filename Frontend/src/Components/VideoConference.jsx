import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useRef, useState } from 'react';

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

const VideoConference = () => {
  const meetingEl = useRef(null);
  const zpRef = useRef(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    if (zpRef.current || !meetingEl.current) return;

    const roomID = getUrlParams().get('room') || randomID(5);
    const userName = getUrlParams().get('username') || `User-${randomID(3)}`;
    const userID = randomID(5);

    const myMeeting = async (element) => {
      const appID = parseInt(import.meta.env.VITE_ID);
      const serverSecret = import.meta.env.VITE_SERVER_SECREATE;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;
      
      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        showRoomTimer: true,
        showLeavingDialog: false,
        showUserList: false,
        showChatTool: false,
        showMyCameraToggleButton: false,
        showMyMicrophoneToggleButton: false,
        showAudioVideoSettingsButton: false,
        showScreenSharingButton: false,
        showTurnOffRemoteCameraButton: false,
        showTurnOffRemoteMicrophoneButton: false,
        showRemoveUserButton: false,
        onUserUpdate: () => {
            const localUser = zp.getLocalUser();
            if (localUser) {
                setIsMicOn(localUser.microphone);
                setIsCameraOn(localUser.camera);
            }
        },
      });

      const localUser = zp.getLocalUser();
      if (localUser) {
        setIsMicOn(localUser.microphone);
        setIsCameraOn(localUser.camera);
      }
    };

    myMeeting(meetingEl.current);

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, []);

  const toggleMic = () => {
    const zp = zpRef.current;
    if (zp) {
      if (isMicOn) {
        zp.turnMicrophoneOn(false);
        setIsMicOn(false);
      } else {
        zp.turnMicrophoneOn(true);
        setIsMicOn(true);
      }
    }
  };

  const toggleCamera = () => {
    const zp = zpRef.current;
    if (zp) {
      if (isCameraOn) {
        zp.turnCameraOn(false);
        setIsCameraOn(false);
      } else {
        zp.turnCameraOn(true);
        setIsCameraOn(true);
      }
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col">
      <div className="flex-1 relative">
        <div
          className="myCallContainer w-full h-full"
          ref={meetingEl}
        ></div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
          <span className="text-white font-medium text-sm">
            {getUrlParams().get('username') || 'You'}
          </span>
        </div>
      </div>
      <div className="bg-slate-800 p-2 flex justify-center items-center space-x-2">
        <button onClick={toggleCamera} className={`p-2 rounded-full transition-colors ${isCameraOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
          {isCameraOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 00-2 2v3.586l2.707-2.707A1 1 0 0116 9.586V11a1 1 0 01-1.447.894L12 11.414V14a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 12.586l4.293-4.293a1 1 0 111.414 1.414L11.414 14l4.293 4.293a1 1 0 01-1.414 1.414L10 15.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 14 4.293 9.707a1 1 0 011.414-1.414L10 12.586zM3.707 3.293a1 1 0 011.414 0L10 8.586l4.879-4.879a1 1 0 111.414 1.414L11.414 10l4.879 4.879a1 1 0 01-1.414 1.414L10 11.414l-4.879 4.879a1 1 0 01-1.414-1.414L8.586 10 3.707 5.121a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <button onClick={toggleMic} className={`p-2 rounded-full transition-colors ${isMicOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
          {isMicOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
              <path fillRule="evenodd" d="M5.5 10.5A.5.5 0 016 10h8a.5.5 0 010 1H6a.5.5 0 01-.5-.5z" clipRule="evenodd" />
              <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm-1.466 5.966a.5.5 0 01.707 0L10 13.707l3.759-3.74a.5.5 0 01.707.707L10.707 14.414l3.76 3.74a.5.5 0 11-.707.707L10 15.121l-3.759 3.74a.5.5 0 11-.707-.707L9.293 14.414l-3.76-3.74a.5.5 0 010-.707z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoConference;
