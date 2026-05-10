// frontend/src/pages/GroupCallPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

export default function GroupCallPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { authUser } = useAuthUser();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [callActive, setCallActive] = useState(true);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Get local media
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("Camera started");
        toast.success("Connected to call");
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Cannot access camera/microphone");
      }
    };
    startCamera();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Socket events for group call
  useEffect(() => {
    if (!socket || !groupId || !authUser) return;

    console.log("Joining call:", groupId);
    
    // Join call room
    socket.emit("join_group_call", { 
      groupId, 
      userId: authUser._id, 
      name: authUser.fullName 
    });

    // Listen for participants
    socket.on("participant_joined", ({ userId, name }) => {
      console.log("Participant joined:", name);
      setParticipants(prev => {
        if (prev.some(p => p.userId === userId)) return prev;
        return [...prev, { userId, name }];
      });
      toast.success(`${name} joined the call`);
    });

    socket.on("participant_left", (userId) => {
      const leavingUser = participants.find(p => p.userId === userId);
      if (leavingUser) {
        toast.info(`${leavingUser.name} left the call`);
      }
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    });

    return () => {
      socket.emit("leave_group_call", { groupId, userId: authUser._id });
      socket.off("participant_joined");
      socket.off("participant_left");
    };
  }, [socket, groupId, authUser]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.success(audioTrack.enabled ? "Mic unmuted" : "Mic muted");
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.success(videoTrack.enabled ? "Camera on" : "Camera off");
      }
    }
  };

  const endCall = () => {
    setCallActive(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(`/groups/${groupId}`);
    toast("Call ended");
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-3 border-b bg-base-200 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Group Call</h1>
          <p className="text-xs opacity-70">Room: {groupId}</p>
        </div>
        <div className="text-sm">
          {participants.length + 1} participant{participants.length !== 0 && "s"}
        </div>
        <button onClick={endCall} className="btn btn-error btn-sm">
          End Call
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Your video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
              You {isMuted && "🔇"} {isVideoOff && "📷 Off"}
            </div>
            <div className="absolute top-2 left-2 bg-green-500/80 px-2 py-0.5 rounded text-xs text-white">
              {isVideoOff ? "Camera Off" : "Live"}
            </div>
          </div>
          
          {/* Other participants */}
          {participants.map(p => (
            <div key={p.userId} className="bg-base-300 rounded-lg flex items-center justify-center aspect-video relative">
              <div className="text-center">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-20 h-20">
                    <span className="text-3xl">{p.name?.charAt(0) || "?"}</span>
                  </div>
                </div>
                <p className="mt-3 font-medium">{p.name}</p>
                <p className="text-xs text-success">Connected</p>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {participants.length === 0 && (
          <div className="text-center text-base-content opacity-50 mt-20">
            <p className="text-lg">Waiting for others to join...</p>
            <p className="text-sm mt-2">Share the call link in the group chat</p>
            <button 
              className="btn btn-outline btn-sm mt-4"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Call link copied!");
              }}
            >
              Copy Call Link
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t flex justify-center gap-4 bg-base-200">
        <button 
          onClick={toggleMute} 
          className={`btn rounded-full w-12 h-12 ${isMuted ? 'btn-error' : 'btn-success'}`}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button 
          onClick={toggleVideo} 
          className={`btn rounded-full w-12 h-12 ${isVideoOff ? 'btn-error' : 'btn-primary'}`}
        >
          {isVideoOff ? "📷" : "📹"}
        </button>
        <button 
          onClick={endCall} 
          className="btn btn-error rounded-full w-12 h-12"
        >
          📞
        </button>
      </div>
    </div>
  );
}