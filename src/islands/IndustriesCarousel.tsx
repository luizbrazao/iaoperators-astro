import React from "react";
import type { ReactElement } from "react";
import {
  ShoppingBasket,
  Utensils,
  Scale,
  GraduationCap,
  Megaphone,
  Building,
} from "lucide-react";

type Industry = { title?: string; description?: string };

type Props = {
  industries?: Industry[];
  cardBgImg: string;
};

const ICONS = [
  ShoppingBasket,
  Utensils,
  Scale,
  GraduationCap,
  Megaphone,
  Building,
] as const;

const fallbackTitles = [
  "Tiendas Online (E-commerce)",
  "Restaurantes y Bares",
  "Despachos de Abogados",
  "Escuelas y Cursos Online",
  "Agencias de Marketing",
  "Inmobiliarias",
];

const fallbackDescs = [
  "Atención 24/7, recomendaciones personalizadas y gestión de inventario sin fallos.",
  "Pedidos automáticos, inventario en tiempo real y menús según el clima.",
  "Automatiza plazos, análisis de documentos e investigación jurídica.",
  "Corrección automática, planes personalizados y gestión de matrículas.",
  "Informes automáticos, análisis de campañas y creación de contenido con IA.",
  "Gestión de leads, visitas y análisis de mercado en tiempo real.",
];

export default function IndustriesCarousel({ industries = [], cardBgImg }: Props): ReactElement {
  const items = (Array.isArray(industries) && industries.length ? industries : new Array(6).fill({})).slice(0, 6);

  return (
    <div className="relative">
      <div className="flex gap-0 overflow-x-auto scroll-smooth snap-x snap-mandatory -ml-4 md:-ml-6 pb-4">
        {items.map((item, index) => {
          const Icon = ICONS[index] ?? ICONS[0];
          const title = (item?.title && String(item.title)) || fallbackTitles[index] || "Industria";
          const description = (item?.description && String(item.description)) || fallbackDescs[index] || "";

          return (
            <div
              key={index}
              className="snap-start basis-[80%] md:basis-1/2 lg:basis-1/3 pl-4 md:pl-6 shrink-0"
            >
              <div className="group h-full bg-[#0a0a0a] border border-white/5 hover:border-orange-500/30 rounded-3xl p-8 shadow-lg flex flex-col items-center transition-all hover:-translate-y-1">
                <div
                  className="h-24 w-24 rounded-full mb-6 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform"
                  style={{
                    backgroundImage: `url(${cardBgImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10">
                    <Icon className="text-orange-500" size={32} strokeWidth={2} />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-center text-white">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed text-center">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
