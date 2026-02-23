import Link from "next/link";
import { notFound } from "next/navigation";
import { getStitchedScreenBySlug } from "../_lib/stitched-screens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StitchedScreenPreviewPage({
    params,
}: {
    params: { slug: string };
}) {
    const screen = await getStitchedScreenBySlug(params.slug);
    if (!screen) notFound();

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 md:text-xl">{screen.displayName}</h1>
                    <p className="mt-1 text-xs text-gray-500">{screen.folderName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/stitched"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        All Screens
                    </Link>
                    <Link
                        href={`/stitched/${screen.slug}/raw`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                    >
                        Open Raw
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <iframe
                    title={screen.displayName}
                    src={`/stitched/${screen.slug}/raw`}
                    className="h-[85vh] w-full"
                />
            </div>
        </section>
    );
}
