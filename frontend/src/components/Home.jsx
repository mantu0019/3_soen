import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "./Loading";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  const { isLoading, authData, logOutByUser } = useAuth();

  // backend response shape: { success, message, userDetail: {...} }
  const user = authData?.userDetail;

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const createdDate = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const updatedDate = new Date(user.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = async () => {
    try {
      await logOutByUser();
      navigate("/");
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#101216]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            SEO<span className="text-yellow-300">N</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">Account</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <section className="mb-8">
          <p className="text-yellow-300 text-sm font-medium mb-2">Welcome back 👋</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Your Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your account and view your account information.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#13161b] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-green-400/10 flex items-center justify-center text-xl">✓</div>
              <span className="px-3 py-1 rounded-full text-xs bg-green-400/10 text-green-400">Active</span>
            </div>
            <p className="text-sm text-gray-500">Account Status</p>
            <h2 className="text-xl font-semibold mt-1">Active Account</h2>
          </div>

          <div className="bg-[#13161b] border border-white/10 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-yellow-300/10 flex items-center justify-center text-xl mb-6">✉</div>
            <p className="text-sm text-gray-500">Email Address</p>
            <h2 className="text-base font-semibold mt-1 break-all">{user.email}</h2>
          </div>

          <div className="bg-[#13161b] border border-white/10 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-blue-400/10 flex items-center justify-center text-xl mb-6">📅</div>
            <p className="text-sm text-gray-500">Member Since</p>
            <h2 className="text-lg font-semibold mt-1">{createdDate}</h2>
          </div>
        </section>

        <section className="bg-[#13161b] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-semibold">Account Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your account details</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">User ID</p>
              <div className="mt-2 bg-[#0c0f13] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-300 break-all">{user._id}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
              <div className="mt-2 bg-[#0c0f13] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-300 break-all">{user.email}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Account Created</p>
              <div className="mt-2 bg-[#0c0f13] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-300">{createdDate}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Last Updated</p>
              <div className="mt-2 bg-[#0c0f13] border border-white/10 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-300">{updatedDate}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <p className="text-center text-xs text-gray-600">© 2026 Seon. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;