import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.log("Error in getAuthUser", error);
    return null;
  }
};

export const completedOnboarding = async (userData) => {
  const res = await axiosInstance.post("/auth/onboarding", userData);
  return res.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-request");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`,
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export const getGroupMessages = (groupId) => axiosInstance.get(`/groups/${groupId}/messages`).then(res => res.data);
export const sendGroupMessage = ({ groupId, text }) => axiosInstance.post(`/groups/${groupId}/messages`, { text }).then(res => res.data);
export const searchUsers = (query) => axiosInstance.get(`/search/users?q=${query}`).then(res => res.data);



// frontend/src/lib/api.js
export const chatWithMentor = async ({ message, mode = "general", aiProvider = "auto" }) => {
  const response = await axiosInstance.post("/ai/mentor", { 
    message, 
    mode, 
    aiProvider 
  });
  return response.data;
};


// Replace these two functions:

export const createGroup = async ({ name, memberIds = [] }) => {
  try {
    const response = await axiosInstance.post("/groups", { 
      name, 
      memberIds 
    });
    return response.data;
  } catch (error) {
    console.error("Create group error:", error.response?.data || error.message);
    throw error;
  }
};

export const getMyGroups = async () => {
  try {
    const response = await axiosInstance.get("/groups");
    return response.data;
  } catch (error) {
    console.error("Get groups error:", error.response?.data || error.message);
    return [];
  }
};