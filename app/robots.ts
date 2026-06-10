import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: ["/", "/pricing", "/contact"],
        disallow: ["/admin/", "/api/", "/safe"],
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
