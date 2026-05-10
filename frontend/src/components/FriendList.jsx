import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";

export default function FriendList() {
  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!socket) return;
    socket.on("user_online", (userId) => setOnlineUsers((prev) => new Set(prev).add(userId)));
    socket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });
    return () => {
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {friends.map((friend) => (
        <div key={friend._id} className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img src={friend.profilePicture} alt={friend.fullName} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{friend.fullName}</h3>
                <p className="text-sm opacity-70">
                  {onlineUsers.has(friend._id) ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-sm btn-primary">Message</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}