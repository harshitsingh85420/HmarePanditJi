import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://hmarepanditji.com";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    let panditRoutes: MetadataRoute.Sitemap = [];

    try {
        const res = await fetch(`${apiBase}/api/v1/pandits?verificationStatus=VERIFIED&limit=500`, {
            next: { revalidate: 3600 },
        });

        if (res.ok) {
            const data = await res.json();
            const pandits = data?.data?.pandits || [];
            panditRoutes = pandits
                .filter((pandit: { id?: string }) => Boolean(pandit.id))
                .map((pandit: { id: string }) => ({
                    url: `${baseUrl}/pandit/${pandit.id}`,
                    lastModified: new Date(),
                    changeFrequency: "weekly" as const,
                    priority: 0.8,
                }));
        }
    } catch {
        // Skip dynamic entries if API is unavailable during build.
        panditRoutes = [];
    }

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/muhurat`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/cancellation-policy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/refund`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    return [...staticRoutes, ...panditRoutes];
}