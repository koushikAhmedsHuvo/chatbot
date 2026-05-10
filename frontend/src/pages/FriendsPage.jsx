import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FaMessage, FaUserPlus } from "react-icons/fa6";

const FriendsPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!socket) return;

    socket.on("user_online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="card bg-base-200 p-6 text-center">
        <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
        <p className="text-base-content opacity-70">
          Connect with language partners below to start practicing together!
        </p>
        <Link to="/" className="btn btn-primary mt-4">
          <FaUserPlus className="mr-2" />
          Find Friends
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Friends</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {friends.map((friend) => (
            <div key={friend._id} className="card bg-base-200 shadow-md hover:shadow-lg transition">
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img src={friend.profilePicture} alt={friend.fullName} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{friend.fullName}</h3>
                    <p className="text-sm flex items-center gap-1">
                      {onlineUsers.has(friend._id) ? (
                        <>
                          <span className="size-2 rounded-full bg-success inline-block" />
                          <span className="text-success">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="size-2 rounded-full bg-gray-400 inline-block" />
                          <span className="opacity-70">Offline</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-secondary badge-sm">
                    Native: {friend.nativeLanguage}
                  </span>
                  <span className="badge badge-outline badge-sm">
                    Learning: {friend.learningLanguage}
                  </span>
                </div>
                <div className="card-actions justify-end mt-3">
                  <Link to={`/chat/${friend._id}`} className="btn btn-primary btn-sm">
                    <FaMessage className="mr-1" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;