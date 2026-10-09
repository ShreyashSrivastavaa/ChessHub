import { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/config/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${BUSINESS_CONFIG.siteUrl}/sitemap.xml`,
  };
}
