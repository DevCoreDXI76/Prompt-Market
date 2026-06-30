import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prompt Market",
    short_name: "PromptMarket",
    description:
      "Marketplace for verified, high-quality AI prompts",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
    categories: ["shopping", "productivity", "utilities"],
    lang: "ko",
    dir: "ltr",
  };
}
