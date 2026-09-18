import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loading from "../../../components/Loading";

const Register = () => {
  const { isLoading, registerByUser, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    console.log("Register Data:", data);

    try {
      await registerByUser(data);
      navigate("/dash");
    } catch (error) {
      console.log("something went wrong from register data fetching ", error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#131418] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            SEO<span className="text-[#F7FF72]">N</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Create your account and get started
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1a1b20] border border-[#292b32] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-1">Create Account</h2>

          <p className="text-gray-400 text-sm mb-7">
            Enter your details to create your account
          </p>

          <p>
            {error && (
              <div className="mb-5 rounded-xl flex items-center justify-center capitalize border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </p>

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
                  ${errors.email ? "border-red-500" : "border-[#30323a]"}`}
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl bg-[#131418] border px-4 py-3.5 pr-12
                    text-white placeholder-gray-500 outline-none transition
                    focus:border-[#F7FF72] focus:ring-1 focus:ring-[#F7FF72]
                    ${errors.password ? "border-red-500" : "border-[#30323a]"}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-[#F7FF72] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl bg-[#131418] border px-4 py-3.5 pr-12
                    text-white placeholder-gray-500 outline-none transition
                    focus:border-[#F7FF72] focus:ring-1 focus:ring-[#F7FF72]
                    ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-[#30323a]"
                    }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-[#F7FF72] transition"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Register Button */}
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
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-sm text-gray-400 mt-7">
            Already have an account?{" "}
            <Link
              to="/"
              type="button"
              className="text-[#F7FF72] font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © 2026 Seon. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
