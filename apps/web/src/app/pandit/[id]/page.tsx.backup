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
  const name = pandit?.displayName ?? "Verified Pandit Ji";
  const city = pandit?.city ?? "Delhi-NCR";
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
      type: "profile",
      images: pandit?.profilePhotoUrl ? [{ url: pandit.profilePhotoUrl }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── Structured Data (JSON-LD) ─────────────────────────────────────────────────

function JsonLd({ panditId }: { panditId: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://hmarepanditji.in/pandit/${panditId}`,
        name: "Pandit Ji",
        jobTitle: "Vedic Priest",
        worksFor: {
          "@type": "Organization",
          name: "HmarePanditJi",
          url: "https://hmarepanditji.in",
        },
        address: {
          "@type": "PostalAddress",
          addressRegion: "Delhi",
          addressCountry: "IN",
        },
        knowsAbout: ["Hindu Rituals", "Vedic Ceremonies", "Sanskrit"],
      },
      {
        "@type": "LocalBusiness",
        name: "HmarePanditJi",
        description: "Book Aadhaar-verified Hindu priests for ceremonies in Delhi-NCR.",
        url: "https://hmarepanditji.in",
        areaServed: "Delhi NCR, India",
        "@id": "https://hmarepanditji.in",
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
            <span className="text-slate-400 text-sm">Loading profile…</span>
          </div>
        }
      >
        <ProfileClient panditId={params.id} initialData={pandit} />
      </Suspense>
    </>
  );
}
