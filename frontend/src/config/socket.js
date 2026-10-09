import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  socketInstance = socket(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
    query:{
        projectId:projectId
    }
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  socketInstance.emit(eventName, cb);
    };
export const sendMessage = (eventName, data) => {
  socketInstance.emit(eventName, data);
};
