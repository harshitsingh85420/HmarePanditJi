import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileClient from "./profile-client";

// ── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

// ── API helpers ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function getPandit(id: string) {
  try {
    const res = await fetch(`${API_URL}/pandits/${id}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Dynamic Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pandit = await getPandit(params.id);
  const name = pandit?.displayName ?? &quot;Verified Pandit Ji&quot;;
  const city = pandit?.city ?? &quot;Delhi-NCR&quot;;
  const rating = pandit?.averageRating ?? 4.9;
  const reviews = pandit?.totalReviews ?? 0;

  const title = `${name} — Verified Pandit in ${city} | HmarePanditJi`;
  const description = pandit?.bio
    ? `${pandit.bio.slice(0, 155)}…`
    : `Book ${name}, an Aadhaar-verified pandit in ${city} with ${rating} rating and ${reviews} reviews. Expert in Vedic rituals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: &quot;profile&quot;,
      images: pandit?.profilePhotoUrl ? [{ url: pandit.profilePhotoUrl }] : [],
    },
    twitter: { card: &quot;summary_large_image&quot;, title, description },
    robots: { index: true, follow: true },
  };
}

// ── Structured Data (JSON-LD) ─────────────────────────────────────────────────

function JsonLd({ panditId }: { panditId: string }) {
  const schema = {
    &quot;@context&quot;: &quot;https://schema.org&quot;,
    &quot;@graph&quot;: [
      {
        &quot;@type&quot;: &quot;Person&quot;,
        &quot;@id&quot;: `https://hmarepanditji.in/pandit/${panditId}`,
        name: &quot;Pandit Ji&quot;,
        jobTitle: &quot;Vedic Priest&quot;,
        worksFor: {
          &quot;@type&quot;: &quot;Organization&quot;,
          name: &quot;HmarePanditJi&quot;,
          url: &quot;https://hmarepanditji.in&quot;,
        },
        address: {
          &quot;@type&quot;: &quot;PostalAddress&quot;,
          addressRegion: &quot;Delhi&quot;,
          addressCountry: &quot;IN&quot;,
        },
        knowsAbout: [&quot;Hindu Rituals&quot;, &quot;Vedic Ceremonies&quot;, &quot;Sanskrit&quot;],
      },
      {
        &quot;@type&quot;: &quot;LocalBusiness&quot;,
        name: &quot;HmarePanditJi&quot;,
        description: &quot;Book Aadhaar-verified Hindu priests for ceremonies in Delhi-NCR.&quot;,
        url: &quot;https://hmarepanditji.in&quot;,
        areaServed: &quot;Delhi NCR, India&quot;,
        &quot;@id&quot;: &quot;https://hmarepanditji.in&quot;,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PanditProfilePage({ params }: PageProps) {
  const pandit = await getPandit(params.id);

  return (
    <>
      <JsonLd panditId={params.id} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
            <span className="text-slate-400 text-lg">Loading profile…</span>
          </div>
        }
      >
        <ProfileClient panditId={params.id} initialData={pandit} />
      </Suspense>
    </>
  );
}
