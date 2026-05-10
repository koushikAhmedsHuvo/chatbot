// frontend/src/pages/HomePage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api";
import { Link } from "react-router-dom";
import { FaUserPlus, FaUserCheck, FaUserFriends, FaMapMarkerAlt, FaLanguage } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import toast from "react-hot-toast";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_, userId) => {
      setOutgoingRequestsIds((prev) => new Set([...prev, userId]));
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      toast.success("Friend request sent!");
    },
    onError: () => toast.error("Failed to send request"),
  });

  useEffect(() => {
    if (!outgoingFriendReqs.length) {
      setOutgoingRequestsIds(new Set());
      return;
    }
    const ids = new Set(outgoingFriendReqs.map((req) => req.recipient?._id));
    setOutgoingRequestsIds(ids);
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="hero rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 p-6 mb-8">
          <div className="hero-content text-center p-0">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back! 👋</h1>
              <p className="text-base-content/70 mt-2">Continue your language learning journey</p>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaUserFriends className="size-7 text-primary" />
              <h2 className="text-2xl font-bold">Your Friends</h2>
              <span className="badge badge-primary badge-lg">{friends.length}</span>
            </div>
            <Link to="/notifications" className="btn btn-outline btn-sm gap-2">
              <IoMdTime />
              Friend Requests
            </Link>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : friends.length === 0 ? (
            <div className="card bg-base-200 shadow-xl text-center p-12">
              <FaUserFriends className="size-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
              <p className="text-base-content/70">Connect with language partners below to start practicing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {friends.map((friend) => (
                <div key={friend._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="card-body p-5">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring ring-primary/20">
                          <img src={friend.profilePicture} alt={friend.fullName} className="object-cover" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg truncate">{friend.fullName}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="badge badge-sm badge-secondary">Native: {friend.nativeLanguage}</span>
                          <span className="badge badge-sm badge-outline">Learning: {friend.learningLanguage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-3">
                      <Link to={`/chat/${friend._id}`} className="btn btn-primary btn-sm w-full gap-2">
                        <FaUserCheck />
                        Message
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FaUserPlus className="size-7 text-secondary" />
            <h2 className="text-2xl font-bold">Meet New Learners</h2>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 shadow-xl text-center p-12">
              <p className="text-base-content/70">No recommendations available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommendedUsers.map((user) => {
                const hasSent = outgoingRequestsIds.has(user._id);
                return (
                  <div key={user._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="card-body p-5">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-full ring ring-secondary/20">
                            <img src={user.profilePicture} alt={user.fullName} className="object-cover" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg truncate">{user.fullName}</h3>
                          <div className="flex items-center gap-1 text-xs text-base-content/60 mt-1">
                            <FaMapMarkerAlt className="size-3" />
                            <span>{user.location || "Location not set"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="badge badge-sm badge-secondary">Native: {user.nativeLanguage}</span>
                        <span className="badge badge-sm badge-outline">Learning: {user.learningLanguage}</span>
                      </div>
                      {user.bio && (
                        <p className="text-xs text-base-content/60 mt-2 line-clamp-2">{user.bio}</p>
                      )}
                      <div className="card-actions justify-end mt-3">
                        <button
                          className={`btn btn-sm w-full gap-2 ${hasSent ? 'btn-disabled' : 'btn-secondary'}`}
                          disabled={hasSent || isPending}
                          onClick={() => sendRequestMutation(user._id)}
                        >
                          {hasSent ? (
                            <>
                              <MdCheckCircle />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <FaUserPlus />
                              Connect
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;