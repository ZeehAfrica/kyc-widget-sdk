export const Loader = () => {
  return (
    <div
      className="absolute inset-0  flex items-center justify-center bg-black bg-opacity-30 z-10 rounded-lg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }} // Fallback for bg-opacity
    >
      <div className="flex space-x-2">
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
};
