import { MetadataRoute } from "next";

const BASE_URL = "https://hmarepanditji.com";

// Static ritual slugs for SEO — expand as you add real DB slugs
const RITUAL_SLUGS = [
  "griha-pravesh",
  "satyanarayan-katha",
  "vivah-sanskar",
  "namkaran",
  "rudrabhishek",
  "sunderkand-path",
  "shanti-path",
  "mundan-sanskar",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/pandits`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const ritualPages: MetadataRoute.Sitemap = RITUAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/rituals/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...ritualPages];
}
