// frontend/src/pages/GroupsPage.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyGroups, createGroup, searchUsers } from "../lib/api";
import { useState } from "react";
import { FaPlus, FaUsers, FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";

export default function GroupsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: getMyGroups,
    retry: 1,
  });

  const { mutate: createGroupMutation, isPending } = useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      toast.success(`Group "${data.group.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateModal(false);
      setGroupName("");
      setSelectedMembers([]);
      setSearchQuery("");
      setSearchResults([]);
    },
    onError: (error) => {
      console.error("Create group error:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  const searchUsersDebounced = debounce(async (query) => {
    if (query.length >= 2) {
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, 500);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsersDebounced(query);
  };

  const handleAddMember = (user) => {
    if (!selectedMembers.find(m => m._id === user._id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    createGroupMutation({
      name: groupName,
      memberIds: selectedMembers.map(m => m._id),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="alert alert-error">
          <span>Failed to load groups: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus className="mr-2" />
            Create Group
          </button>
        </div>

        {/* GROUPS LIST */}
        {groups.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center">
            <FaUsers className="size-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No groups yet</h3>
            <p className="text-base-content opacity-70 mb-4">
              Create a group to start chatting with multiple friends at once!
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group._id}
                className="card bg-base-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/groups/${group._id}`)}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-lg">{group.name}</h2>
                      <p className="text-sm opacity-70">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                    <div className="avatar-group -space-x-3">
                      {(group.members || []).slice(0, 4).map((member) => (
                        <div key={member._id} className="avatar">
                          <div className="w-8 rounded-full">
                            <img src={member.profilePicture} alt={member.fullName} />
                          </div>
                        </div>
                      ))}
                      {(group.members || []).length > 4 && (
                        <div className="avatar placeholder">
                          <div className="w-8 rounded-full bg-neutral text-neutral-content text-xs">
                            <span>+{(group.members || []).length - 4}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Create New Group</h3>
            
            {/* Group Name */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Group Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                autoFocus
              />
            </div>

            {/* Add Members */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Add Members (Optional)</span>
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content opacity-50" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search users to add..."
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-[calc(100%-2rem)] bg-base-100 shadow-lg rounded-box border">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="p-2 hover:bg-base-200 cursor-pointer flex items-center gap-3"
                      onClick={() => handleAddMember(user)}
                    >
                      <img src={user.profilePicture} className="w-8 h-8 rounded-full" />
                      <span>{user.fullName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Selected Members ({selectedMembers.length})</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-base-300 rounded-lg">
                  {selectedMembers.map((member) => (
                    <div key={member._id} className="badge badge-primary gap-2 p-3">
                      <img src={member.profilePicture} className="w-4 h-4 rounded-full" />
                      {member.fullName}
                      <button
                        className="btn btn-xs btn-circle btn-ghost"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}