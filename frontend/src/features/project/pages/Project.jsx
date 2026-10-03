import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useProject } from "../hook/useProject";
import { RiUserFill } from "react-icons/ri";
import { useNavigate } from "react-router";

const Project = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [getAllProject, setGetAllProject] = useState([]);
     const navigate  =    useNavigate();
  const { isLoading, error, createProjectByUser, getProjectByUser } =
    useProject();

  // ================= FORM =================
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ================= GET ALL PROJECT =================
  useEffect(() => {
    const getProjectData = async () => {
      try {
        const res = await getProjectByUser();
         setGetAllProject((res?.allProductName || []).filter(Boolean));
      } catch (err) {
        console.log("Get project error:", err);
        setGetAllProject([]);
      }
    };

    getProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await createProjectByUser({
        name: data.name.trim(),
      });

      const createdProject = res?.newProject ?? res?.data?.newProject;

      if (createdProject?._id && createdProject?.name) {
        setGetAllProject((prev) => [...prev, createdProject]);
      }

      reset();
      setIsModalOpen(false);
    } catch (err) {
      console.log("Create project er ror:", err);
    }
  };

  // ================= CLOSE MODAL =================
  const closeModal = () => {
    if (isLoading) return;

    reset();
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#131418] px-6 py-8 text-white">
      {/* ================= HEADER ================= */}
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">Workspace</p>

            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>

            <p className="mt-2 text-sm text-gray-400">
              Create and manage your projects.
            </p>
          </div>

          {/* CREATE BUTTON */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 rounded-xl bg-[#F7FF72] px-5 py-3 font-semibold text-[#131418] shadow-[0_0_25px_rgba(247,255,114,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(247,255,114,0.18)] active:scale-95"
          >
            <span className="text-xl leading-none">+</span>
            Create Project
          </button>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-8 h-px bg-white/10" />

        {/* ================= PROJECT SECTION ================= */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Projects</h2>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-400">
              {getAllProject.length} Projects
            </span>
          </div>

          {/* ================= EMPTY STATE ================= */}
          {getAllProject.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F7FF72]/20 bg-[#F7FF72]/5 text-3xl text-[#F7FF72]">
                +
              </div>

              <h3 className="text-lg font-semibold">No projects yet</h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Create your first project and start building something amazing.
              </p>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-6 rounded-lg border border-[#F7FF72]/30 px-4 py-2 text-sm font-medium text-[#F7FF72] transition hover:bg-[#F7FF72] hover:text-[#131418]"
              >
                Create your first project
              </button>
            </div>
          )}

          {/* ================= PROJECT CARDS ================= */}
          {getAllProject.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {getAllProject.filter(Boolean).map((project, index) => (
                <div
                    onClick={()=>{
                         navigate(`/dash/${project._id}`)
                     }}

                  key={project._id ?? index}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#F7FF72]/30 hover:bg-white/[0.04]"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7FF72]/10 text-lg font-bold text-[#F7FF72]">
                      {project?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <button
                      type="button"
                      className="text-gray-600 transition hover:text-[#F7FF72]"
                    >
                      •••
                    </button>
                  </div>

                  {/* PROJECT NAME */}
                  <h3 className="mt-5 text-lg font-semibold flex gap-3">
                    {project?.name}

                    <span className=" flex items-center justify-center gap-2">
                       Collaborator
                      <RiUserFill />
                      {project?.user.length}
                    </span>
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">Project</p>

                  {/* CARD FOOTER */}
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Recently created
                    </span>

                    <button
                      type="button"
                      className="text-sm font-medium text-[#F7FF72] opacity-70 transition group-hover:opacity-100"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODAL ===================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#131418] shadow-2xl">
            {/* YELLOW TOP LINE */}
            <div className="h-1 w-full bg-[#F7FF72]" />

            <div className="p-6">
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7FF72]/10 text-xl text-[#F7FF72]">
                    +
                  </div>

                  <h2 className="text-xl font-semibold">Create Project</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Give your project a unique name.
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-500 transition hover:bg-white/5 hover:text-white"
                >
                  ×
                </button>
              </div>

              {/* ================= FORM ================= */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-7">
                <label
                  htmlFor="projectName"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Project Name
                </label>

                <input
                  id="projectName"
                  type="text"
                  autoFocus
                  placeholder="e.g. Portfolio Website"
                  disabled={isLoading}
                  className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition ${
                    errors.name
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#F7FF72]/60 focus:ring-2 focus:ring-[#F7FF72]/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  {...register("name", {
                    required: "Project name is required",

                    minLength: {
                      value: 3,
                      message: "Project name must be at least 3 characters",
                    },

                    maxLength: {
                      value: 50,
                      message: "Project name cannot exceed 50 characters",
                    },

                    pattern: {
                      value: /^[a-zA-Z0-9 _@-]+$/,
                      message:
                        "Only letters, numbers, spaces, _, @ and - are allowed",
                    },

                    validate: (value) =>
                      value.trim().length >= 3 ||
                      "Project name cannot contain only spaces",
                  })}
                />

                {/* VALIDATION ERROR */}
                {errors.name && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}

                {/* API ERROR */}
                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {typeof error === "string"
                      ? error
                      : error?.message || "Failed to create project"}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="mt-7 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-[#F7FF72] px-4 py-3 text-sm font-semibold text-[#131418] transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#131418]/30 border-t-[#131418]" />
                        Creating...
                      </span>
                    ) : (
                      "Create Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
