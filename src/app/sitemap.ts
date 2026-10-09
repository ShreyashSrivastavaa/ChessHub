import { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/config/business";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BUSINESS_CONFIG.siteUrl;

  const routes = ["", "/how-it-works", "/about", "/pricing", "/contact", "/book"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : route === "/book" ? 0.9 : 0.8,
    })
  );

  return routes;
}
