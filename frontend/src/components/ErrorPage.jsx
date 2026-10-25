import { useRouteError, isRouteErrorResponse } from "react-router";

const ErrorPage = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || "Page could not be loaded.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-red-400 mb-4">
        {title}
      </h1>

      <p className="text-gray-400 text-center mb-6">
        {message}
      </p>

      <button
        onClick={() => window.location.assign("/")}
        className="px-5 py-2 rounded-lg bg-[#F7FF72] text-black font-semibold"
      >
        Go Home
      </button>
    </div>
  );
};

export default ErrorPage;