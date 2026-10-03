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

import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useProject } from "../hook/useProject";

// String ID ho ya object, dono se ID nikaal lega
const getId = (u) => (typeof u === "string" ? u : (u?._id ?? u?.id));

const DetailProject = () => {
  const { projectId } = useParams();
  const { allUserData } = useAuth();
  const { addUserInCollaborator, removeProjectByUser } = useProject();

  // ==========================================
  // STATES
  // ==========================================

  const [isSlidePanel, setIsSlidePanel] = useState(false);
  const [isCollaboratorModal, setIsCollaboratorModal] = useState(false);

  // Saare users
  const [users, setUsers] = useState([]);

  // DB me jo collaborators already hain
  const [collaborators, setCollaborators] = useState([]);

  // Modal: naye select kiye hue users (add ke liye)
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Modal: existing collaborators jinko remove karna hai (IDs)
  const [removeUserIds, setRemoveUserIds] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // GET ALL USERS
  // ==========================================

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

  // ==========================================
  // GET PROJECT + EXISTING COLLABORATORS
  // ==========================================

  useEffect(() => {
    const getProjectById = async () => {
      try {
        const res = await api.get(`/api/project/get-project/${projectId}`);
        const projectUsers = res?.data?.project?.user || [];

        const ids = projectUsers.map(getId).filter(Boolean);

        // All users me se match karo
        const matched = users.filter((u) => ids.includes(getId(u)));

        // Backend ne populate kiya ho to wo objects
        const populated = projectUsers.filter(
          (u) => typeof u === "object" && getId(u),
        );

        setCollaborators(matched.length > 0 ? matched : populated);
      } catch (error) {
        console.error("Get project failed:", error);
      }
    };

    if (projectId && users.length > 0) getProjectById();
  }, [projectId, users]);

  // ==========================================
  // SELECT / UNSELECT USER (MODAL)
  // ==========================================

  const handleSelectUser = (user) => {
    const userId = getId(user);
    if (!userId) return;

    const alreadyCollaborator = collaborators.some(
      (c) => getId(c) === userId,
    );

    // Existing collaborator: click 1 -> remove mark, click 2 -> unmark
    if (alreadyCollaborator) {
      setRemoveUserIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
      return;
    }

    // Naya user: click 1 -> select, click 2 -> unselect
    setSelectedUsers((prev) => {
      const alreadySelected = prev.some((s) => getId(s) === userId);

      if (alreadySelected) {
        return prev.filter((s) => getId(s) !== userId);
      }

      return [...prev, user];
    });
  };

  // ==========================================
  // SAVE CHANGES (ADD + REMOVE)
  // ==========================================

  const handleSaveChanges = async () => {
    if (isSaving) return;
    if (!projectId) return;
    if (selectedUsers.length === 0 && removeUserIds.length === 0) return;

    try {
      setIsSaving(true);

      // ---------- ADD ----------
      if (selectedUsers.length > 0) {
        const userIds = selectedUsers.map(getId).filter(Boolean);

        await addUserInCollaborator({ projectId, user: userIds });

        setCollaborators((prev) => {
          const prevIds = prev.map(getId).filter(Boolean);

          const newOnes = selectedUsers.filter((s) => {
            const id = getId(s);
            return id && !prevIds.includes(id);
          });

          return [...prev, ...newOnes];
        });
      }

      // ---------- REMOVE ----------
      if (removeUserIds.length > 0) {
        await removeProjectByUser({ projectId, user: removeUserIds });

        setCollaborators((prev) =>
          prev.filter((c) => !removeUserIds.includes(getId(c))),
        );
      }

      closeCollaboratorModal();
    } catch (error) {
      console.error("Failed to update collaborators:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // OPEN / CLOSE MODAL
  // ==========================================

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

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <>
      {/* ================= MAIN ================= */}

      <main className="w-full h-screen bg-[#0B0D10] text-white flex overflow-hidden">
        {/* ================= LEFT CHAT PANEL ================= */}

        <div className="w-full md:w-[380px] lg:w-[25%] shrink-0 relative bg-[#0F1115] h-screen flex flex-col border-r border-[#24262D]">
          {/* HEADER */}

          <header className="bg-[#0F1115] px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between border-b border-[#24262D] shrink-0">
            <button
              className="text-sm sm:text-[15px] font-semibold flex gap-1.5 sm:gap-2 items-center justify-center text-white hover:text-[#F7FF72] active:scale-95 transition-all duration-200"
              onClick={openCollaboratorModal}
            >
              <RiAddLargeFill />
              <span>Add Collaborator</span>
            </button>

            <RiGroupFill
              onClick={() => setIsSlidePanel(!isSlidePanel)}
              className="text-xl text-white cursor-pointer hover:text-[#F7FF72] active:scale-90 transition"
            />
          </header>

          {/* CONVERSATION AREA */}

          <div className="conversation-area flex flex-col flex-1 min-h-0">
            {/* MESSAGE BOX */}

            <div className="msg-box flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
              {/* INCOMING MESSAGE */}

              <div className="incoming-msg bg-[#15171D] text-white rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-[90%] sm:max-w-[80%] border border-[#24262D] break-words">
                <small className="text-xs text-gray-400">mantu@gmail.com</small>

                <p className="break-words whitespace-normal mt-1 text-sm sm:text-base">
                  Lorem ipsum dolor sit amet consectetur.
                </p>
              </div>

              {/* OUTGOING MESSAGE */}

              <div className="ml-auto outcoming-msg bg-[#F7FF72] text-black rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-[90%] sm:max-w-[80%] break-words">
                <small className="text-xs text-gray-700">vishal@gmail.com</small>

                <p className="break-words whitespace-normal mt-1 text-sm sm:text-base">
                  Lorem ipsum dolor sit amet consectetur
                </p>
              </div>
            </div>

            {/* INPUT FIELD */}

            <div className="input-field flex items-center p-2 sm:p-3 gap-2 bg-[#0F1115] border-t border-[#24262D] shrink-0">
              <input
                className="min-w-0 bg-[#15171D] text-white placeholder:text-gray-500 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full flex-1 outline-none border border-[#24262D] focus:border-[#F7FF72] transition text-sm sm:text-base"
                placeholder="Enter Your Message"
              />

              <button className="shrink-0 flex items-center justify-center gap-1.5 bg-[#F7FF72] text-black font-semibold rounded-full px-3 sm:px-5 py-2.5 sm:py-3 active:scale-95 hover:opacity-90 transition">
                <span className="hidden sm:inline">Send</span>
                <RiSendPlaneFill />
              </button>
            </div>
          </div>

          {/* ================= SLIDE PANEL (COLLABORATORS) ================= */}

          <div
            className={`absolute top-0 left-0 w-full h-full bg-[#0F1115] flex flex-col transform transition-transform duration-500 ease-in-out z-20 ${
              isSlidePanel ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <header className="flex bg-[#15171D] items-center justify-end p-3 sm:p-4 border-b border-[#24262D] shrink-0">
              <RiCloseLargeLine
                onClick={() => setIsSlidePanel(false)}
                className="text-2xl text-white active:scale-85 font-black hover:bg-white hover:text-black rounded-full p-1 transition-all duration-300 cursor-pointer"
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
                    className="flex items-center gap-3 p-3 bg-[#15171D] border-b border-[#24262D] hover:bg-[#20232A] transition cursor-pointer"
                  >
                    <span className="w-10 h-10 shrink-0 bg-[#20232A] flex items-center justify-center rounded-full">
                      <RiUserFill className="text-xl text-white" />
                    </span>

                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-white truncate">
                        {user?.username || "Unknown User"}
                      </span>

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

        <div className="hidden md:flex flex-1 h-screen bg-[#0B0D10] items-center justify-center">
          <div className="text-gray-600 text-sm select-none">
            not any conversation available about
          </div>
        </div>
      </main>

      {/* ================= ADD / REMOVE COLLABORATOR MODAL ================= */}

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

                const isSelected = selectedUsers.some(
                  (s) => getId(s) === userId,
                );

                const isAlreadyCollaborator = collaborators.some(
                  (c) => getId(c) === userId,
                );

                const isMarkedForRemove = removeUserIds.includes(userId);

                return (
                  <div
                    key={userId}
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

                    {/* STATUS / CHECK */}

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