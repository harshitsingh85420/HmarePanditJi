import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Muhurat Calendar 2026 — Auspicious Dates',
    description: 'Explore auspicious dates and muhurat for Hindu ceremonies in 2026.',
};

export default function MuhuratLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
