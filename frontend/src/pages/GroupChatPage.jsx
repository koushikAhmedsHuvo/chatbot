// frontend/src/pages/GroupChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupMessages, sendGroupMessage } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

export default function GroupChatPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: () => getGroupMessages(groupId),
    enabled: !!groupId,
  });

  // Send message mutation
  const { mutate: sendMsg, isPending } = useMutation({
    mutationFn: sendGroupMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ["groupMessages", groupId],
        (old = []) => [...old, newMessage]
      );
      setMessage("");
    },
    onError: () => toast.error("Failed to send message"),
  });

  // Socket for real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_group", groupId);

    socket.on("new_group_message", (msg) => {
      queryClient.setQueryData(
        ["groupMessages", groupId],
        (old = []) => {
          if (old.some(m => m._id === msg._id)) return old;
          return [...old, msg];
        }
      );
    });

    return () => {
      socket.emit("leave_group", groupId);
      socket.off("new_group_message");
    };
  }, [socket, groupId, queryClient]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || isPending) return;
    sendMsg({ groupId, text: message });
  };

  // Generate call link and post to group
  const generateCallLink = async () => {
    setGeneratingLink(true);
    
    // Generate unique call ID (you can use groupId or create a unique one)
    const callId = groupId;
    const callLink = `${window.location.origin}/group-call/${callId}`;
    
    // Post the call link to group chat
    const callMessage = `🔴 **Group Call Started!** \n\nClick here to join: ${callLink}\n\nJoin the call to practice together! 🎥`;
    
    try {
      await sendMsg({ groupId, text: callMessage });
      toast.success("Call link posted to group!");
      
      // Also emit socket event for real-time notification
      if (socket) {
        socket.emit("group_call_started", { groupId, callLink, callerName: authUser?.fullName });
      }
    } catch (error) {
      toast.error("Failed to post call link");
    } finally {
      setGeneratingLink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <div className="p-3 border-b bg-base-200 flex justify-between items-center">
        <button onClick={() => navigate("/groups")} className="btn btn-ghost btn-sm">
          ← Back
        </button>
        <h1 className="font-bold text-lg">Group Chat</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={generateCallLink}
          disabled={generatingLink}
        >
          {generatingLink ? (
            <>
              <span className="loading loading-spinner loading-xs mr-1" />
              Generating...
            </>
          ) : (
            "🔴 Start Group Call"
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-base-content opacity-50 mt-10">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender?._id === authUser?._id;
            const isCallLink = msg.text?.includes("/group-call/");
            
            return (
              <div
                key={msg._id}
                className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              >
                {!isOwnMessage && (
                  <div className="chat-header text-xs opacity-70 mb-1">
                    {msg.sender?.fullName}
                  </div>
                )}
                <div className={`chat-bubble ${isOwnMessage ? "chat-bubble-primary" : "chat-bubble-secondary"} ${isCallLink ? "bg-primary/20 border border-primary" : ""}`}>
                  {isCallLink ? (
                    <div className="space-y-2">
                      <div className="font-bold text-primary">🔴 Live Group Call!</div>
                      <p>{msg.text.split("\n\n")[0]}</p>
                      <a 
                        href={msg.text.match(/https?:\/\/[^\s]+/g)?.[0]} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          const link = msg.text.match(/https?:\/\/[^\s]+/g)?.[0];
                          if (link) window.location.href = link;
                        }}
                      >
                        🎥 Join Call
                      </a>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="btn btn-success" disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}