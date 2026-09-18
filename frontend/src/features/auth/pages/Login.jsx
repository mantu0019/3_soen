import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loading from "../../../components/Loading";

const Login = () => {

  const {isLoading,loginByUser,error} =  useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const navigate =   useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
   

     try {
       await loginByUser(data);
       navigate("/dash")
     } catch (error) {
        console.log("something went wrong from login data fetching",error);
        
      
     }
  };
  if(isLoading){
    return <Loading/>
  }

  return (
    <div className="min-h-screen bg-[#131418] text-white flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            SEO<span className="text-[#F7FF72]">N   </span>
          </h1>

          <p className="text-gray-400 mt-2">
            Welcome back! Login to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1b20] border border-[#292b32] rounded-2xl p-6 sm:p-8 shadow-2xl">

          <h2 className="text-2xl font-bold mb-1">
            Login
          </h2>

          <p className="text-gray-400 text-sm mb-7">
            Enter your credentials to continue
          </p>
           <p>{error && (
  <div className="mb-5 rounded-xl border  flex items-center justify-center capitalize border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
    {error}
  </div>
)}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className={`w-full rounded-xl bg-[#131418] border px-4 py-3.5
                  text-white placeholder-gray-500 outline-none transition
                  focus:border-[#F7FF72] focus:ring-1 focus:ring-[#F7FF72]
                  ${
                    errors.email
                      ? "border-red-500"
                      : "border-[#30323a]"
                  }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full rounded-xl bg-[#131418] border px-4 py-3.5 pr-12
                    text-white placeholder-gray-500 outline-none transition
                    focus:border-[#F7FF72] focus:ring-1 focus:ring-[#F7FF72]
                    ${
                      errors.password
                        ? "border-red-500"
                        : "border-[#30323a]"
                    }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-[#F7FF72] transition"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    // Eye Off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    // Eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-3">

              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 accent-[#F7FF72]"
                />
                Remember me
              </label>

             

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F7FF72] text-[#131418]
                font-bold py-3.5 rounded-xl
                hover:bg-[#eaf15c]
                active:scale-[0.98]
                transition-all
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-400 mt-7">
            Don't have an account?{" "}
            <Link
             to="/register"
              type="button"
              className="text-[#F7FF72] font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © 2026 Seon. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default Login;