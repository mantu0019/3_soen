import { useParams } from "react-router";
import { api } from "../../../app/api";
import {
  RiAddLargeFill,
  RiCloseLargeLine,
  RiGroupFill,
  RiSendPlaneFill,
  RiUserFill,
  RiCheckLine,
} from "react-icons/ri";

import Markdown from "markdown-to-jsx";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useProject } from "../hook/useProject";

import { initializeSocket, sendMessage } from "../../../config/socket";
import { getWebContainer } from "../../../config/webContainer";

const getId = (user) => {
  return typeof user === "string" ? user : (user?._id ?? user?.id);
};

// ================= FILE TREE HELPERS =================

// Supports: "x": "code" | { contents } | { file: { contents } }
const getFileContents = (file) => {
  if (typeof file === "string") return file;

  const contents = file?.contents ?? file?.file?.contents ?? "";

  return typeof contents === "string"
    ? contents
    : JSON.stringify(contents, null, 2);
};

// Converts any nested tree into a flat { "path/file.js": { contents } } map
const flattenFileTree = (tree, prefix = "") => {
  const result = {};

  if (!tree || typeof tree !== "object") return result;

  Object.entries(tree).forEach(([name, node]) => {
    const path = prefix ? `${prefix}/${name}` : name;

    if (typeof node === "string") {
      result[path] = { contents: node };
      return;
    }

    if (!node || typeof node !== "object") return;

    if (node.file || "contents" in node) {
      result[path] = { contents: getFileContents(node) };
    } else if (node.directory) {
      Object.assign(result, flattenFileTree(node.directory, path));
    } else {
      Object.assign(result, flattenFileTree(node, path));
    }
  });

  return result;
};

