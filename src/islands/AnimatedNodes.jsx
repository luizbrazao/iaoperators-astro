import { Box, FileText, Image as ImageIcon, LayoutTemplate } from "lucide-react";

export default function AnimatedNodes() {
  return (
    <div className="relative flex items-center justify-center w-full aspect-video bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-transparent opacity-50" />

      {/* SVG de Fundo - Ajustado */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full opacity-20" aria-hidden="true">
        <line x1="40%" y1="50%" x2="60%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="40%" y1="50%" x2="60%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="40%" y1="50%" x2="60%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Wrapper de conteúdo (ultra compacto) */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-6 transform scale-[0.35] sm:scale-[0.5] md:scale-[0.65] lg:scale-[0.8] transition-transform duration-300 origin-center">
        {/* Nó central */}
        <div className="relative shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-[#111] border border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.25)] z-20">
          <Box className="w-10 h-10 text-orange-500 animate-pulse" strokeWidth={1.5} />

          {/* Conexões */}
          <div className="absolute left-full top-1/2 w-6 sm:w-8 h-0.5 bg-linear-to-r from-orange-500 to-transparent" />
          <div className="absolute left-full top-1/2 w-6 sm:w-8 h-px bg-linear-to-r from-orange-500/50 to-transparent rotate-[-25deg] origin-left" />
          <div className="absolute left-full top-1/2 w-6 sm:w-8 h-px bg-linear-to-r from-orange-500/50 to-transparent rotate-25 origin-left" />
        </div>

        {/* Nós da direita */}
        <div className="flex flex-col gap-3 z-10">
          <div className="flex items-center gap-3 p-2.5 w-36 rounded-xl bg-[#151515] border border-white/10 shadow-lg backdrop-blur-sm hover:border-orange-500/50 hover:bg-white/5 transition-all duration-300">
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
              <LayoutTemplate className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-14 bg-white/20 rounded-full" />
              <div className="h-1 w-8 bg-white/10 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 w-36 rounded-xl bg-[#151515] border border-white/10 shadow-lg backdrop-blur-sm hover:border-orange-500/50 hover:bg-white/5 transition-all duration-300 transform translate-x-2">
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
              <FileText className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-12 bg-white/20 rounded-full" />
              <div className="h-1 w-6 bg-white/10 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 w-36 rounded-xl bg-[#151515] border border-white/10 shadow-lg backdrop-blur-sm hover:border-orange-500/50 hover:bg-white/5 transition-all duration-300">
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
              <ImageIcon className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-10 bg-white/20 rounded-full" />
              <div className="h-1 w-8 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
