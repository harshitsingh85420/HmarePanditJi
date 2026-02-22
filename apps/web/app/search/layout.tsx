import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find Pandits Near You',
    description: 'Search and find verified Pandits for any Hindu ceremony based on your location and preferences.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
