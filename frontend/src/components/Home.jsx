import React, { useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "./Loading";
import { Link, useNavigate } from "react-router";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Icon = ({ name, className = "h-5 w-5" }) => {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths = {
    check: <><path d="m5 12 4 4L19 6" /><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M3 10h18" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
  };

  return <svg {...common}>{paths[name] || paths.user}</svg>;
};

const Home = () => {
  const navigate = useNavigate();
  const { isLoading, authData, logOutByUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Backend response shape: { success, message, userDetail: {...} }
  const user = authData?.userDetail;
  const email = user?.email || "No email available";
  const initial = user?.email?.trim()?.charAt(0)?.toUpperCase() || "U";
  const createdDate = formatDate(user?.createdAt);
  const updatedDate = formatDate(user?.updatedAt);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logOutByUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return null;

  return (
    <div className="min-h-screen overflow-hidden bg-[#090b0f] text-white selection:bg-[#f7ff72] selection:text-black">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[12%] h-96 w-96 rounded-full bg-[#f7ff72]/[0.06] blur-[120px]" />
        <div className="absolute right-[-10rem] top-[28rem] h-96 w-96 rounded-full bg-violet-500/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090b0f]/85 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link to="/" className="group inline-flex shrink-0 items-center gap-2.5" aria-label="Seon home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7ff72] text-lg font-black text-[#11130a] shadow-[0_0_28px_rgba(247,255,114,0.12)] transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
              S
            </span>
            <span className="text-xl font-extrabold tracking-[-0.06em]">SEO<span className="text-[#f7ff72]">N</span><span className="ml-2 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 sm:inline">Workspace</span></span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="project"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#f7ff72] px-3.5 py-2.5 text-sm font-bold text-[#10120a] shadow-[0_6px_28px_rgba(247,255,114,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fbff9b] active:scale-[0.98] sm:px-4"
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">Create project</span>
              <span className="sm:hidden">Create</span>
              <Icon name="arrow" className="hidden h-4 w-4 sm:block transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="hidden h-8 w-px bg-white/10 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f7ff72]/30 bg-[#f7ff72]/10 text-sm font-bold text-[#f7ff72] ring-4 ring-white/[0.025]">
                {initial}
              </div>
              <div className="hidden max-w-[180px] lg:block">
                <p className="truncate text-sm font-semibold text-gray-100">{email}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Personal account</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3.5"
              aria-label="Log out"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden md:inline">{isLoggingOut ? "Logging out…" : "Logout"}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-11 lg:px-8 lg:pt-14">
        {/* Welcome hero */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-br from-[#171a20] via-[#111319] to-[#10120f] p-6 sm:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-[#f7ff72]/[0.10] sm:h-80 sm:w-80" />
          <div aria-hidden="true" className="absolute -right-2 -top-12 h-52 w-52 rounded-full border border-[#f7ff72]/[0.08] sm:h-64 sm:w-64" />
          <div aria-hidden="true" className="absolute right-10 top-10 hidden h-28 w-28 rotate-12 rounded-3xl border border-[#f7ff72]/10 bg-[#f7ff72]/[0.025] sm:block" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f7ff72]/20 bg-[#f7ff72]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#f7ff72]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f7ff72] shadow-[0_0_10px_#f7ff72]" />
                YOUR PERSONAL WORKSPACE
              </div>
              <p className="mb-2 text-sm text-gray-400">Welcome back{user?.email ? "," : ""}</p>
              <h1 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Your work, <span className="text-[#f7ff72]">in control.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
                Manage your account, keep your details handy, and jump straight into your next project.
              </p>
            </div>

            <Link
              to="project"
              className="group flex w-full max-w-sm items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition duration-300 hover:border-[#f7ff72]/30 hover:bg-black/30 sm:p-5 lg:min-w-[290px]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7ff72] text-[#11130a]">
                  <Icon name="folder" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Go to projects</p>
                  <p className="mt-1 text-xs text-gray-500">Build something great</p>
                </div>
              </div>
              <Icon name="arrow" className="h-5 w-5 text-gray-500 transition duration-200 group-hover:translate-x-1 group-hover:text-[#f7ff72]" />
            </Link>
          </div>
        </section>

        {logoutError && (
          <div role="alert" className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">
            <span>{logoutError}</span>
            <button type="button" onClick={() => setLogoutError("")} className="rounded px-2 py-1 text-red-200 hover:bg-red-400/10">Dismiss</button>
          </div>
        )}

        {/* Summary cards */}
        <section aria-label="Account summary" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="group rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/25 sm:p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                <Icon name="check" className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Active
              </span>
            </div>
            <p className="text-sm text-gray-500">Account status</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">Active account</h2>
            <p className="mt-2 text-xs leading-5 text-gray-500">Your account details are available in this workspace.</p>
          </article>

          <article className="group rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#f7ff72]/25 sm:p-6">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f7ff72]/15 bg-[#f7ff72]/[0.07] text-[#f7ff72]">
              <Icon name="mail" className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-500">Email address</p>
            <h2 className="mt-1.5 break-all text-base font-semibold leading-6 sm:text-lg">{email}</h2>
            <p className="mt-2 text-xs text-gray-500">Linked to your account</p>
          </article>

          <article className="group rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/25 sm:col-span-2 sm:p-6 xl:col-span-1">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.07] text-sky-300">
              <Icon name="calendar" className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-500">Member since</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{createdDate}</h2>
            <p className="mt-2 text-xs text-gray-500">Your journey with Seon</p>
          </article>
        </section>

        {/* Account details and side panel */}
        <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(270px,0.8fr)] lg:gap-6">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141a]/90">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Account information</h2>
                <p className="mt-1 text-sm text-gray-500">Your personal account details at a glance.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-gray-400">
                <Icon name="user" className="h-4 w-4" /> Profile details
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <DetailItem label="User ID" value={user?._id || "Not available"} />
              <DetailItem label="Email address" value={email} />
              <DetailItem label="Account created" value={createdDate} />
              <DetailItem label="Last updated" value={updatedDate} />
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-2xl border border-[#f7ff72]/15 bg-gradient-to-br from-[#1a1d17] to-[#11141a] p-5 sm:p-6">
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f7ff72]/[0.07] blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f7ff72]/20 bg-[#f7ff72]/[0.09] text-[#f7ff72]">
                <Icon name="shield" className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f7ff72]">Your workspace</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Everything in one place.</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Your profile information is shown here so you can quickly check the account connected to your workspace.
              </p>
              <div className="my-5 h-px bg-white/[0.08]" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-[#f7ff72]">
                  <Icon name="sparkles" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ready for your next idea?</p>
                  <p className="mt-1 text-xs text-gray-500">Start a fresh project anytime.</p>
                </div>
              </div>
              <Link to="project" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7ff72] px-4 py-3 text-sm font-bold text-[#10120a] transition hover:bg-[#fbff9b] active:scale-[0.99]">
                Open projects <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] pt-6 text-center text-xs text-gray-600 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Seon. All rights reserved.</p>
          <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Workspace available</p>
        </footer>
      </main>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="min-w-0 rounded-xl border border-white/[0.06] bg-[#0b0e12] p-4 transition hover:border-white/[0.12]">
    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-gray-500">{label}</p>
    <p className="mt-2 break-all text-sm font-medium leading-6 text-gray-200">{value}</p>
  </div>
);

export default Home;
