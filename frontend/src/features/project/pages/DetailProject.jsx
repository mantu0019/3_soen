  
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
import AiLoading from "../../../components/AiLoading";

const getId = (user) => {
  return typeof user === "string" ? user : (user?._id ?? user?.id);
};

 
 const getFileContents = (file) => {
  if (typeof file === "string") return file;

  const contents = file?.contents ?? file?.file?.contents ?? "";

  return typeof contents === "string"
    ? contents
    : JSON.stringify(contents, null, 2);
};

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

const formatCommand = (cmd) => {
  if (!cmd || typeof cmd !== "object" || !cmd.mainItem) return null;

  return `${cmd.mainItem} ${(cmd.commands || []).join(" ")}`.trim();
};

const DetailProject = () => {
  const { projectId } = useParams();

  const { allUserData, getMeByUser } = useAuth();

  const { addUserInCollaborator, removeProjectByUser } = useProject();

 //states
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
  const [aiLoading, setAiLoading] = useState(false);

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFile, setOpenFile] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [commands, setCommands] = useState({ build: null, start: null });
  const [isRunning, setIsRunning] = useState(false);
  const msgRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const webContainerStartedRef = useRef(false);
 const [iFrameUrl, setIFrameUrl] = useState(null)

 // current user
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

// get all user
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

 // web container
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

   useEffect(() => {
    if (!webContainer) return;

    const handleServerReady = (port, url) => {
      console.log(`WebContainer server ready on port ${port}:`, url);
      setIFrameUrl(url);
      setIsRunning(false);
    };

    webContainer.on("server-ready", handleServerReady);

    return () => {
      if (typeof webContainer.off === "function") {
        webContainer.off("server-ready", handleServerReady);
      }
    };
  }, [webContainer]);

 // append msg
  const appendIncomingMessage = (msgObj) => {
    if (!msgObj?.message) {
      console.log("Invalid message:", msgObj);
      return;
    }

    setMessages((prevMessages) => [...prevMessages, msgObj]);
  };

