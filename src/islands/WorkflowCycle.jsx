import { useEffect, useState } from "react";
import { Settings, MessageSquare, Mail } from "lucide-react";

export default function WorkflowCycle() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: Settings, label: "Trigger" },
    { icon: MessageSquare, label: "Prompts" },
    { icon: Mail, label: "Send Email" },
  ];

  return (
    <div className="relative flex items-center justify-center w-full aspect-video bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Background gradient sutil */}
      <div className="absolute inset-0 bg-linear-to-bl from-orange-500/5 via-transparent to-transparent opacity-50" />

      {/* Wrapper ultra compacto */}
      <div className="relative z-10 flex flex-col justify-center gap-2.5 w-55 transform scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.9] transition-transform duration-300 origin-center">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const Icon = step.icon;

          return (
            <div
              key={index}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-500
                ${
                  isActive
                    ? "bg-[#151515] border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] translate-x-3"
                    : "bg-transparent border-white/5 text-gray-600 grayscale opacity-40"
                }`}
            >
              {/* Indicador lateral */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 bg-orange-500 rounded-full shadow-[0_0_10px_orange]" />
              )}

              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-orange-400" : "text-gray-500"
                }`}
              />

              <span
                className={`font-medium text-sm ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>

              {/* Brilho interno */}
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-orange-500/5 to-transparent rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
