// frontend/src/hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const token = getCookie("jwt");
    
    if (!token) {
      console.log("No token found - user may not be logged in");
      return;
    }

    if (socket && socket.connected) {
      setSocketInstance(socket);
      setIsConnected(true);
      return;
    }

    socket = io("http://localhost:5001", {
      auth: { token },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setSocketInstance(socket);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket: socketInstance, isConnected };
};