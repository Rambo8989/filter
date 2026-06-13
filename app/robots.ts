import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/campaigns/", "/logs/", "/api/"],
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: ["/", "/pricing", "/contact"],
        disallow: ["/dashboard/", "/campaigns/", "/logs/", "/api/", "/safe"],
      },
      // Block ad verification bots specifically
      {
        userAgent: ["integralads-crawler", "ias-crawler", "doubleverify", "moat"],
        disallow: "/",
      },
    ],
    sitemap: "https://yoursite.com/sitemap.xml",
  }
}