// Socket message can be an object OR a JSON string (maybe with ``` fences)
const parseSocketMessage = (raw) => {
  if (raw && typeof raw === "object") return raw;

  if (typeof raw !== "string") return null;

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!cleaned.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

// { mainItem: "npm", commands: ["install"] } -> "npm install"
const formatCommand = (cmd) => {
  if (!cmd || typeof cmd !== "object" || !cmd.mainItem) return null;

  return `${cmd.mainItem} ${(cmd.commands || []).join(" ")}`.trim();
};

const DetailProject = () => {
  const { projectId } = useParams();

  const { allUserData, getMeByUser } = useAuth();

  const { addUserInCollaborator, removeProjectByUser } = useProject();

  // ================= STATES =================

  const [isSlidePanel, setIsSlidePanel] = useState(false);
  const [isCollaboratorModal, setIsCollaboratorModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [removeUserIds, setRemoveUserIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFile, setOpenFile] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [commands, setCommands] = useState({ build: null, start: null });

  const msgRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const webContainerStartedRef = useRef(false);

  // ================= CURRENT USER =================

  useEffect(() => {
    let isMounted = true;

    const getCurrentUser = async () => {
      try {
        const res = await getMeByUser();

        const userId = res?.userDetail?._id;

        if (userId && isMounted) {
          const id = String(userId);

          setCurrentUserId(id);
          currentUserIdRef.current = id;
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };

    getCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [getMeByUser]);

  // ================= GET ALL USERS =================

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await allUserData();

        setUsers(res?.getAllUser || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    getData();
  }, [allUserData]);

  // ================= WEB CONTAINER (boot only once) =================

  useEffect(() => {
    if (webContainerStartedRef.current) return;

    webContainerStartedRef.current = true;

    getWebContainer()
      .then((container) => {
        setWebContainer(container);
        console.log("container started", container);
      })
      .catch((error) => {
        console.error("WebContainer failed:", error);
      });
  }, []);

  // ================= APPEND MESSAGE =================

  const appendIncomingMessage = (msgObj) => {
    if (!msgObj?.message) {
      console.log("Invalid message:", msgObj);
      return;
    }

    setMessages((prevMessages) => [...prevMessages, msgObj]);
  };

  // ================= SOCKET CONNECTION =================

  useEffect(() => {
    if (!projectId) return;

    const socket = initializeSocket(projectId);

    if (!socket) {
      console.error("Socket initialization failed");
      return;
    }

    const handleMessage = (data) => {
      console.log("socket data:", data);

      if (!data?.message) {
        console.log("Invalid socket payload:", data);
        return;
      }

      const parsed = parseSocketMessage(data.message);

      // 1) Normal text message (like "hello")
      if (!parsed) {
        appendIncomingMessage({
          ...data,
          message:
            typeof data.message === "string"
              ? data.message
              : String(data.message),
        });
        return;
      }

      const isAIResponse = "text" in parsed || "files" in parsed;

      // 2) JSON, but not AI format -> show as code block
      if (!isAIResponse) {
        appendIncomingMessage({
          ...data,
          message: "```json\n" + JSON.stringify(parsed, null, 2) + "\n```",
        });
        return;
      }

      // 3) AI response -> update file tree
      const flatFiles = flattenFileTree(parsed.files);
      const fileNames = Object.keys(flatFiles);

      if (fileNames.length > 0) {
        setFileTree((prev) => ({ ...prev, ...flatFiles }));

        // Open ALL generated files as tabs, show the first one
        setCurrentFile(fileNames[0]);
        setOpenFile((prev) => [
          ...prev,
          ...fileNames.filter((name) => !prev.includes(name)),
        ]);
      }

      const buildCmd = formatCommand(parsed.buildCommand);
      const startCmd = formatCommand(parsed.startCommand);

      if (buildCmd || startCmd) {
        setCommands({ build: buildCmd, start: startCmd });
      }

      // Full chat message: text + files + commands
      const parts = [];

      if (typeof parsed.text === "string" && parsed.text.trim()) {
        parts.push(parsed.text);
      }

      if (fileNames.length > 0) {
        parts.push(
          "**Files:**\n" + fileNames.map((name) => `- \`${name}\``).join("\n"),
        );
      }

      if (buildCmd) parts.push(`**Build:** \`${buildCmd}\``);
      if (startCmd) parts.push(`**Start:** \`${startCmd}\``);

      if (parts.length > 0) {
        appendIncomingMessage({ ...data, message: parts.join("\n\n") });
      }
    };

    socket.on("project-message", handleMessage);

    return () => {
      socket.off("project-message", handleMessage);

      socket.disconnect();
    };
  }, [projectId]);

  // ================= AUTO SCROLL =================

  useEffect(() => {
    const msgBox = msgRef.current;

    if (!msgBox) return;

    msgBox.scrollTop = msgBox.scrollHeight;
  }, [messages]);

  // ================= FETCH PROJECT =================

  useEffect(() => {
    if (!projectId || users.length === 0) return;

    const getProjectById = async () => {
      try {
        const res = await api.get(`/api/project/get-project/${projectId}`);

        const projectUsers = res?.data?.project?.user || [];

        const ids = projectUsers.map(getId).filter(Boolean).map(String);

        const matched = users.filter((user) =>
          ids.includes(String(getId(user))),
        );

        const populated = projectUsers.filter(
          (user) => typeof user === "object" && getId(user),
        );

        setCollaborators(matched.length > 0 ? matched : populated);
      } catch (error) {
        console.error("Get project failed:", error);
      }
    };

    getProjectById();
  }, [projectId, users]);

  // ================= SELECT COLLABORATOR =================

  const handleSelectUser = (user) => {
    const userId = getId(user);

    if (!userId) return;

    const normalizedId = String(userId);

    const alreadyCollaborator = collaborators.some(
      (collaborator) => String(getId(collaborator)) === normalizedId,
    );

    // Existing collaborator: mark for removal.
    if (alreadyCollaborator) {
      setRemoveUserIds((prev) =>
        prev.includes(normalizedId)
          ? prev.filter((id) => id !== normalizedId)
          : [...prev, normalizedId],
      );

      return;
    }

    // New collaborator: select or unselect.
    setSelectedUsers((prev) => {
      const alreadySelected = prev.some(
        (selectedUser) => String(getId(selectedUser)) === normalizedId,
      );

      if (alreadySelected) {
        return prev.filter(
          (selectedUser) => String(getId(selectedUser)) !== normalizedId,
        );
      }

      return [...prev, user];
    });
  };

  // ================= SAVE COLLABORATORS =================

  const handleSaveChanges = async () => {
    if (isSaving) return;

    if (!projectId) return;

    if (selectedUsers.length === 0 && removeUserIds.length === 0) {
      return;
    }

    try {
      setIsSaving(true);

      // ---------- ADD ----------

      if (selectedUsers.length > 0) {
        const userIds = selectedUsers.map(getId).filter(Boolean);

        await addUserInCollaborator({
          projectId,
          user: userIds,
        });

        setCollaborators((prev) => {
          const previousIds = prev.map(getId).filter(Boolean).map(String);

          const newUsers = selectedUsers.filter((selectedUser) => {
            const id = getId(selectedUser);

            return id && !previousIds.includes(String(id));
          });

          return [...prev, ...newUsers];
        });
      }

      // ---------- REMOVE ----------

      if (removeUserIds.length > 0) {
        await removeProjectByUser({
          projectId,
          user: removeUserIds,
        });

        setCollaborators((prev) =>
          prev.filter(
            (collaborator) =>
              !removeUserIds.includes(String(getId(collaborator))),
          ),
        );
      }

      closeCollaboratorModal();
    } catch (error) {
      console.error("Failed to update collaborators:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ================= SEND MESSAGE =================

  const sendMsg = async () => {
    const text = message.trim();

    if (!text || isSending) return;

    try {
      setIsSending(true);

      // Get current user ID.
      let userId = currentUserIdRef.current;

      if (!userId) {
        const res = await getMeByUser();

        userId = res?.userDetail?._id;

        if (!userId) {
          console.error("User ID not found");
          return;
        }

        userId = String(userId);

        currentUserIdRef.current = userId;
        setCurrentUserId(userId);
      }

      // Create message payload.
      const newMessage = {
        message: text,
        sender: String(userId),
      };

      appendIncomingMessage(newMessage);

      sendMessage("project-message", newMessage);

      setMessage("");
    } catch (error) {
      console.error("Message send failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  // ================= OPEN MODAL =================

  const openCollaboratorModal = () => {
    setSelectedUsers([]);
    setRemoveUserIds([]);
    setIsCollaboratorModal(true);
  };

  // ================= CLOSE MODAL =================

  const closeCollaboratorModal = () => {
    setSelectedUsers([]);
    setRemoveUserIds([]);
    setIsCollaboratorModal(false);
  };

  // ================= CHANGE DETECTION =================

  const hasChanges = selectedUsers.length > 0 || removeUserIds.length > 0;

  // ================= UI =================

  return (
    <>
      <main className="custom-scrollbar w-full h-screen bg-[#0B0D10] text-white flex overflow-hidden">
        {/* ================= LEFT CHAT PANEL ================= */}

        <div className="w-full md:w-[480px] lg:w-[30%] shrink-0 relative bg-[#0F1115] h-screen flex flex-col border-r border-[#24262D]">
          {/* HEADER */}

          <header className="bg-[#0F1115] px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between border-b border-[#24262D] shrink-0">
            <button
              className="text-sm sm:text-[15px] font-semibold flex gap-2 items-center justify-center text-white hover:text-[#F7FF72] active:scale-95 transition-all"
              onClick={openCollaboratorModal}
            >
              <RiAddLargeFill />

              <span>Add Collaborator</span>
            </button>

            <RiGroupFill
              onClick={() => setIsSlidePanel((prev) => !prev)}
              className="text-xl text-white cursor-pointer hover:text-[#F7FF72] active:scale-90 transition"
            />
          </header>

          {/* ================= CONVERSATION ================= */}

          <div className="conversation-area flex flex-col flex-1 min-h-0">
            {/* MESSAGE BOX */}

            <div
              ref={msgRef}
              className="msg-box flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 sm:p-4"
            >
              {messages.map((msg, index) => {
                const senderId = getId(msg.sender);

                const isSender =
                  currentUserId &&
                  senderId &&
                  String(senderId) === String(currentUserId);

                return (
                  <div
                    key={`${String(senderId || "user")}-${index}`}
                    className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-[90%] sm:max-w-[80%] break-words ${
                      isSender
                        ? "ml-auto bg-[#F7FF72] text-black"
                        : "mr-auto bg-[#15171D] text-white border border-[#24262D]"
                    }`}
                  >
                    <small
                      className={`text-xs ${
                        isSender ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {users.find(
                        (user) => String(getId(user)) === String(senderId),
                      )?.email ||
                        (typeof msg.sender === "object" && msg.sender?.email) ||
                        "You"}
                    </small>

                    <div className="mt-1 text-sm sm:text-base break-words">
                      <Markdown
                        options={{
                          overrides: {
                            pre: {
                              component: ({ children }) => (
                                <pre className="bg-[#0B0D10] text-green-300 p-3 rounded-lg my-2 overflow-x-auto text-xs sm:text-sm border border-[#24262D]">
                                  {children}
                                </pre>
                              ),
                            },

                            code: {
                              component: ({ children, className }) => (
                                <code
                                  className={`${className || ""} bg-black/30 px-1.5 py-0.5 rounded text-[13px]`}
                                >
                                  {children}
                                </code>
                              ),
                            },
                            a: {
                              props: {
                                className: "underline text-blue-400",
                                target: "_blank",
                                rel: "noopener noreferrer",
                              },
                            },
                            ul: { props: { className: "list-disc ml-5 my-1" } },
                            ol: {
                              props: { className: "list-decimal ml-5 my-1" },
                            },
                            h1: {
                              props: { className: "text-xl font-bold my-2" },
                            },
                            h2: {
                              props: { className: "text-lg font-bold my-2" },
                            },
                            h3: {
                              props: {
                                className: "text-base font-semibold my-2",
                              },
                            },
                            p: { props: { className: "my-1" } },
                          },
                        }}
                      >
                        {String(msg.message)}
                      </Markdown>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= INPUT FIELD ================= */}

            <div className="input-field flex items-center p-2 sm:p-3 gap-2 bg-[#0F1115] border-t border-[#24262D] shrink-0">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMsg();
                  }
                }}
                className="min-w-0 bg-[#15171D] text-white placeholder:text-gray-500 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full flex-1 outline-none border border-[#24262D] focus:border-[#F7FF72] transition text-sm sm:text-base"
                placeholder="Enter Your Message"
              />

              <button
                onClick={sendMsg}
                disabled={!message.trim() || isSending}
                className="shrink-0 flex items-center justify-center gap-1.5 bg-[#F7FF72] text-black font-semibold rounded-full px-3 sm:px-5 py-2.5 sm:py-3 disabled:opacity-50 active:scale-95 hover:opacity-90 transition"
              >
                <span className="hidden sm:inline">
                  {isSending ? "Sending..." : "Send"}
                </span>

                <RiSendPlaneFill />
              </button>
            </div>
          </div>

          {/* ================= COLLABORATOR SLIDE PANEL ================= */}

          <div
            className={`absolute top-0 left-0 w-full h-full bg-[#0F1115] flex flex-col transform transition-transform duration-500 ease-in-out z-20 ${
              isSlidePanel ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <header className="flex bg-[#15171D] items-center justify-between p-3 sm:p-4 border-b border-[#24262D] shrink-0">
              <h1 className="font-sans text-[22px] uppercase text-yellow-300 tracking-[2px] drop-shadow-sm">
                Collaborators
              </h1>

              <RiCloseLargeLine
                onClick={() => setIsSlidePanel(false)}
                className="text-2xl text-white cursor-pointer hover:bg-white hover:text-black rounded-full p-1 transition-all duration-300"
              />
            </header>

            <div className="flex flex-col overflow-y-auto">
              {collaborators.length === 0 ? (
                <p className="text-center text-gray-500 p-5">
                  No collaborators added
                </p>
              ) : (
                collaborators.map((user) => (
                  <div
                    key={getId(user)}
                    className="flex items-center gap-3 p-3 bg-[#15171D] border-b border-[#24262D] hover:bg-[#20232A] transition"
                  >
                    <span className="w-10 h-10 shrink-0 bg-[#20232A] flex items-center justify-center rounded-full">
                      <RiUserFill className="text-xl text-white" />
                    </span>

                    <div className="flex flex-col min-w-0">
                      <small className="text-gray-500 truncate">
                        {user?.email || ""}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="hidden md:flex flex-1 h-screen bg-[#131418] items-center justify-center">
          <div className="text-gray-300 text-sm flex w-full h-screen overflow-hidden">
            {/* FILE EXPLORER */}
            <div className="explorer w-[30%] min-w-[200px] max-w-[300px] bg-[#131418] border-r border-[#2a2b30] flex flex-col">
              {/* Explorer Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2b30]">
                <h2 className="text-xs font-bold tracking-[2px] uppercase text-[#F7FF72]">
                  Explorer
                </h2>
                <button
                  className=" text-xl text-white rounded active:scale-95 px-3.5 py-0.5 bg-red-400"
                  onClick={async () => {
                    console.log("Clicked....");
                      await webContainer.mount(fileTree)

                    const installProcess = await webContainer.spawn("npm", [
                      "install",
                    ]);
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log("chunk hai ", chunk);
                        },
                      }),
                    );
                   const runProcess = await webContainer.spawn("npm",["start"]);
                   runProcess.output.pipeTo(new WritableStream({
                    write(chunk){
                      console.log("chunk hai2",chunk)
                    }
                   }))




                  }}
                >
                  Run
                </button>
                <span className="text-xs text-gray-500">
                  {Object.keys(fileTree).length} Files
                </span>
              </div>

              {/* Files Heading */}
              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
                  Project Files
                </p>
              </div>

              {/* File List */}
              <div className="file-tree flex-1 overflow-y-auto px-2 pb-3">
                {Object.keys(fileTree).length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-600">
                    No files yet. Ask @ai to create a project.
                  </p>
                )}

                {Object.keys(fileTree).map((file) => (
                  <button
                    key={file}
                    onClick={() => {
                      setCurrentFile(file);

                      setOpenFile((prev) =>
                        prev.includes(file) ? prev : [...prev, file],
                      );
                    }}
                    className={`group flex items-center gap-3 w-full text-left px-3 py-2.5 mb-1 rounded-lg border transition-all duration-200 ${
                      currentFile === file
                        ? "bg-[#F7FF72]/10 text-[#F7FF72] border-[#F7FF72]/20 shadow-[inset_3px_0_0_#F7FF72]"
                        : "text-gray-400 border-transparent hover:bg-[#1c1d22] hover:text-gray-200"
                    }`}
                  >
                    {/* File Icon */}
                    <span
                      className={`text-sm transition-colors ${
                        currentFile === file
                          ? "text-[#F7FF72]"
                          : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    >
                      ◈
                    </span>

                    <span className="truncate text-[13px] font-medium">
                      {file}
                    </span>

                    {currentFile === file && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F7FF72] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Explorer Footer */}
              <div className="px-4 py-3 border-t border-[#2a2b30] flex flex-col gap-1.5">
                {commands.build && (
                  <p className="text-[11px] text-gray-500 truncate">
                    Build:{" "}
                    <code className="text-[#F7FF72]">{commands.build}</code>
                  </p>
                )}

                {commands.start && (
                  <p className="text-[11px] text-gray-500 truncate">
                    Start:{" "}
                    <code className="text-[#F7FF72]">{commands.start}</code>
                  </p>
                )}

                <p className="text-[11px] text-gray-600">
                  <span className="text-[#F7FF72]">●</span>{" "}
                  {webContainer ? "Workspace Ready" : "Starting workspace..."}
                </p>
              </div>
            </div>

            {/* FILE EDITOR */}
            <div className="file-editor bg-[#131418] flex-1 min-w-0 h-full flex flex-col overflow-hidden">
              {/* TOP TABS */}
              <div className="top flex items-center bg-[#17181d] border-b border-[#2a2b30] shrink-0 overflow-x-auto">
                {openFile.map((file) => (
                  <div
                    key={file}
                    onClick={() => setCurrentFile(file)}
                    className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-r border-[#2a2b30] border-t-2 transition-all duration-200 ${
                      currentFile === file
                        ? "bg-[#131418] text-[#F7FF72] border-t-[#F7FF72]"
                        : "bg-[#17181d] text-gray-500 border-t-transparent hover:bg-[#1c1d22] hover:text-gray-300"
                    }`}
                  >
                    <span className="text-xs text-[#F7FF72]">◈</span>

                    <span className="text-[13px] whitespace-nowrap">
                      {file}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        const updatedFiles = openFile.filter(
                          (item) => item !== file,
                        );

                        setOpenFile(updatedFiles);

                        if (currentFile === file) {
                          setCurrentFile(
                            updatedFiles.length > 0
                              ? updatedFiles[updatedFiles.length - 1]
                              : null,
                          );
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-md text-gray-600 hover:bg-[#2a2b30] hover:text-[#F7FF72] transition-colors"
                      title="Close file"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Empty Tabs Message */}
                {openFile.length === 0 && (
                  <div className="px-5 py-3 text-xs text-gray-600">
                    No files open
                  </div>
                )}
              </div>

              {/* EDITOR INFO BAR */}
              <div className="flex items-center justify-between px-5 py-2 bg-[#131418] border-b border-[#222329] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#F7FF72] text-xs">◈</span>

                  <span className="text-xs text-gray-400 truncate">
                    {currentFile || "No file selected"}
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-widest text-gray-600">
                  Editor
                </span>
              </div>

              {/* CODE EDITOR */}
              <div className="flex-1 min-h-0 overflow-auto p-5 bg-[#131418]">
                {currentFile && fileTree[currentFile] ? (
                  <pre className="text-[#d4d4d4] text-[13px] leading-7 font-mono whitespace-pre-wrap break-words">
                    <code>{getFileContents(fileTree[currentFile])}</code>
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#F7FF72]/10 border border-[#F7FF72]/20 mb-5">
                      <span className="text-3xl text-[#F7FF72]">&lt;/&gt;</span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-300 mb-2">
                      Welcome to Code Editor
                    </h3>

                    <p className="text-xs text-gray-600 max-w-[250px] leading-6">
                      Select a file from the explorer to view its contents.
                    </p>

                    <div className="mt-5 px-4 py-2 rounded-lg bg-[#1b1c21] border border-[#2a2b30]">
                      <span className="text-xs capitalize text-[#F7FF72]">
                        create your project
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* STATUS BAR */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#17181d] border-t border-[#2a2b30] shrink-0">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="text-[#F7FF72]">● You Can Do It Man</span>
                </div>

                <span className="text-[10px] tracking-wider text-gray-600">
                  Create Your Project
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isCollaboratorModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={closeCollaboratorModal}
        >
          <div
            className="w-full max-w-md max-h-[90vh] bg-[#15171D] text-white rounded-2xl border border-[#292C34] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <header className="flex items-center justify-between p-4 sm:p-5 border-b border-[#292C34] shrink-0">
              <h2 className="text-lg sm:text-xl font-bold">
                Manage Collaborators
              </h2>

              <RiCloseLargeLine
                onClick={closeCollaboratorModal}
                className="text-2xl cursor-pointer text-gray-400 hover:text-white hover:bg-[#292C34] rounded-full p-1 transition"
              />
            </header>

            {/* USER LIST */}

            <div className="max-h-[55vh] sm:max-h-[400px] overflow-y-auto p-2">
              {users.map((user) => {
                const userId = getId(user);

                const normalizedId = String(userId);

                const isSelected = selectedUsers.some(
                  (selectedUser) =>
                    String(getId(selectedUser)) === normalizedId,
                );

                const isAlreadyCollaborator = collaborators.some(
                  (collaborator) =>
                    String(getId(collaborator)) === normalizedId,
                );

                const isMarkedForRemove = removeUserIds.includes(normalizedId);

                return (
                  <div
                    key={normalizedId}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl transition duration-200 cursor-pointer ${
                      isAlreadyCollaborator
                        ? isMarkedForRemove
                          ? "bg-red-500/10 border border-red-500/40"
                          : "bg-[#20232A]"
                        : isSelected
                          ? "bg-[#F7FF72] text-black"
                          : "hover:bg-[#20232A]"
                    }`}
                  >
                    {/* USER INFO */}

                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-black/10" : "bg-[#20232A]"
                        }`}
                      >
                        <RiUserFill className="text-xl" />
                      </span>

                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">
                          {user?.username}
                        </span>

                        <small
                          className={`truncate ${
                            isSelected ? "text-black/60" : "text-gray-500"
                          }`}
                        >
                          {user?.email}
                        </small>
                      </div>
                    </div>

                    {/* STATUS */}

                    {isAlreadyCollaborator ? (
                      <span
                        className={`text-xs whitespace-nowrap ${
                          isMarkedForRemove ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {isMarkedForRemove ? "Will be removed" : "Added"}
                      </span>
                    ) : (
                      isSelected && (
                        <span className="w-7 h-7 shrink-0 rounded-full bg-black text-[#F7FF72] flex items-center justify-center">
                          <RiCheckLine />
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* MODAL FOOTER */}

            <footer className="border-t border-[#292C34] p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs sm:text-sm text-gray-500">
                {selectedUsers.length} to add
                {removeUserIds.length > 0 &&
                  `, ${removeUserIds.length} to remove`}
              </span>

              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
                className="bg-[#F7FF72] text-black font-semibold text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 hover:opacity-90 transition whitespace-nowrap"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailProject;
