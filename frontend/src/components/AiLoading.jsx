import React from "react";

const AiLoading = () => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#24262D] bg-[#15171D] px-4 py-3 w-fit">
      {/* AI Avatar */}{" "}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7FF72] text-black text-sm font-bold">
        AI{" "}
      </div>
      
      {/* Loading Animation */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">AI is thinking...</span>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-bounce rounded-full bg-[#F7FF72]"
              style={{
                animationDelay: `${dot * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiLoading;
