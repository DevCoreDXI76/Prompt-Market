import type { MetadataRoute } from "next";

const BASE_URL = "https://prompt-market.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en/"],
        disallow: [
          "/api/",
          "/admin/",
          "/en/admin/",
          "/cart",
          "/en/cart",
          "/checkout",
          "/en/checkout",
          "/my-page",
          "/en/my-page",
          "/profile",
          "/en/profile",
          "/login",
          "/en/login",
          "/sign-in",
          "/en/sign-in",
          "/sign-up",
          "/en/sign-up",
          "/auth/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