// socket connection
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

       if (isAIResponse) setAiLoading(false);

       if (!isAIResponse) {
        appendIncomingMessage({
          ...data,
          message: "```json\n" + JSON.stringify(parsed, null, 2) + "\n```",
        });
        return;
      }

       const flatFiles = flattenFileTree(parsed.files);
      const fileNames = Object.keys(flatFiles);

      if (fileNames.length > 0) {
        setFileTree((prev) => ({ ...prev, ...flatFiles }));

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

   
  useEffect(() => {
    const msgBox = msgRef.current;

    if (!msgBox) return;

    msgBox.scrollTop = msgBox.scrollHeight;
  }, [messages]);

 
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

   
  const handleSelectUser = (user) => {
    const userId = getId(user);

    if (!userId) return;

    const normalizedId = String(userId);

    const alreadyCollaborator = collaborators.some(
      (collaborator) => String(getId(collaborator)) === normalizedId,
    );

     if (alreadyCollaborator) {
      setRemoveUserIds((prev) =>
        prev.includes(normalizedId)
          ? prev.filter((id) => id !== normalizedId)
          : [...prev, normalizedId],
      );

      return;
    }

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

 
  const handleSaveChanges = async () => {
    if (isSaving) return;

    if (!projectId) return;

    if (selectedUsers.length === 0 && removeUserIds.length === 0) {
      return;
    }

    try {
      setIsSaving(true);

 
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

 
  const sendMsg = async () => {
    const text = message.trim();

    if (!text || isSending) return;

    try {
      setIsSending(true);

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

       const newMessage = {
        message: text,
        sender: String(userId),
      };

      appendIncomingMessage(newMessage);

       
      const isAIRequest = /(^|\s)@ai\b/i.test(text);
      if (isAIRequest) setAiLoading(true);

      sendMessage("project-message", newMessage);
      setMessage("");
    } catch (error) {
      setAiLoading(false);
      console.error("Message send failed:", error);
    } finally {
      setIsSending(false);
    }
  };

 
  const openCollaboratorModal = () => {
    setSelectedUsers([]);
    setRemoveUserIds([]);
    setIsCollaboratorModal(true);
  };

 
  const closeCollaboratorModal = () => {
    setSelectedUsers([]);
    setRemoveUserIds([]);
    setIsCollaboratorModal(false);
  };

 
  const hasChanges = selectedUsers.length > 0 || removeUserIds.length > 0;

  const convertToWebContainerTree = (flatTree) => {
    const root = {};

    Object.entries(flatTree).forEach(([filePath, node]) => {
      const parts = filePath.split("/").filter(Boolean);

      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;

        if (isFile) {
          current[part] = {
            file: {
              contents: getFileContents(node),
            },
          };
        } else {
          if (!current[part]) {
            current[part] = {
              directory: {},
            };
          }

          current = current[part].directory;
        }
      });
    });

    return root;
  };

 
  return (
    <>
      <main className="custom-scrollbar w-full h-screen bg-[#0B0D10] text-white flex overflow-hidden">
 
        <div className="w-full md:w-[480px] lg:w-[30%] shrink-0 relative bg-[#0F1115] h-screen flex flex-col border-r border-[#24262D]">
 
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

 
          <div className="conversation-area flex flex-col flex-1 min-h-0">
            {/* message box*/}

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

              {aiLoading && (
                <div className="mr-auto max-w-[90%] rounded-2xl border border-[#24262D] bg-[#15171D] px-4 py-3">
                  <AiLoading />
                </div>
              )}
            </div>

            {/* input field  */}

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

        {/* right panel */}

        <div className="hidden md:flex flex-1 min-w-0 h-screen bg-[#131418]">
          <div className="text-gray-300 text-sm flex w-full h-screen overflow-hidden">
            {/* file explorer */}
            <div className="explorer w-[30%] min-w-[200px] max-w-[300px] bg-[#131418] border-r border-[#2a2b30] flex flex-col">
              {/* explorer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2b30]">
                <h2 className="text-xs font-bold tracking-[2px] uppercase text-[#F7FF72]">
                  Explorer
                </h2>
                <button
                 className="group flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-[#F7FF72] text-[#0B0D10] text-sm font-semibold border border-[#F7FF72]/30 shadow-[0_0_12px_rgba(247,255,114,0.15)] hover:shadow-[0_0_20px_rgba(247,255,114,0.35)] hover:-translate-y-0.5 hover:bg-[#F7FF72]/90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!webContainer || isRunning}
                  onClick={async () => {
                    if (!webContainer || isRunning) return;

                    if (Object.keys(fileTree).length === 0) {
                      console.error("No project files to run.");
                      return;
                    }

                    setIsRunning(true);
                    setIFrameUrl(null);

                    try {
                      console.log("Preparing project...");
                      const webContainerTree = convertToWebContainerTree(fileTree);
                      await webContainer.mount(webContainerTree);
                      console.log("Files mounted successfully.");

                      const packageJsonFile = fileTree["package.json"];
                      if (!packageJsonFile) {
                        throw new Error("package.json not found. Generate a package.json first.");
                      }

                      const packageJson = JSON.parse(getFileContents(packageJsonFile));
                      const scripts = packageJson.scripts || {};

                      const installProcess = await webContainer.spawn("npm", ["install"]);
                      const installOutput = installProcess.output.pipeTo(
                        new WritableStream({
                          write(chunk) {
                            console.log("[npm install]", chunk);
                          },
                        }),
                      );

                      const installExitCode = await installProcess.exit;
                      await installOutput;

                      if (installExitCode !== 0) {
                        throw new Error(`npm install failed with exit code ${installExitCode}`);
                      }

                      let command = commands.start;
                      if (!command) {
                        if (scripts.dev) command = "npm run dev";
                        else if (scripts.start) command = "npm start";
                        else if (scripts.serve) command = "npm run serve";
                        else throw new Error("No dev, start, or serve script found in package.json.");
                      }

                     
                      if (/^npm\s+run\s+dev(?:\s|$)/.test(command) && !command.includes("--host")) {
                        command += " -- --host 0.0.0.0";
                      }

                      const [program, ...args] = command.split(/\s+/);
                      const runProcess = await webContainer.spawn(program, args);

                      runProcess.output.pipeTo(
                        new WritableStream({
                          write(chunk) {
                            console.log("[Application]", chunk);
                          },
                        }),
                      );

                      console.log("Application process started:", command);
                      // Keep isRunning true until the server-ready event fires.
                    } catch (error) {
                      console.error("Failed to run project:", error);
                      setIsRunning(false);
                    }
                  }}
                >
                  {isRunning ? "Running..." : "Run"}{" "}
                </button>
                <span className="text-xs text-gray-500">
                  {Object.keys(fileTree).length} Files
                </span>
              </div>

               <div className="px-4 py-3">
                <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
                  Project Files
                </p>
              </div>

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

             <div className="file-editor bg-[#131418] flex-1 min-w-0 h-full flex flex-col overflow-hidden">
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

                 {openFile.length === 0 && (
                  <div className="px-5 py-3 text-xs text-gray-600">
                    No files open
                  </div>
                )}
              </div>

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

              {/* code editors */}
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

               <div className="flex items-center justify-between px-4 py-2 bg-[#17181d] border-t border-[#2a2b30] shrink-0">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="text-[#F7FF72]">● You Can Do It Man</span>
                </div>

                <span className="text-[10px] tracking-wider text-gray-600">
                  Create Your Project
                </span>
              </div>
            </div>
          <div className="flex-1 min-w-0 h-full flex flex-col bg-[#0B0D10] overflow-hidden">

     <div className="flex items-center gap-3 px-4 py-3 bg-[#0F1115] border-b border-[#24262D]">

       <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>

       <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#15171D] border border-[#24262D] focus-within:border-[#F7FF72]/50 transition-colors">

        <span className="text-[#F7FF72] text-sm">↗</span>

        <input
          type="text"
          value={iFrameUrl}
          readOnly
          className="w-full min-w-0 bg-transparent text-xs text-gray-300 outline-none"
        />
      </div>

       <button
        onClick={() => window.open(iFrameUrl, "_blank", "noopener,noreferrer")}
        className="shrink-0 px-3 py-2 rounded-lg border border-[#24262D] text-gray-400 hover:text-[#F7FF72] hover:border-[#F7FF72]/40 transition-all duration-200"
        title="Open in new tab"
      >
        ↗
      </button>
    </div>

     <div className="flex items-center justify-between px-4 py-2 bg-[#131418] border-b border-[#24262D]">
      <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
        Live Preview
      </span>

      <span className="flex items-center gap-2 text-[10px] text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F7FF72] animate-pulse" />
        Connected
      </span>
    </div>

     <div className="flex-1 min-h-0 p-2 bg-[#0B0D10]">
      {iFrameUrl ? (
        <iframe
          key={iFrameUrl}
          src={iFrameUrl}
          title="Live Project Preview"
          className="w-full h-full rounded-lg border border-[#24262D] bg-white"
        />
      ) : (
        <div className="w-full h-full rounded-lg border border-dashed border-[#24262D] bg-[#0F1115] flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-2xl border border-[#F7FF72]/20 bg-[#F7FF72]/10 flex items-center justify-center text-[#F7FF72] text-xl mb-4">
            ↗
          </div>
          <p className="text-sm font-semibold text-gray-300">
            {isRunning ? "Starting your project..." : "Live preview is waiting"}
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-[240px] leading-5">
            Generate a project, then click Run. Your website will appear here when its server is ready.
          </p>
        </div>
      )}
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
