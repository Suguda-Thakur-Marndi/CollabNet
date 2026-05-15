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
  const hasJoined = useRef(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    if (hasJoined.current || !meetingEl.current) return;

    const roomID = getUrlParams().get('roomID') || randomID(5);
    const userName = getUrlParams().get('username') || `User-${randomID(3)}`;

    const myMeeting = async (element) => {
      hasJoined.current = true;
      const appID = parseInt(import.meta.env.VITE_ID);
      const serverSecret = import.meta.env.VITE_SERVER_SECREATE;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), userName);

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
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
        
        onUserUpdate: (users) => {
          users.forEach(user => {
            if (user.userID === zp.getLocalUser().userID) {
              setIsMicOn(user.microphone);
              setIsCameraOn(user.camera);
            }
          });
        },
      });

      // Set initial state
      setIsMicOn(zp.isMicrophoneOn());
      setIsCameraOn(zp.isCameraOn());
    };

    myMeeting(meetingEl.current);

  }, []);

  const toggleMic = () => {
    const zp = ZegoUIKitPrebuilt.create(ZegoUIKitPrebuilt.generateKitTokenForTest(parseInt(import.meta.env.VITE_ID), import.meta.env.VITE_SERVER_SECREATE, getUrlParams().get('roomID') || 'defaultRoom', randomID(5), getUrlParams().get('username') || `User-${randomID(3)}`));
    if (isMicOn) {
      zp.turnMicrophoneOn(false);
    } else {
      zp.turnMicrophoneOn(true);
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    const zp = ZegoUIKitPrebuilt.create(ZegoUIKitPrebuilt.generateKitTokenForTest(parseInt(import.meta.env.VITE_ID), import.meta.env.VITE_SERVER_SECREATE, getUrlParams().get('roomID') || 'defaultRoom', randomID(5), getUrlParams().get('username') || `User-${randomID(3)}`));
    if (isCameraOn) {
      zp.turnCameraOn(false);
    } else {
      zp.turnCameraOn(true);
    }
    setIsCameraOn(!isCameraOn);
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
        <button onClick={toggleCamera} className={`p-2 rounded-lg ${isCameraOn ? 'bg-blue-600' : 'bg-red-600'}`}>
          {isCameraOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 00-2 2v3.586l2.707-2.707A1 1 0 0116 9.586V11a1 1 0 01-1.447.894L12 11.414V14a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <button onClick={toggleMic} className={`p-2 rounded-lg ${isMicOn ? 'bg-blue-600' : 'bg-red-600'}`}>
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
        <button className="p-2 rounded-lg bg-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoConference;
