import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prompt Market",
    short_name: "PromptMarket",
    description:
      "검증된 고품질 AI 프롬프트를 탐색하고 구매할 수 있는 마켓플레이스",
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
