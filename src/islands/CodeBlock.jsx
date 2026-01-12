export default function CodeBlock() {
  return (
    <div className="w-full aspect-video bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
      {/* Header da Janela */}
      <div className="flex items-center px-4 py-2 border-b border-white/5 bg-white/2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>

      {/* Área do Código */}
      <div className="p-6 font-mono text-xs md:text-sm leading-relaxed overflow-hidden relative">
        {/* Efeito de Scanline */}
        <div className="absolute inset-0 pointer-events-none w-full h-0.5 bg-linear-to-b from-transparent via-orange-500/5 to-transparent animate-[scan_3s_linear_infinite]" />

        <div className="text-gray-400">
          <span className="mr-4 text-gray-600 select-none">1</span>
          <span className="text-orange-400">Class</span>{" "}
          <span className="text-yellow-200">ChatBot</span>
          {"{"}
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">2</span>
          <span className="text-purple-400">address</span> public owner;
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">3</span>
          <span className="text-purple-400">int</span> private response;
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">4</span>
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">5</span>
          <span className="text-orange-400">constructor</span>() {"{"}
        </div>

        <div className="text-gray-400 pl-8">
          <span className="mr-4 -ml-8 text-gray-600 select-none">6</span>
          owner = msg.sender;
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">7</span>
          {"}"}
        </div>

        <div className="text-gray-400 pl-4">
          <span className="mr-4 -ml-4 text-gray-600 select-none">8</span>
          <span className="text-blue-400">function</span>{" "}
          <span className="text-yellow-200">resp</span>(msg)
          <span className="animate-pulse border-r-2 border-orange-500 ml-1">
            &nbsp;
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -20px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
