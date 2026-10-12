import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (socketInstance) {
        socketInstance.disconnect();
    }

    socketInstance = io(import.meta.env.VITE_API_BASE_URL, {
        withCredentials: true,
        query: {
            projectId,
        },
    });

    return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
    if (!socketInstance) return;

    socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
    if (!socketInstance) return;

    socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};