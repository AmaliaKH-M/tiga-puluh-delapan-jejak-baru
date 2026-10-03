import { useState } from "react";
import { asset, cn } from "@/lib/utils";

export type BannerConfig = {
  src: string;
  fit?: "cover" | "contain";
  position?: string;
  opacity?: number;
  alt?: string;
};

export function BannerImage({ config, className }: { config: BannerConfig; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  const { src, fit = "cover", position = "center", opacity = 1, alt = "" } = config;
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-0 overflow-hidden", className)} aria-hidden={!alt}>
      <img
        src={asset(src)} alt={alt} onError={() => setOk(false)}
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain p-6 md:p-10")}
        style={{
          objectPosition: position,
          opacity,
          maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 45%, black 65%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 45%, black 65%, transparent)",
        }}
      />
    </div>
  );
}