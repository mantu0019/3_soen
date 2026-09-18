import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#131418] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-[#F7FF72] animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-[#F7FF72] animate-bounce [animation-delay:150ms]"></div>
        <div className="w-4 h-4 rounded-full bg-[#F7FF72] animate-bounce [animation-delay:300ms]"></div>
      </div>
    </div>
  );
};

export default Loading;