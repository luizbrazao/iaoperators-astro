import { useState } from "react";

export default function GridSpotlight({ children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative w-full min-h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <style>{`
        @keyframes grid-movement {
          0% { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          animation: "grid-movement 1.5s linear infinite",
          WebkitAnimation: "grid-movement 1.5s linear infinite",
          maskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-white/90">{children}</div>
    </div>
  );
}
